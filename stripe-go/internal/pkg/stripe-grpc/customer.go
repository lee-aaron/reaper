package stripe_grpc

import (
	"context"

	pb "github.com/lee-aaron/stripe-go/proto"
	"github.com/stripe/stripe-go/v72"
	"github.com/stripe/stripe-go/v72/customer"
	"google.golang.org/grpc"
)

type CustomerServer struct {
	pb.UnimplementedCustomerHandlerServer
}

func (s *CustomerServer) Register(srv *grpc.Server, cs *CustomerServer) {
	pb.RegisterCustomerHandlerServer(srv, cs)
}

func (s *CustomerServer) CreateCustomer(ctx context.Context, req *pb.CustomerCreateRequest) (*pb.CustomerCreateReply, error) {

	params := &stripe.CustomerParams{
		Name:  &req.CustomerName,
		Email: &req.CustomerEmail,
	}

	for k, v := range req.Metadata {
		params.AddMetadata(k, v)
	}

	params.SetStripeAccount(req.StripeAccount)
	c, err := customer.New(params)
	if err != nil {
		return nil, err
	}

	return &pb.CustomerCreateReply{
		CustomerId: c.ID,
	}, nil
}

func (s *CustomerServer) GetCustomer(ctx context.Context, req *pb.CustomerGetRequest) (*pb.CustomerGetReply, error) {
	params := &stripe.CustomerParams{}
	params.SetStripeAccount(req.StripeAccount)
	c, err := customer.Get(req.CustomerId, params)

	return &pb.CustomerGetReply{
		CustomerName:  c.Name,
		CustomerEmail: c.Email,
		Metadata:      c.Metadata,
	}, err
}

func (s *CustomerServer) DeleteCustomer(ctx context.Context, req *pb.CustomerDeleteRequest) (*pb.CustomerDeleteReply, error) {
	params := &stripe.CustomerParams{}
	params.SetStripeAccount(req.StripeAccount)
	c, err := customer.Del(req.CustomerId, params)

	return &pb.CustomerDeleteReply{
		Deleted: c.Deleted,
	}, err
}
