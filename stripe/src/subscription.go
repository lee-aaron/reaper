package main

import (
	"context"

	pb "github.com/lee-aaron/stripe-go/subscription"
	"github.com/stripe/stripe-go/v72"
	"github.com/stripe/stripe-go/v72/sub"
	"google.golang.org/grpc"
)

type SubscriptionServer struct {
	pb.UnimplementedSubscriptionHandlerServer
}

func (srv *SubscriptionServer) Register(s *grpc.Server, ss *SubscriptionServer) {
	pb.RegisterSubscriptionHandlerServer(s, ss)
}

func (srv *SubscriptionServer) CreateSubscription(ctx context.Context, req *pb.CreateSubscriptionRequest) (*pb.CreateSubscriptionReply, error) {

	params := &stripe.SubscriptionParams{
		Customer: stripe.String(req.CustomerId),
		Items: []*stripe.SubscriptionItemsParams{
			{
				Price: stripe.String(req.PriceId),
			},
		},
		PaymentBehavior: stripe.String("default_incomplete"),
	}

	params.AddExpand("latest_invoice.payment_intent")
	s, err := sub.New(params)

	if err != nil {
		return nil, err
	}

	return &pb.CreateSubscriptionReply{
		SubscriptionId: s.ID,
		ClientSecret:   s.LatestInvoice.PaymentIntent.ClientSecret,
	}, nil
}
