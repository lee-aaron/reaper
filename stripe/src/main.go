package main

import (
	"fmt"
	"log"
	"net"

	"github.com/lee-aaron/stripe-go/utils"
	"github.com/stripe/stripe-go/v72"
	"go.uber.org/zap"

	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	grpc_zap "github.com/grpc-ecosystem/go-grpc-middleware/logging/zap"
	"google.golang.org/grpc"
)

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

func main() {
	config := utils.LoadYaml()
	stripe.Key = config.Stripe.Secret_key

	listen, err := net.Listen("tcp", fmt.Sprintf("%s:%d", config.Payments.Host, config.Payments.Port))
	if err != nil {
		log.Fatal(err)
	}

	log.Printf("Listening on %s:%d", config.Payments.Host, config.Payments.Port)

	grpcServer := NewGRPCServer()
	if err := grpcServer.Serve(listen); err != nil {
		log.Fatal(err)
	}
}
