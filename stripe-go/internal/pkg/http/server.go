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
	WebHookEndpoint = "/webhook"
)

func NewServer(db *sql.DB, session *discordgo.Session, port string) *http.Server {
	mux := http.NewServeMux()

	mux.HandleFunc(WebHookEndpoint, webhookHandler(db, session))

	return &http.Server{
		Addr:    "0.0.0.0:" + port,
		Handler: mux,
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

				res, err := tx.ExecContext(ctx, "UPDATE owners SET status = 'verified' WHERE stripe_id = $1", account.ID)
				if err != nil {
					fmt.Fprintf(os.Stderr, "Error updating account status in database: %v\n", err)
					w.WriteHeader(http.StatusInternalServerError)
					return
				}
				rowsAffected, err := res.RowsAffected()
				if err != nil {
					fmt.Fprintf(os.Stderr, "Error getting rows affected: %v\n", err)
					w.WriteHeader(http.StatusInternalServerError)
					return
				}
				if rowsAffected != 1 {
					fmt.Fprintf(os.Stderr, "Expected to update one row but got %d rows affected\n", rowsAffected)
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

				res, err := tx.ExecContext(ctx, "UPDATE cus_subscriptions SET status = 'paid' WHERE sub_id = $1", invoice.Subscription.ID)
				if err != nil {
					fmt.Fprintf(os.Stderr, "Error updating subscription status in database: %v\n", err)
					w.WriteHeader(http.StatusInternalServerError)
					return
				}
				rowsAffected, err := res.RowsAffected()
				if err != nil {
					fmt.Fprintf(os.Stderr, "Error getting rows affected: %v\n", err)
					w.WriteHeader(http.StatusInternalServerError)
					return
				}
				if rowsAffected != 1 {
					fmt.Fprintf(os.Stderr, "Expected to update one row but got %d rows affected\n", rowsAffected)
					w.WriteHeader(http.StatusInternalServerError)
					return
				}
				err = tx.Commit()
				if err != nil {
					fmt.Fprintf(os.Stderr, "Error committing transaction: %v\n", err)
					w.WriteHeader(http.StatusInternalServerError)
					return
				}

				// Provision the subscription requires user's access token

				// Remove access token from database
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

				res, err := tx.ExecContext(ctx, "UPDATE cus_subscriptions SET status = 'pending' WHERE sub_id = $1", invoice.Subscription.ID)
				if err != nil {
					fmt.Fprintf(os.Stderr, "Error updating subscription status in database: %v\n", err)
					w.WriteHeader(http.StatusInternalServerError)
					return
				}
				rowsAffected, err := res.RowsAffected()
				if err != nil {
					fmt.Fprintf(os.Stderr, "Error getting rows affected: %v\n", err)
					w.WriteHeader(http.StatusInternalServerError)
					return
				}
				if rowsAffected != 1 {
					fmt.Fprintf(os.Stderr, "Expected to update one row but got %d rows affected\n", rowsAffected)
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
			if err = tx.QueryRowContext(ctx, "SELECT server_id, discord_id FROM cus_subscriptions WHERE sub_id = $1", subscription.ID).Scan(&serverId, &userId); err != nil {
				fmt.Fprintf(os.Stderr, "Error getting server_id, discord_id from database: %v\n", err)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}

			res, err := tx.ExecContext(ctx, "DELETE FROM cus_subscriptions WHERE sub_id = $1", subscription.ID)
			if err != nil {
				fmt.Fprintf(os.Stderr, "Error deleting subscription from database: %v\n", err)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			rowsAffected, err := res.RowsAffected()
			if err != nil {
				fmt.Fprintf(os.Stderr, "Error getting rows affected: %v\n", err)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			if rowsAffected != 1 {
				fmt.Fprintf(os.Stderr, "Expected to delete one row but got %d rows affected\n", rowsAffected)
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

		default:
			// unhandled event type
			fmt.Fprintf(os.Stderr, "Unhandled event type: %s\n", event.Type)
		}

		w.WriteHeader(http.StatusOK)
	}
}
