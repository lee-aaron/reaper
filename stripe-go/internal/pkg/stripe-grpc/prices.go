package stripe_grpc

import (
	"context"

	pb "github.com/lee-aaron/stripe-go/proto"
	"github.com/stripe/stripe-go/v72"
	"github.com/stripe/stripe-go/v72/price"
	"google.golang.org/grpc"
)

type PricesServer struct {
	pb.UnimplementedPriceHandlerServer
}

func (s *PricesServer) Register(server *grpc.Server, srv *PricesServer) {
	pb.RegisterPriceHandlerServer(server, srv)
}

func (s *PricesServer) CreatePrice(ctx context.Context, req *pb.CreatePriceRequest) (*pb.CreatePriceReply, error) {

	params := &stripe.PriceParams{
		Currency: stripe.String(string(stripe.CurrencyUSD)),
		Product:  stripe.String(req.Product),
		Recurring: &stripe.PriceRecurringParams{
			Interval: stripe.String(string(stripe.PriceRecurringIntervalMonth)),
		},
		UnitAmount: stripe.Int64(req.Amount),
	}

	for k, v := range req.Metadata {
		params.AddMetadata(k, v)
	}

	params.SetStripeAccount(req.StripeAccount)

	p, err := price.New(params)
	if err != nil {
		return &pb.CreatePriceReply{
			PriceId: "",
		}, err
	}

	return &pb.CreatePriceReply{
		PriceId: p.ID,
	}, nil
}

func (s *PricesServer) GetPrice(ctx context.Context, req *pb.GetPriceRequest) (*pb.GetPriceReply, error) {
	p, err := price.Get(req.PriceId, nil)
	if err != nil {
		return nil, err
	}

	return &pb.GetPriceReply{
		PriceId: p.ID,
	}, nil
}
