package stripe_grpc

import (
	"context"

	pb "github.com/lee-aaron/stripe-go/proto"
	"github.com/stripe/stripe-go/v72"
	"github.com/stripe/stripe-go/v72/account"
	"github.com/stripe/stripe-go/v72/accountlink"
	"google.golang.org/grpc"
)

type AccountServer struct {
	pb.UnimplementedAccountHandlerServer
}

func (s *AccountServer) Register(srv *grpc.Server, as *AccountServer) {
	pb.RegisterAccountHandlerServer(srv, as)
}

func (s *AccountServer) CreateAccount(ctx context.Context, req *pb.CreateAccountRequest) (*pb.CreateAccountReply, error) {

	params := &stripe.AccountParams{
		Type:  stripe.String(string(stripe.AccountTypeExpress)),
		Email: stripe.String(req.Email),
	}

	for k, v := range req.Metadata {
		params.AddMetadata(k, v)
	}

	account, err := account.New(params)
	if err != nil {
		return nil, err
	}

	return &pb.CreateAccountReply{
		AccountId: account.ID,
	}, nil
}

func (s *AccountServer) GetAccount(ctx context.Context, req *pb.GetAccountRequest) (*pb.GetAccountReply, error) {
	a, err := account.GetByID(req.AccountId, nil)
	if err != nil {
		return nil, err
	}

	return &pb.GetAccountReply{
		AccountId:      a.ID,
		Email:          a.Email,
		Metadata:       a.Metadata,
		ChargesEnabled: a.ChargesEnabled,
	}, nil
}

func (s *AccountServer) DeleteAccount(ctx context.Context, req *pb.DeleteAccountRequest) (*pb.DeleteAccountReply, error) {
	a, err := account.Del(req.AccountId, nil)
	if err != nil {
		return nil, err
	}

	return &pb.DeleteAccountReply{
		Deleted: a.Deleted,
	}, nil
}

func (s *AccountServer) CreateAccountLink(ctx context.Context, req *pb.CreateAccountLinkRequest) (*pb.CreateAccountLinkReply, error) {
	params := &stripe.AccountLinkParams{
		Account:    stripe.String(req.AccountId),
		RefreshURL: stripe.String(req.RefreshUrl),
		ReturnURL:  stripe.String(req.ReturnUrl),
		Type:       stripe.String("account_onboarding"),
	}

	link, err := accountlink.New(params)
	if err != nil {
		return nil, err
	}

	return &pb.CreateAccountLinkReply{
		Url:       link.URL,
		ExpiresAt: link.ExpiresAt,
	}, nil
}
