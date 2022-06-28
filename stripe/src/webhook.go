package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"

	"github.com/stripe/stripe-go/v72"
	"github.com/stripe/stripe-go/v72/webhook"
)

func HandleWebhook(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, http.StatusText(http.StatusMethodNotAllowed), http.StatusMethodNotAllowed)
		return
	}
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
			// send PATCH request to API to update the account status
			payload, err := json.Marshal(account.ID)
			if err != nil {
				fmt.Fprintf(os.Stderr, "Error marshalling account.updated webhook: %v\n", err)
				w.WriteHeader(http.StatusBadRequest)
				return
			}

			client := &http.Client{}
			url := fmt.Sprintf("http://%s:%d/v1/update_account", config.Application.Host, config.Application.Port)
			req, err := http.NewRequest(http.MethodPatch, url, bytes.NewBuffer(payload))
			if err != nil {
				fmt.Fprintf(os.Stderr, "Error creating request for account.updated webhook: %v\n", err)
				w.WriteHeader(http.StatusBadRequest)
				return
			}

			req.Header.Set("Content-Type", "application/json")
			// better security is to generate UUID v4 and store it in DB
			req.Header.Set("X-Guarded", "0xdeadbeef0x")
			if err != nil {
				fmt.Fprintf(os.Stderr, "Error creating request: %v\n", err)
				w.WriteHeader(http.StatusBadRequest)
				return
			}

			_, err = client.Do(req)
			if err != nil {
				fmt.Fprintf(os.Stderr, "Error sending request: %v\n", err)
				w.WriteHeader(http.StatusBadRequest)
				return
			}
		}
	case "invoice.paid":
		// Continue to provision the subscription as payments continue to be made.
		// Store the status in your database and check when a user accesses your service.
		// This approach helps you avoid hitting rate limits.
	case "invoice.payment_failed":
		// The payment failed or the customer does not have a valid payment method.
		// The subscription becomes past_due. Notify your customer and send them to the
		// customer portal to update their payment information.
	case "customer.subscription.deleted":
		// The subscription has been cancelled.
	case "customer.subscription.updated":
		// The subscription has been updated.
		// Check status field to determine if the subscription is active or past_due.
		// Provision the subscription
	default:
		// unhandled event type
		fmt.Fprintf(os.Stderr, "Unhandled event type: %s\n", event.Type)
	}

	w.WriteHeader(http.StatusOK)
}
