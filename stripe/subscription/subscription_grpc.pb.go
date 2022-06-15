// Code generated by protoc-gen-go-grpc. DO NOT EDIT.
// versions:
// - protoc-gen-go-grpc v1.2.0
// - protoc             v3.19.4
// source: proto/subscription.proto

package subscription

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

// SubscriptionHandlerClient is the client API for SubscriptionHandler service.
//
// For semantics around ctx use and closing/ending streaming RPCs, please refer to https://pkg.go.dev/google.golang.org/grpc/?tab=doc#ClientConn.NewStream.
type SubscriptionHandlerClient interface {
	CreateSubscription(ctx context.Context, in *CreateSubscriptionRequest, opts ...grpc.CallOption) (*CreateSubscriptionReply, error)
}

type subscriptionHandlerClient struct {
	cc grpc.ClientConnInterface
}

func NewSubscriptionHandlerClient(cc grpc.ClientConnInterface) SubscriptionHandlerClient {
	return &subscriptionHandlerClient{cc}
}

func (c *subscriptionHandlerClient) CreateSubscription(ctx context.Context, in *CreateSubscriptionRequest, opts ...grpc.CallOption) (*CreateSubscriptionReply, error) {
	out := new(CreateSubscriptionReply)
	err := c.cc.Invoke(ctx, "/payments_v1.SubscriptionHandler/CreateSubscription", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

// SubscriptionHandlerServer is the server API for SubscriptionHandler service.
// All implementations must embed UnimplementedSubscriptionHandlerServer
// for forward compatibility
type SubscriptionHandlerServer interface {
	CreateSubscription(context.Context, *CreateSubscriptionRequest) (*CreateSubscriptionReply, error)
	mustEmbedUnimplementedSubscriptionHandlerServer()
}

// UnimplementedSubscriptionHandlerServer must be embedded to have forward compatible implementations.
type UnimplementedSubscriptionHandlerServer struct {
}

func (UnimplementedSubscriptionHandlerServer) CreateSubscription(context.Context, *CreateSubscriptionRequest) (*CreateSubscriptionReply, error) {
	return nil, status.Errorf(codes.Unimplemented, "method CreateSubscription not implemented")
}
func (UnimplementedSubscriptionHandlerServer) mustEmbedUnimplementedSubscriptionHandlerServer() {}

// UnsafeSubscriptionHandlerServer may be embedded to opt out of forward compatibility for this service.
// Use of this interface is not recommended, as added methods to SubscriptionHandlerServer will
// result in compilation errors.
type UnsafeSubscriptionHandlerServer interface {
	mustEmbedUnimplementedSubscriptionHandlerServer()
}

func RegisterSubscriptionHandlerServer(s grpc.ServiceRegistrar, srv SubscriptionHandlerServer) {
	s.RegisterService(&SubscriptionHandler_ServiceDesc, srv)
}

func _SubscriptionHandler_CreateSubscription_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(CreateSubscriptionRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(SubscriptionHandlerServer).CreateSubscription(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/payments_v1.SubscriptionHandler/CreateSubscription",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(SubscriptionHandlerServer).CreateSubscription(ctx, req.(*CreateSubscriptionRequest))
	}
	return interceptor(ctx, in, info, handler)
}

// SubscriptionHandler_ServiceDesc is the grpc.ServiceDesc for SubscriptionHandler service.
// It's only intended for direct use with grpc.RegisterService,
// and not to be introspected or modified (even as a copy)
var SubscriptionHandler_ServiceDesc = grpc.ServiceDesc{
	ServiceName: "payments_v1.SubscriptionHandler",
	HandlerType: (*SubscriptionHandlerServer)(nil),
	Methods: []grpc.MethodDesc{
		{
			MethodName: "CreateSubscription",
			Handler:    _SubscriptionHandler_CreateSubscription_Handler,
		},
	},
	Streams:  []grpc.StreamDesc{},
	Metadata: "proto/subscription.proto",
}
