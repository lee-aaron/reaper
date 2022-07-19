package stripe_grpc

import (
	"context"

	pb "github.com/lee-aaron/stripe-go/proto"
	"github.com/stripe/stripe-go/v72"
	"github.com/stripe/stripe-go/v72/billingportal/configuration"
	"github.com/stripe/stripe-go/v72/billingportal/session"
	"github.com/stripe/stripe-go/v72/loginlink"
	"google.golang.org/grpc"
)

type PortalServer struct {
	pb.UnimplementedPortalHandlerServer
}

func (srv *PortalServer) Register(s *grpc.Server, sr *PortalServer) {
	pb.RegisterPortalHandlerServer(s, sr)
}

func (srv *PortalServer) CreatePortal(ctx context.Context, req *pb.CreatePortalRequest) (*pb.CreatePortalReply, error) {

	// Create default params if it doesn't exist
	listParams := &stripe.BillingPortalConfigurationListParams{
		IsDefault: stripe.Bool(true),
	}
	listParams.SetStripeAccount(req.StripeAccount)

	i := configuration.List(listParams)
	i.Next()

	var config *stripe.BillingPortalConfiguration

	if i.Current() == nil {
		billingParams := &stripe.BillingPortalConfigurationParams{
			BusinessProfile: &stripe.BillingPortalConfigurationBusinessProfileParams{
				Headline: stripe.String("Powered by Stripe"),
			},
			Features: &stripe.BillingPortalConfigurationFeaturesParams{
				CustomerUpdate: &stripe.BillingPortalConfigurationFeaturesCustomerUpdateParams{
					AllowedUpdates: []*string{
						stripe.String("email"),
						stripe.String("address"),
					},
					Enabled: stripe.Bool(true),
				},
				PaymentMethodUpdate: &stripe.BillingPortalConfigurationFeaturesPaymentMethodUpdateParams{
					Enabled: stripe.Bool(true),
				},
				InvoiceHistory: &stripe.BillingPortalConfigurationFeaturesInvoiceHistoryParams{
					Enabled: stripe.Bool(true),
				},
			},
		}
		billingParams.SetStripeAccount(req.StripeAccount)

		config, _ = configuration.New(billingParams)
	} else {
		config = i.BillingPortalConfiguration()
	}

	params := &stripe.BillingPortalSessionParams{
		Configuration: stripe.String(config.ID),
		Customer:      stripe.String(req.CustomerId),
		ReturnURL:     stripe.String(req.ReturnUrl),
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

func (srv *PortalServer) CreateLoginLink(ctx context.Context, req *pb.CreateLoginLinkRequest) (*pb.CreateLoginLinkReply, error) {

	params := &stripe.LoginLinkParams{
		Account: stripe.String(req.StripeAccount),
	}

	link, err := loginlink.New(params)
	if err != nil {
		return nil, err
	}

	return &pb.CreateLoginLinkReply{
		LoginLinkUrl: link.URL,
	}, nil
}
