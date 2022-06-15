// Code generated by protoc-gen-go-grpc. DO NOT EDIT.
// versions:
// - protoc-gen-go-grpc v1.2.0
// - protoc             v3.19.4
// source: proto/account.proto

package account

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

// AccountHandlerClient is the client API for AccountHandler service.
//
// For semantics around ctx use and closing/ending streaming RPCs, please refer to https://pkg.go.dev/google.golang.org/grpc/?tab=doc#ClientConn.NewStream.
type AccountHandlerClient interface {
	CreateAccount(ctx context.Context, in *CreateAccountRequest, opts ...grpc.CallOption) (*CreateAccountReply, error)
	GetAccount(ctx context.Context, in *GetAccountRequest, opts ...grpc.CallOption) (*GetAccountReply, error)
	DeleteAccount(ctx context.Context, in *DeleteAccountRequest, opts ...grpc.CallOption) (*DeleteAccountReply, error)
	CreateAccountLink(ctx context.Context, in *CreateAccountLinkRequest, opts ...grpc.CallOption) (*CreateAccountLinkReply, error)
}

type accountHandlerClient struct {
	cc grpc.ClientConnInterface
}

func NewAccountHandlerClient(cc grpc.ClientConnInterface) AccountHandlerClient {
	return &accountHandlerClient{cc}
}

func (c *accountHandlerClient) CreateAccount(ctx context.Context, in *CreateAccountRequest, opts ...grpc.CallOption) (*CreateAccountReply, error) {
	out := new(CreateAccountReply)
	err := c.cc.Invoke(ctx, "/payments_v1.AccountHandler/CreateAccount", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *accountHandlerClient) GetAccount(ctx context.Context, in *GetAccountRequest, opts ...grpc.CallOption) (*GetAccountReply, error) {
	out := new(GetAccountReply)
	err := c.cc.Invoke(ctx, "/payments_v1.AccountHandler/GetAccount", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *accountHandlerClient) DeleteAccount(ctx context.Context, in *DeleteAccountRequest, opts ...grpc.CallOption) (*DeleteAccountReply, error) {
	out := new(DeleteAccountReply)
	err := c.cc.Invoke(ctx, "/payments_v1.AccountHandler/DeleteAccount", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *accountHandlerClient) CreateAccountLink(ctx context.Context, in *CreateAccountLinkRequest, opts ...grpc.CallOption) (*CreateAccountLinkReply, error) {
	out := new(CreateAccountLinkReply)
	err := c.cc.Invoke(ctx, "/payments_v1.AccountHandler/CreateAccountLink", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

// AccountHandlerServer is the server API for AccountHandler service.
// All implementations must embed UnimplementedAccountHandlerServer
// for forward compatibility
type AccountHandlerServer interface {
	CreateAccount(context.Context, *CreateAccountRequest) (*CreateAccountReply, error)
	GetAccount(context.Context, *GetAccountRequest) (*GetAccountReply, error)
	DeleteAccount(context.Context, *DeleteAccountRequest) (*DeleteAccountReply, error)
	CreateAccountLink(context.Context, *CreateAccountLinkRequest) (*CreateAccountLinkReply, error)
	mustEmbedUnimplementedAccountHandlerServer()
}

// UnimplementedAccountHandlerServer must be embedded to have forward compatible implementations.
type UnimplementedAccountHandlerServer struct {
}

func (UnimplementedAccountHandlerServer) CreateAccount(context.Context, *CreateAccountRequest) (*CreateAccountReply, error) {
	return nil, status.Errorf(codes.Unimplemented, "method CreateAccount not implemented")
}
func (UnimplementedAccountHandlerServer) GetAccount(context.Context, *GetAccountRequest) (*GetAccountReply, error) {
	return nil, status.Errorf(codes.Unimplemented, "method GetAccount not implemented")
}
func (UnimplementedAccountHandlerServer) DeleteAccount(context.Context, *DeleteAccountRequest) (*DeleteAccountReply, error) {
	return nil, status.Errorf(codes.Unimplemented, "method DeleteAccount not implemented")
}
func (UnimplementedAccountHandlerServer) CreateAccountLink(context.Context, *CreateAccountLinkRequest) (*CreateAccountLinkReply, error) {
	return nil, status.Errorf(codes.Unimplemented, "method CreateAccountLink not implemented")
}
func (UnimplementedAccountHandlerServer) mustEmbedUnimplementedAccountHandlerServer() {}

// UnsafeAccountHandlerServer may be embedded to opt out of forward compatibility for this service.
// Use of this interface is not recommended, as added methods to AccountHandlerServer will
// result in compilation errors.
type UnsafeAccountHandlerServer interface {
	mustEmbedUnimplementedAccountHandlerServer()
}

func RegisterAccountHandlerServer(s grpc.ServiceRegistrar, srv AccountHandlerServer) {
	s.RegisterService(&AccountHandler_ServiceDesc, srv)
}

func _AccountHandler_CreateAccount_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(CreateAccountRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(AccountHandlerServer).CreateAccount(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/payments_v1.AccountHandler/CreateAccount",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(AccountHandlerServer).CreateAccount(ctx, req.(*CreateAccountRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _AccountHandler_GetAccount_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(GetAccountRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(AccountHandlerServer).GetAccount(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/payments_v1.AccountHandler/GetAccount",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(AccountHandlerServer).GetAccount(ctx, req.(*GetAccountRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _AccountHandler_DeleteAccount_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(DeleteAccountRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(AccountHandlerServer).DeleteAccount(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/payments_v1.AccountHandler/DeleteAccount",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(AccountHandlerServer).DeleteAccount(ctx, req.(*DeleteAccountRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _AccountHandler_CreateAccountLink_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(CreateAccountLinkRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(AccountHandlerServer).CreateAccountLink(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/payments_v1.AccountHandler/CreateAccountLink",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(AccountHandlerServer).CreateAccountLink(ctx, req.(*CreateAccountLinkRequest))
	}
	return interceptor(ctx, in, info, handler)
}

// AccountHandler_ServiceDesc is the grpc.ServiceDesc for AccountHandler service.
// It's only intended for direct use with grpc.RegisterService,
// and not to be introspected or modified (even as a copy)
var AccountHandler_ServiceDesc = grpc.ServiceDesc{
	ServiceName: "payments_v1.AccountHandler",
	HandlerType: (*AccountHandlerServer)(nil),
	Methods: []grpc.MethodDesc{
		{
			MethodName: "CreateAccount",
			Handler:    _AccountHandler_CreateAccount_Handler,
		},
		{
			MethodName: "GetAccount",
			Handler:    _AccountHandler_GetAccount_Handler,
		},
		{
			MethodName: "DeleteAccount",
			Handler:    _AccountHandler_DeleteAccount_Handler,
		},
		{
			MethodName: "CreateAccountLink",
			Handler:    _AccountHandler_CreateAccountLink_Handler,
		},
	},
	Streams:  []grpc.StreamDesc{},
	Metadata: "proto/account.proto",
}
