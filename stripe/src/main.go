package main

import (
	"fmt"
	"log"
	"net"
	"net/http"

	"github.com/lee-aaron/stripe-go/utils"
	"github.com/stripe/stripe-go/v72"
	"go.uber.org/zap"

	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	grpc_zap "github.com/grpc-ecosystem/go-grpc-middleware/logging/zap"
	"google.golang.org/grpc"
)

var config = utils.LoadYaml()

func NewGRPCServer() *grpc.Server {
	grpcServer := grpc.NewServer(
		grpc.StreamInterceptor(grpc_middleware.ChainStreamServer(
			grpc_zap.StreamServerInterceptor(zap.NewExample()),
		)),
		grpc.UnaryInterceptor(grpc_middleware.ChainUnaryServer(
			grpc_zap.UnaryServerInterceptor(zap.NewExample()),
		)))
	prod := ProductServer{}
	price := PricesServer{}
	cus := CustomerServer{}
	sub := SubscriptionServer{}
	portal := PortalServer{}
	account := AccountServer{}
	account.Register(grpcServer, &account)
	portal.Register(grpcServer, &portal)
	sub.Register(grpcServer, &sub)
	cus.Register(grpcServer, &cus)
	prod.Register(grpcServer, &prod)
	price.Register(grpcServer, &price)
	return grpcServer
}

func NewWebhook() {
	http.HandleFunc("/webhook", HandleWebhook)

	log.Printf("Webhook listening on %s:%d", config.Payments.Host, config.Payments.WebhookPort)

	err := http.ListenAndServe(fmt.Sprintf("%s:%d", config.Payments.Host, config.Payments.WebhookPort), nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}

func main() {
	stripe.Key = config.Stripe.Secret_key

	go NewWebhook()

	listen, err := net.Listen("tcp", fmt.Sprintf("%s:%d", config.Payments.Host, config.Payments.Port))
	if err != nil {
		log.Fatal(err)
	}

	log.Printf("GRPC Server listening on %s:%d", config.Payments.Host, config.Payments.Port)

	grpcServer := NewGRPCServer()
	if err := grpcServer.Serve(listen); err != nil {
		log.Fatal(err)
	}
}
