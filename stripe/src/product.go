package main

import (
	"context"
	"fmt"

	pb "github.com/lee-aaron/stripe-go/product"
	"github.com/stripe/stripe-go/v72"
	"github.com/stripe/stripe-go/v72/price"
	"github.com/stripe/stripe-go/v72/product"
	"google.golang.org/grpc"
)

type ProductServer struct {
	pb.UnimplementedProductHandlerServer
}

func (s *ProductServer) Register(server *grpc.Server, srv *ProductServer) {
	pb.RegisterProductHandlerServer(server, srv)
}

func (s *ProductServer) CreateProduct(ctx context.Context, req *pb.CreateProductRequest) (*pb.CreateProductReply, error) {
	params := &stripe.ProductParams{
		Name:        stripe.String(req.Name),
		Description: stripe.String(req.Description),
		DefaultPriceData: &stripe.ProductDefaultPriceDataParams{
			Currency: stripe.String(string(stripe.CurrencyUSD)),
			Recurring: &stripe.ProductDefaultPriceDataRecurringParams{
				Interval: stripe.String(string(stripe.PriceRecurringIntervalMonth)),
			},
			UnitAmount: stripe.Int64(req.Amount),
		},
	}

	for k, v := range req.Metadata {
		params.AddMetadata(k, v)
	}

	params.SetStripeAccount(req.StripeAccount)

	p, err := product.New(params)
	if err != nil {
		return nil, err
	}

	return &pb.CreateProductReply{
		ProdId:  p.ID,
		PriceId: p.DefaultPrice.ID,
	}, nil
}

func (s *ProductServer) UpdateProduct(ctx context.Context, req *pb.UpdateProductRequest) (*pb.UpdateProductReply, error) {
	params := &stripe.ProductParams{
		Name:        stripe.String(req.Name),
		Description: stripe.String(req.Description),
	}

	params.SetStripeAccount(req.StripeAccount)

	_, err := product.Update(req.Id, params)
	if err != nil {
		return &pb.UpdateProductReply{
			Updated: false,
		}, err
	}

	return &pb.UpdateProductReply{
		Updated: true,
	}, nil
}

func (s *ProductServer) GetProduct(ctx context.Context, req *pb.GetProductRequest) (*pb.GetProductReply, error) {
	params := &stripe.ProductParams{}
	params.SetStripeAccount(req.StripeAccount)

	p, err := product.Get(req.Id, params)
	if err != nil {
		return nil, err
	}

	return &pb.GetProductReply{
		Name:        p.Name,
		Description: p.Description,
	}, nil
}

func (s *ProductServer) DeleteProduct(ctx context.Context, req *pb.DeleteProductRequest) (*pb.DeleteProductReply, error) {
	params := &stripe.ProductParams{}
	params.SetStripeAccount(req.StripeAccount)

	p, err := product.Del(req.Id, params)
	if err != nil {
		return nil, err
	}

	return &pb.DeleteProductReply{
		Deleted: p.Deleted,
	}, nil
}

func (s *ProductServer) SearchProduct(ctx context.Context, req *pb.SearchProductRequest) (*pb.SearchProductReply, error) {
	params := &stripe.ProductSearchParams{}
	params.Limit = req.Limit
	params.Page = req.Page
	params.Query = req.Query
	params.AddExpand("data.default_price")
	params.SetStripeAccount(req.StripeAccount)
	iter := product.Search(params)

	var products []*pb.Product

	for iter.Next() {

		priceParams := &stripe.PriceSearchParams{}
		priceParams.Query = fmt.Sprintf("metadata['product_id']: '%s'", iter.Product().ID)
		priceParams.SetStripeAccount(req.StripeAccount)

		curr := price.Search(priceParams)
		if curr.Next() {
			products = append(products, &pb.Product{
				Id:          iter.Product().ID,
				Name:        iter.Product().Name,
				Description: iter.Product().Description,
				Metadata:    iter.Product().Metadata,
				Amount:      curr.Price().UnitAmount,
			})
		}
	}

	return &pb.SearchProductReply{
		Products: products,
	}, nil
}
