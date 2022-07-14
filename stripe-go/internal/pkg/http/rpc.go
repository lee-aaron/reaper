package http

import (
	"errors"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	grpc_zap "github.com/grpc-ecosystem/go-grpc-middleware/logging/zap"
	stripeGrpc "github.com/lee-aaron/stripe-go/internal/pkg/stripe-grpc"
	"go.uber.org/zap"
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
	prod := stripeGrpc.ProductServer{}
	price := stripeGrpc.PricesServer{}
	cus := stripeGrpc.CustomerServer{}
	sub := stripeGrpc.SubscriptionServer{}
	portal := stripeGrpc.PortalServer{}
	account := stripeGrpc.AccountServer{}
	account.Register(grpcServer, &account)
	portal.Register(grpcServer, &portal)
	sub.Register(grpcServer, &sub)
	cus.Register(grpcServer, &cus)
	prod.Register(grpcServer, &prod)
	price.Register(grpcServer, &price)
	return grpcServer
}

func StartRPC(host string, port uint) {
	listen, err := net.Listen("tcp", fmt.Sprintf("%s:%d", host, port))
	stop := make(chan os.Signal, 1)

	if err != nil {
		log.Fatal(err)
	}

	log.Printf("GRPC Server listening on %s:%d", host, port)

	grpcServer := NewGRPCServer()

	go func() {
		if err := grpcServer.Serve(listen); err != nil {
			if !errors.Is(err, http.ErrServerClosed) {
				stop <- syscall.SIGTERM
			}
		}
	}()

	signal.Notify(stop, syscall.SIGTERM)
	<-stop
}
