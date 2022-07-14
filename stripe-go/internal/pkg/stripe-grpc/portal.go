package stripe_grpc

import (
	"context"

	pb "github.com/lee-aaron/stripe-go/proto"
	"github.com/stripe/stripe-go/v72"
	"github.com/stripe/stripe-go/v72/billingportal/session"
	"google.golang.org/grpc"
)

type PortalServer struct {
	pb.UnimplementedPortalHandlerServer
}

func (srv *PortalServer) Register(s *grpc.Server, sr *PortalServer) {
	pb.RegisterPortalHandlerServer(s, sr)
}

func (srv *PortalServer) CreatePortal(ctx context.Context, req *pb.CreatePortalRequest) (*pb.CreatePortalReply, error) {

	params := &stripe.BillingPortalSessionParams{
		Customer:  stripe.String(req.CustomerId),
		ReturnURL: stripe.String(req.ReturnUrl),
	}
	params.SetStripeAccount(req.StripeAccount)

	s, err := session.New(params)
	if err != nil {
		return nil, err
	}

	return &pb.CreatePortalReply{
		PortalUrl: s.URL,
	}, nil
}
