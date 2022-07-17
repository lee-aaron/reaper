package http

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"

	"github.com/bwmarrin/discordgo"
	"github.com/stripe/stripe-go/v72"
	"github.com/stripe/stripe-go/v72/webhook"
)

const (
	WebHookEndpoint  = "/webhook"
	BotCheckEndpoint = "/botcheck"
	RolesEndpoint    = "/roles"
)

func NewServer(db *sql.DB, session *discordgo.Session, port string) *http.Server {
	mux := http.NewServeMux()

	mux.HandleFunc(WebHookEndpoint, webhookHandler(db, session))
	mux.HandleFunc(BotCheckEndpoint, botCheckHandler(session))
	mux.HandleFunc(RolesEndpoint, roleHandler(session))

	return &http.Server{
		Addr:    "0.0.0.0:" + port,
		Handler: mux,
	}
}

func botCheckHandler(session *discordgo.Session) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "GET" {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		serverId, ok := r.URL.Query()["server_id"]
		if !ok || len(serverId) != 1 {
			http.Error(w, "Incorrect server_id query parameter", http.StatusBadRequest)
			return
		}

		_, err := session.State.Guild(serverId[0])
		if err != nil {
			w.WriteHeader(http.StatusNotFound)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}

func filter(roles []*discordgo.Role) (r []*discordgo.Role) {
	for _, role := range roles {
		if !role.Managed {
			r = append(r, role)
		}
	}
	return
}

func roleHandler(session *discordgo.Session) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "GET" {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		serverId, ok := r.URL.Query()["server_id"]
		if !ok || len(serverId) != 1 {
			http.Error(w, "Incorrect server_id query parameter", http.StatusBadRequest)
			return
		}

		st, err := session.GuildRoles(serverId[0])
		if err != nil {
			http.Error(w, "Error getting roles", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")

		json.NewEncoder(w).Encode(filter(st))
		w.WriteHeader(http.StatusOK)
	}
}

func webhookHandler(db *sql.DB, session *discordgo.Session) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "POST" {
			http.Error(w, http.StatusText(http.StatusMethodNotAllowed), http.StatusMethodNotAllowed)
			return
		}
		const MaxBodyBytes = int64(65536)
		r.Body = http.MaxBytesReader(w, r.Body, MaxBodyBytes)
		b, err := ioutil.ReadAll(r.Body)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			log.Printf("ioutil.ReadAll: %v", err)
			return
		}

		event, err := webhook.ConstructEvent(b, r.Header.Get("Stripe-Signature"), os.Getenv("STRIPE_WEBHOOK_SECRET"))
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			log.Printf("webhook.ConstructEvent: %v", err)
			return
		}

		ctx := context.Background()

		switch event.Type {
		case "account.updated":
			// If account can receive payments then update the status in the accounts database
			var account stripe.Account
			err := json.Unmarshal(event.Data.Raw, &account)
			if err != nil {
				fmt.Fprintf(os.Stderr, "Error unmarshalling account.updated webhook: %v\n", err)
				w.WriteHeader(http.StatusBadRequest)
				return
			}

			if account.PayoutsEnabled {
				// Update the account status in the database
				tx, err := db.BeginTx(ctx, nil)
				if err != nil {
					fmt.Fprintf(os.Stderr, "Error starting transaction: %v\n", err)
					w.WriteHeader(http.StatusInternalServerError)
					return
				}
				defer tx.Rollback()

				_, err = tx.ExecContext(ctx, "UPDATE owners SET status = 'verified' WHERE stripe_id = $1", account.ID)
				if err != nil {
					fmt.Fprintf(os.Stderr, "Error updating account status in database: %v\n", err)
					w.WriteHeader(http.StatusInternalServerError)
					return
				}
				err = tx.Commit()
				if err != nil {
					fmt.Fprintf(os.Stderr, "Error committing transaction: %v\n", err)
					w.WriteHeader(http.StatusInternalServerError)
					return
				}
			}
		case "invoice.paid":
			// Continue to provision the subscription as payments continue to be made.
			// Store the status in your database and check when a user accesses your service.
			// This approach helps you avoid hitting rate limits.

			var invoice stripe.Invoice
			err := json.Unmarshal(event.Data.Raw, &invoice)
			if err != nil {
				fmt.Fprintf(os.Stderr, "Error unmarshalling invoice.paid webhook: %+v\n", err)
				w.WriteHeader(http.StatusBadRequest)
				return
			}
			if invoice.Status == "paid" && invoice.Subscription != nil {
				// Update the status in the cus_subscriptions database
				tx, err := db.BeginTx(ctx, nil)
				if err != nil {
					fmt.Fprintf(os.Stderr, "Error starting transaction: %v\n", err)
					w.WriteHeader(http.StatusInternalServerError)
					return
				}
				defer tx.Rollback()

				_, err = tx.ExecContext(ctx, "UPDATE cus_subscriptions SET status = 'paid' WHERE sub_id = $1", invoice.Subscription.ID)
				if err != nil {
					fmt.Fprintf(os.Stderr, "Error updating subscription status in database: %v\n", err)
					w.WriteHeader(http.StatusInternalServerError)
					return
				}

				// increment number of subscribed
				_, err = tx.ExecContext(ctx, "UPDATE sub_info SET num_subscribed = num_subscribed + 1 WHERE prod_id = (select prod_id from cus_subscriptions where sub_id = $1)", invoice.Subscription.ID)
				if err != nil {
					fmt.Fprintf(os.Stderr, "Error updating subscription status in database: %v\n", err)
					w.WriteHeader(http.StatusInternalServerError)
					return
				}

				// Provision the subscription requires user's access token
				var serverId string
				var userId string
				if err = tx.QueryRowContext(ctx, "SELECT server_id, discord_id FROM cus_subscriptions WHERE sub_id = $1", invoice.Subscription.ID).Scan(&serverId, &userId); err != nil {
					fmt.Fprintf(os.Stderr, "Error getting server_id, discord_id from database: %v\n", err)
					w.WriteHeader(http.StatusInternalServerError)
					error_customer_status(ctx, db, invoice.Subscription.ID)
					return
				}

				var accessToken string
				if err = tx.QueryRowContext(ctx, "SELECT access_token from tokens WHERE discord_id = $1", userId).Scan(&accessToken); err != nil {
					fmt.Fprintf(os.Stderr, "Error getting access token: %v\n", err)
					w.WriteHeader(http.StatusInternalServerError)
					error_customer_status(ctx, db, invoice.Subscription.ID)
					return
				}

				var roleId sql.NullString
				var roles []string
				if err = tx.QueryRowContext(ctx, "SELECT role_id FROM cus_subscriptions WHERE discord_id = $1 and server_id = $2", userId, serverId).Scan(&roleId); err != nil {
					fmt.Println("Error querying for role: " + err.Error())
					return
				}

				if roleId.Valid {
					roles = append(roles, roleId.String)
				}

				err = session.GuildMemberAdd(accessToken, serverId, userId, "", roles, false, false)
				if err != nil {
					fmt.Fprintf(os.Stderr, "Error provisioning subscription: %v\n", err)
					w.WriteHeader(http.StatusInternalServerError)
					error_customer_status(ctx, db, invoice.Subscription.ID)
					return
				}

				// Remove access token from database
				_, err = tx.ExecContext(ctx, "DELETE FROM tokens WHERE discord_id = $1", userId)
				if err != nil {
					fmt.Fprintf(os.Stderr, "Error deleting access token: %v\n", err)
					w.WriteHeader(http.StatusInternalServerError)
					return
				}

				err = tx.Commit()
				if err != nil {
					fmt.Fprintf(os.Stderr, "Error committing transaction: %v\n", err)
					w.WriteHeader(http.StatusInternalServerError)
					return
				}
			}
		case "invoice.payment_failed":
			// The payment failed or the customer does not have a valid payment method.
			// The subscription becomes past_due. Notify your customer and send them to the
			// customer portal to update their payment information.
			var invoice stripe.Invoice
			err := json.Unmarshal(event.Data.Raw, &invoice)
			if err != nil {
				fmt.Fprintf(os.Stderr, "Error unmarshalling invoice.paid webhook: %+v\n", err)
				w.WriteHeader(http.StatusBadRequest)
				return
			}
			if invoice.Subscription != nil {
				// Update the status in the cus_subscriptions database
				tx, err := db.BeginTx(ctx, nil)
				if err != nil {
					fmt.Fprintf(os.Stderr, "Error starting transaction: %v\n", err)
					w.WriteHeader(http.StatusInternalServerError)
					return
				}
				defer tx.Rollback()

				_, err = tx.ExecContext(ctx, "UPDATE cus_subscriptions SET status = 'pending' WHERE sub_id = $1", invoice.Subscription.ID)
				if err != nil {
					fmt.Fprintf(os.Stderr, "Error updating subscription status in database: %v\n", err)
					w.WriteHeader(http.StatusInternalServerError)
					return
				}
				err = tx.Commit()
				if err != nil {
					fmt.Fprintf(os.Stderr, "Error committing transaction: %v\n", err)
					w.WriteHeader(http.StatusInternalServerError)
					return
				}
			}
		case "customer.subscription.deleted":
			// The subscription has been cancelled.
			var subscription stripe.Subscription
			err := json.Unmarshal(event.Data.Raw, &subscription)
			if err != nil {
				fmt.Fprintf(os.Stderr, "Error unmarshalling customer.subscription.deleted webhook: %+v\n", err)
				w.WriteHeader(http.StatusBadRequest)
				return
			}

			// Remove the subscription from the cus_subscriptions database
			tx, err := db.BeginTx(ctx, nil)
			if err != nil {
				fmt.Fprintf(os.Stderr, "Error starting transaction: %v\n", err)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			defer tx.Rollback()

			var serverId string
			var userId string
			var prodId string
			if err = tx.QueryRowContext(ctx, "SELECT server_id, discord_id, prod_id FROM cus_subscriptions WHERE sub_id = $1", subscription.ID).Scan(&serverId, &userId, &prodId); err != nil {
				fmt.Fprintf(os.Stderr, "Error getting server_id, discord_id from database: %v\n", err)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}

			_, err = tx.ExecContext(ctx, "DELETE FROM cus_subscriptions WHERE sub_id = $1", subscription.ID)
			if err != nil {
				fmt.Fprintf(os.Stderr, "Error deleting subscription from database: %v\n", err)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}

			_, err = tx.ExecContext(ctx, "UPDATE sub_info SET num_subscribed = num_subscribed - 1 WHERE prod_id = $1", prodId)
			if err != nil {
				fmt.Fprintf(os.Stderr, "Error updating subscription count in database: %v\n", err)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}

			err = tx.Commit()
			if err != nil {
				fmt.Fprintf(os.Stderr, "Error committing transaction: %v\n", err)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}

			// Remove user from discord server
			err = session.GuildMemberDelete(serverId, userId)
			if err != nil {
				fmt.Fprintf(os.Stderr, "Error removing user from discord server: %v\n", err)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}

		case "customer.subscription.updated":

			var subscription stripe.Subscription
			err := json.Unmarshal(event.Data.Raw, &subscription)
			if err != nil {
				fmt.Fprintf(os.Stderr, "Error unmarshalling customer.subscription.updated webhook: %+v\n", err)
				w.WriteHeader(http.StatusBadRequest)
				return
			}

			// Remove pending subscription from the database
			if subscription.Status == stripe.SubscriptionStatusIncompleteExpired {

				tx, err := db.BeginTx(ctx, nil)
				if err != nil {
					fmt.Fprintf(os.Stderr, "Error starting transaction: %v\n", err)
					w.WriteHeader(http.StatusInternalServerError)
					return
				}
				defer tx.Rollback()

				_, err = tx.ExecContext(ctx, "DELETE FROM cus_subscriptions WHERE sub_id = $1", subscription.ID)
				if err != nil {
					fmt.Fprintf(os.Stderr, "Error deleting subscription from database: %v\n", err)
					w.WriteHeader(http.StatusInternalServerError)
					return
				}

				err = tx.Commit()
				if err != nil {
					fmt.Fprintf(os.Stderr, "Error committing transaction: %v\n", err)
					w.WriteHeader(http.StatusInternalServerError)
					return
				}
			}

		case "product.deleted":
			// The product has been deleted.
			var product stripe.Product
			err := json.Unmarshal(event.Data.Raw, &product)
			if err != nil {
				fmt.Fprintf(os.Stderr, "Error unmarshalling product.deleted webhook: %+v\n", err)
				w.WriteHeader(http.StatusBadRequest)
				return
			}

			// Remove the product from the products database
			tx, err := db.BeginTx(ctx, nil)
			if err != nil {
				fmt.Fprintf(os.Stderr, "Error starting transaction: %v\n", err)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}

			_, err = tx.ExecContext(ctx, "DELETE FROM sub_info WHERE prod_id = $1", product.ID)
			if err != nil {
				fmt.Fprintf(os.Stderr, "Error deleting product from database: %v\n", err)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}

			// Remove price from the price database
			if product.DefaultPrice != nil {
				_, err = tx.ExecContext(ctx, "DELETE FROM sub_price WHERE price_id = $1", product.DefaultPrice.ID)
				if err != nil {
					fmt.Fprintf(os.Stderr, "Error deleting price from database: %v\n", err)
					w.WriteHeader(http.StatusInternalServerError)
					return
				}
			}

			err = tx.Commit()
			if err != nil {
				fmt.Fprintf(os.Stderr, "Error committing transaction: %v\n", err)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}

		default:
			// unhandled event type
			fmt.Fprintf(os.Stderr, "Unhandled event type: %s\n", event.Type)
		}

		w.WriteHeader(http.StatusOK)
	}
}

func error_customer_status(ctx context.Context, db *sql.DB, id string) {
	// sets the cus subscription status to error
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error starting transaction: %v\n", err)
		return
	}

	_, err = tx.ExecContext(ctx, "UPDATE cus_subscriptions SET status = 'error' WHERE cus_id = $1", id)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error updating cus_subscription status: %v\n", err)
		return
	}

	err = tx.Commit()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error committing transaction: %v\n", err)
		return
	}
}
