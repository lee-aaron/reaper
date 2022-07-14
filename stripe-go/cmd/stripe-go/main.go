package main

import (
	internalHTTP "github.com/lee-aaron/stripe-go/internal/pkg/http"
	"github.com/lee-aaron/stripe-go/utils"
	_ "github.com/lib/pq"
	"github.com/stripe/stripe-go/v72"
)

var config = utils.LoadYaml()

func main() {
	stripe.Key = config.Stripe.Secret_key

	internalHTTP.StartRPC(config.Payments.Host, config.Payments.Port)
}
