package main

import (
	"context"

	pb "github.com/lee-aaron/stripe-go/subscription"
	"github.com/stripe/stripe-go/v72"
	"github.com/stripe/stripe-go/v72/product"
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
	prod := &stripe.ProductParams{}
	prod.SetStripeAccount(req.StripeAccount)

	// fetch price id from req since it is actually prod id
	p, err := product.Get(req.PriceId, prod)
	if err != nil {
		return nil, err
	}

	params := &stripe.SubscriptionParams{
		Customer: stripe.String(req.CustomerId),
		Items: []*stripe.SubscriptionItemsParams{
			{
				Price: stripe.String(p.DefaultPrice.ID),
			},
		},
		PaymentBehavior:       stripe.String("default_incomplete"),
		ApplicationFeePercent: stripe.Float64(10),
	}

	params.AddExpand("latest_invoice.payment_intent")
	params.SetStripeAccount(req.StripeAccount)
	s, err := sub.New(params)

	if err != nil {
		return nil, err
	}

	return &pb.CreateSubscriptionReply{
		SubscriptionId: s.ID,
		ClientSecret:   s.LatestInvoice.PaymentIntent.ClientSecret,
	}, nil
}
