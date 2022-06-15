## Generate Files from Proto

```
protoc proto/*.proto --go_out=. --go_opt=module=github.com/lee-aaron/stripe-go --go-grpc_out=. --g
o-grpc_opt=module=github.com/lee-aaron/stripe-go --proto_path=.
```

## Subscription Notes

### Customer Subscribing
- Create a subscription using Customer ID (https://stripe.com/docs/billing/subscriptions/build-subscriptions?ui=elements)
- Add Destination AccountID (Guild Owner) via PaymentIntentParams
- Subscription / Subscription Item uses Product & Price ID
- Add ApplicationFeeAmount to Customer Invoice on CustomerID & Collect Automatically

### Guild Owner Creating Subscription
- Have owner make a Stripe account first - Express Account
- Create a Product & Price ID