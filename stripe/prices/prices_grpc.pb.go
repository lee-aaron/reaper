// Code generated by protoc-gen-go-grpc. DO NOT EDIT.
// versions:
// - protoc-gen-go-grpc v1.2.0
// - protoc             v3.19.4
// source: proto/prices.proto

package prices

import (
	context "context"
	grpc "google.golang.org/grpc"
	codes "google.golang.org/grpc/codes"
	status "google.golang.org/grpc/status"
)

// This is a compile-time assertion to ensure that this generated file
// is compatible with the grpc package it is being compiled against.
// Requires gRPC-Go v1.32.0 or later.
const _ = grpc.SupportPackageIsVersion7

// PriceHandlerClient is the client API for PriceHandler service.
//
// For semantics around ctx use and closing/ending streaming RPCs, please refer to https://pkg.go.dev/google.golang.org/grpc/?tab=doc#ClientConn.NewStream.
type PriceHandlerClient interface {
	CreatePrice(ctx context.Context, in *CreatePriceRequest, opts ...grpc.CallOption) (*CreatePriceReply, error)
	GetPrice(ctx context.Context, in *GetPriceRequest, opts ...grpc.CallOption) (*GetPriceReply, error)
}

type priceHandlerClient struct {
	cc grpc.ClientConnInterface
}

func NewPriceHandlerClient(cc grpc.ClientConnInterface) PriceHandlerClient {
	return &priceHandlerClient{cc}
}

func (c *priceHandlerClient) CreatePrice(ctx context.Context, in *CreatePriceRequest, opts ...grpc.CallOption) (*CreatePriceReply, error) {
	out := new(CreatePriceReply)
	err := c.cc.Invoke(ctx, "/payments_v1.PriceHandler/CreatePrice", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *priceHandlerClient) GetPrice(ctx context.Context, in *GetPriceRequest, opts ...grpc.CallOption) (*GetPriceReply, error) {
	out := new(GetPriceReply)
	err := c.cc.Invoke(ctx, "/payments_v1.PriceHandler/GetPrice", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

// PriceHandlerServer is the server API for PriceHandler service.
// All implementations must embed UnimplementedPriceHandlerServer
// for forward compatibility
type PriceHandlerServer interface {
	CreatePrice(context.Context, *CreatePriceRequest) (*CreatePriceReply, error)
	GetPrice(context.Context, *GetPriceRequest) (*GetPriceReply, error)
	mustEmbedUnimplementedPriceHandlerServer()
}

// UnimplementedPriceHandlerServer must be embedded to have forward compatible implementations.
type UnimplementedPriceHandlerServer struct {
}

func (UnimplementedPriceHandlerServer) CreatePrice(context.Context, *CreatePriceRequest) (*CreatePriceReply, error) {
	return nil, status.Errorf(codes.Unimplemented, "method CreatePrice not implemented")
}
func (UnimplementedPriceHandlerServer) GetPrice(context.Context, *GetPriceRequest) (*GetPriceReply, error) {
	return nil, status.Errorf(codes.Unimplemented, "method GetPrice not implemented")
}
func (UnimplementedPriceHandlerServer) mustEmbedUnimplementedPriceHandlerServer() {}

// UnsafePriceHandlerServer may be embedded to opt out of forward compatibility for this service.
// Use of this interface is not recommended, as added methods to PriceHandlerServer will
// result in compilation errors.
type UnsafePriceHandlerServer interface {
	mustEmbedUnimplementedPriceHandlerServer()
}

func RegisterPriceHandlerServer(s grpc.ServiceRegistrar, srv PriceHandlerServer) {
	s.RegisterService(&PriceHandler_ServiceDesc, srv)
}

func _PriceHandler_CreatePrice_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(CreatePriceRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(PriceHandlerServer).CreatePrice(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/payments_v1.PriceHandler/CreatePrice",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(PriceHandlerServer).CreatePrice(ctx, req.(*CreatePriceRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _PriceHandler_GetPrice_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(GetPriceRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(PriceHandlerServer).GetPrice(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/payments_v1.PriceHandler/GetPrice",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(PriceHandlerServer).GetPrice(ctx, req.(*GetPriceRequest))
	}
	return interceptor(ctx, in, info, handler)
}

// PriceHandler_ServiceDesc is the grpc.ServiceDesc for PriceHandler service.
// It's only intended for direct use with grpc.RegisterService,
// and not to be introspected or modified (even as a copy)
var PriceHandler_ServiceDesc = grpc.ServiceDesc{
	ServiceName: "payments_v1.PriceHandler",
	HandlerType: (*PriceHandlerServer)(nil),
	Methods: []grpc.MethodDesc{
		{
			MethodName: "CreatePrice",
			Handler:    _PriceHandler_CreatePrice_Handler,
		},
		{
			MethodName: "GetPrice",
			Handler:    _PriceHandler_GetPrice_Handler,
		},
	},
	Streams:  []grpc.StreamDesc{},
	Metadata: "proto/prices.proto",
}
