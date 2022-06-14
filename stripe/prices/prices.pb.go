// Code generated by protoc-gen-go. DO NOT EDIT.
// versions:
// 	protoc-gen-go v1.28.0
// 	protoc        v3.19.4
// source: proto/prices.proto

package prices

import (
	protoreflect "google.golang.org/protobuf/reflect/protoreflect"
	protoimpl "google.golang.org/protobuf/runtime/protoimpl"
	reflect "reflect"
	sync "sync"
)

const (
	// Verify that this generated code is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(20 - protoimpl.MinVersion)
	// Verify that runtime/protoimpl is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(protoimpl.MaxVersion - 20)
)

type CreatePriceRequest struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Currency string            `protobuf:"bytes,1,opt,name=currency,proto3" json:"currency,omitempty"`
	Product  string            `protobuf:"bytes,2,opt,name=product,proto3" json:"product,omitempty"`
	Amount   int64             `protobuf:"varint,3,opt,name=amount,proto3" json:"amount,omitempty"`
	Metadata map[string]string `protobuf:"bytes,4,rep,name=metadata,proto3" json:"metadata,omitempty" protobuf_key:"bytes,1,opt,name=key,proto3" protobuf_val:"bytes,2,opt,name=value,proto3"`
}

func (x *CreatePriceRequest) Reset() {
	*x = CreatePriceRequest{}
	if protoimpl.UnsafeEnabled {
		mi := &file_proto_prices_proto_msgTypes[0]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *CreatePriceRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*CreatePriceRequest) ProtoMessage() {}

func (x *CreatePriceRequest) ProtoReflect() protoreflect.Message {
	mi := &file_proto_prices_proto_msgTypes[0]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use CreatePriceRequest.ProtoReflect.Descriptor instead.
func (*CreatePriceRequest) Descriptor() ([]byte, []int) {
	return file_proto_prices_proto_rawDescGZIP(), []int{0}
}

func (x *CreatePriceRequest) GetCurrency() string {
	if x != nil {
		return x.Currency
	}
	return ""
}

func (x *CreatePriceRequest) GetProduct() string {
	if x != nil {
		return x.Product
	}
	return ""
}

func (x *CreatePriceRequest) GetAmount() int64 {
	if x != nil {
		return x.Amount
	}
	return 0
}

func (x *CreatePriceRequest) GetMetadata() map[string]string {
	if x != nil {
		return x.Metadata
	}
	return nil
}

type CreatePriceReply struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	PriceId string `protobuf:"bytes,1,opt,name=price_id,json=priceId,proto3" json:"price_id,omitempty"`
}

func (x *CreatePriceReply) Reset() {
	*x = CreatePriceReply{}
	if protoimpl.UnsafeEnabled {
		mi := &file_proto_prices_proto_msgTypes[1]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *CreatePriceReply) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*CreatePriceReply) ProtoMessage() {}

func (x *CreatePriceReply) ProtoReflect() protoreflect.Message {
	mi := &file_proto_prices_proto_msgTypes[1]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use CreatePriceReply.ProtoReflect.Descriptor instead.
func (*CreatePriceReply) Descriptor() ([]byte, []int) {
	return file_proto_prices_proto_rawDescGZIP(), []int{1}
}

func (x *CreatePriceReply) GetPriceId() string {
	if x != nil {
		return x.PriceId
	}
	return ""
}

type GetPriceRequest struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	PriceId string `protobuf:"bytes,1,opt,name=price_id,json=priceId,proto3" json:"price_id,omitempty"`
}

func (x *GetPriceRequest) Reset() {
	*x = GetPriceRequest{}
	if protoimpl.UnsafeEnabled {
		mi := &file_proto_prices_proto_msgTypes[2]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *GetPriceRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*GetPriceRequest) ProtoMessage() {}

func (x *GetPriceRequest) ProtoReflect() protoreflect.Message {
	mi := &file_proto_prices_proto_msgTypes[2]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use GetPriceRequest.ProtoReflect.Descriptor instead.
func (*GetPriceRequest) Descriptor() ([]byte, []int) {
	return file_proto_prices_proto_rawDescGZIP(), []int{2}
}

func (x *GetPriceRequest) GetPriceId() string {
	if x != nil {
		return x.PriceId
	}
	return ""
}

type GetPriceReply struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	PriceId  string `protobuf:"bytes,1,opt,name=price_id,json=priceId,proto3" json:"price_id,omitempty"`
	Currency string `protobuf:"bytes,2,opt,name=currency,proto3" json:"currency,omitempty"`
	Product  string `protobuf:"bytes,3,opt,name=product,proto3" json:"product,omitempty"`
	Amount   int64  `protobuf:"varint,4,opt,name=amount,proto3" json:"amount,omitempty"`
}

func (x *GetPriceReply) Reset() {
	*x = GetPriceReply{}
	if protoimpl.UnsafeEnabled {
		mi := &file_proto_prices_proto_msgTypes[3]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *GetPriceReply) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*GetPriceReply) ProtoMessage() {}

func (x *GetPriceReply) ProtoReflect() protoreflect.Message {
	mi := &file_proto_prices_proto_msgTypes[3]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use GetPriceReply.ProtoReflect.Descriptor instead.
func (*GetPriceReply) Descriptor() ([]byte, []int) {
	return file_proto_prices_proto_rawDescGZIP(), []int{3}
}

func (x *GetPriceReply) GetPriceId() string {
	if x != nil {
		return x.PriceId
	}
	return ""
}

func (x *GetPriceReply) GetCurrency() string {
	if x != nil {
		return x.Currency
	}
	return ""
}

func (x *GetPriceReply) GetProduct() string {
	if x != nil {
		return x.Product
	}
	return ""
}

func (x *GetPriceReply) GetAmount() int64 {
	if x != nil {
		return x.Amount
	}
	return 0
}

var File_proto_prices_proto protoreflect.FileDescriptor

var file_proto_prices_proto_rawDesc = []byte{
	0x0a, 0x12, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x2f, 0x70, 0x72, 0x69, 0x63, 0x65, 0x73, 0x2e, 0x70,
	0x72, 0x6f, 0x74, 0x6f, 0x12, 0x0b, 0x70, 0x61, 0x79, 0x6d, 0x65, 0x6e, 0x74, 0x73, 0x5f, 0x76,
	0x31, 0x22, 0xea, 0x01, 0x0a, 0x12, 0x43, 0x72, 0x65, 0x61, 0x74, 0x65, 0x50, 0x72, 0x69, 0x63,
	0x65, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x12, 0x1a, 0x0a, 0x08, 0x63, 0x75, 0x72, 0x72,
	0x65, 0x6e, 0x63, 0x79, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x08, 0x63, 0x75, 0x72, 0x72,
	0x65, 0x6e, 0x63, 0x79, 0x12, 0x18, 0x0a, 0x07, 0x70, 0x72, 0x6f, 0x64, 0x75, 0x63, 0x74, 0x18,
	0x02, 0x20, 0x01, 0x28, 0x09, 0x52, 0x07, 0x70, 0x72, 0x6f, 0x64, 0x75, 0x63, 0x74, 0x12, 0x16,
	0x0a, 0x06, 0x61, 0x6d, 0x6f, 0x75, 0x6e, 0x74, 0x18, 0x03, 0x20, 0x01, 0x28, 0x03, 0x52, 0x06,
	0x61, 0x6d, 0x6f, 0x75, 0x6e, 0x74, 0x12, 0x49, 0x0a, 0x08, 0x6d, 0x65, 0x74, 0x61, 0x64, 0x61,
	0x74, 0x61, 0x18, 0x04, 0x20, 0x03, 0x28, 0x0b, 0x32, 0x2d, 0x2e, 0x70, 0x61, 0x79, 0x6d, 0x65,
	0x6e, 0x74, 0x73, 0x5f, 0x76, 0x31, 0x2e, 0x43, 0x72, 0x65, 0x61, 0x74, 0x65, 0x50, 0x72, 0x69,
	0x63, 0x65, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x2e, 0x4d, 0x65, 0x74, 0x61, 0x64, 0x61,
	0x74, 0x61, 0x45, 0x6e, 0x74, 0x72, 0x79, 0x52, 0x08, 0x6d, 0x65, 0x74, 0x61, 0x64, 0x61, 0x74,
	0x61, 0x1a, 0x3b, 0x0a, 0x0d, 0x4d, 0x65, 0x74, 0x61, 0x64, 0x61, 0x74, 0x61, 0x45, 0x6e, 0x74,
	0x72, 0x79, 0x12, 0x10, 0x0a, 0x03, 0x6b, 0x65, 0x79, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52,
	0x03, 0x6b, 0x65, 0x79, 0x12, 0x14, 0x0a, 0x05, 0x76, 0x61, 0x6c, 0x75, 0x65, 0x18, 0x02, 0x20,
	0x01, 0x28, 0x09, 0x52, 0x05, 0x76, 0x61, 0x6c, 0x75, 0x65, 0x3a, 0x02, 0x38, 0x01, 0x22, 0x2d,
	0x0a, 0x10, 0x43, 0x72, 0x65, 0x61, 0x74, 0x65, 0x50, 0x72, 0x69, 0x63, 0x65, 0x52, 0x65, 0x70,
	0x6c, 0x79, 0x12, 0x19, 0x0a, 0x08, 0x70, 0x72, 0x69, 0x63, 0x65, 0x5f, 0x69, 0x64, 0x18, 0x01,
	0x20, 0x01, 0x28, 0x09, 0x52, 0x07, 0x70, 0x72, 0x69, 0x63, 0x65, 0x49, 0x64, 0x22, 0x2c, 0x0a,
	0x0f, 0x47, 0x65, 0x74, 0x50, 0x72, 0x69, 0x63, 0x65, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74,
	0x12, 0x19, 0x0a, 0x08, 0x70, 0x72, 0x69, 0x63, 0x65, 0x5f, 0x69, 0x64, 0x18, 0x01, 0x20, 0x01,
	0x28, 0x09, 0x52, 0x07, 0x70, 0x72, 0x69, 0x63, 0x65, 0x49, 0x64, 0x22, 0x78, 0x0a, 0x0d, 0x47,
	0x65, 0x74, 0x50, 0x72, 0x69, 0x63, 0x65, 0x52, 0x65, 0x70, 0x6c, 0x79, 0x12, 0x19, 0x0a, 0x08,
	0x70, 0x72, 0x69, 0x63, 0x65, 0x5f, 0x69, 0x64, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x07,
	0x70, 0x72, 0x69, 0x63, 0x65, 0x49, 0x64, 0x12, 0x1a, 0x0a, 0x08, 0x63, 0x75, 0x72, 0x72, 0x65,
	0x6e, 0x63, 0x79, 0x18, 0x02, 0x20, 0x01, 0x28, 0x09, 0x52, 0x08, 0x63, 0x75, 0x72, 0x72, 0x65,
	0x6e, 0x63, 0x79, 0x12, 0x18, 0x0a, 0x07, 0x70, 0x72, 0x6f, 0x64, 0x75, 0x63, 0x74, 0x18, 0x03,
	0x20, 0x01, 0x28, 0x09, 0x52, 0x07, 0x70, 0x72, 0x6f, 0x64, 0x75, 0x63, 0x74, 0x12, 0x16, 0x0a,
	0x06, 0x61, 0x6d, 0x6f, 0x75, 0x6e, 0x74, 0x18, 0x04, 0x20, 0x01, 0x28, 0x03, 0x52, 0x06, 0x61,
	0x6d, 0x6f, 0x75, 0x6e, 0x74, 0x32, 0xa3, 0x01, 0x0a, 0x0c, 0x50, 0x72, 0x69, 0x63, 0x65, 0x48,
	0x61, 0x6e, 0x64, 0x6c, 0x65, 0x72, 0x12, 0x4d, 0x0a, 0x0b, 0x43, 0x72, 0x65, 0x61, 0x74, 0x65,
	0x50, 0x72, 0x69, 0x63, 0x65, 0x12, 0x1f, 0x2e, 0x70, 0x61, 0x79, 0x6d, 0x65, 0x6e, 0x74, 0x73,
	0x5f, 0x76, 0x31, 0x2e, 0x43, 0x72, 0x65, 0x61, 0x74, 0x65, 0x50, 0x72, 0x69, 0x63, 0x65, 0x52,
	0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x1a, 0x1d, 0x2e, 0x70, 0x61, 0x79, 0x6d, 0x65, 0x6e, 0x74,
	0x73, 0x5f, 0x76, 0x31, 0x2e, 0x43, 0x72, 0x65, 0x61, 0x74, 0x65, 0x50, 0x72, 0x69, 0x63, 0x65,
	0x52, 0x65, 0x70, 0x6c, 0x79, 0x12, 0x44, 0x0a, 0x08, 0x47, 0x65, 0x74, 0x50, 0x72, 0x69, 0x63,
	0x65, 0x12, 0x1c, 0x2e, 0x70, 0x61, 0x79, 0x6d, 0x65, 0x6e, 0x74, 0x73, 0x5f, 0x76, 0x31, 0x2e,
	0x47, 0x65, 0x74, 0x50, 0x72, 0x69, 0x63, 0x65, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x1a,
	0x1a, 0x2e, 0x70, 0x61, 0x79, 0x6d, 0x65, 0x6e, 0x74, 0x73, 0x5f, 0x76, 0x31, 0x2e, 0x47, 0x65,
	0x74, 0x50, 0x72, 0x69, 0x63, 0x65, 0x52, 0x65, 0x70, 0x6c, 0x79, 0x42, 0x27, 0x5a, 0x25, 0x67,
	0x69, 0x74, 0x68, 0x75, 0x62, 0x2e, 0x63, 0x6f, 0x6d, 0x2f, 0x6c, 0x65, 0x65, 0x2d, 0x61, 0x61,
	0x72, 0x6f, 0x6e, 0x2f, 0x73, 0x74, 0x72, 0x69, 0x70, 0x65, 0x2d, 0x67, 0x6f, 0x2f, 0x70, 0x72,
	0x69, 0x63, 0x65, 0x73, 0x62, 0x06, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x33,
}

var (
	file_proto_prices_proto_rawDescOnce sync.Once
	file_proto_prices_proto_rawDescData = file_proto_prices_proto_rawDesc
)

func file_proto_prices_proto_rawDescGZIP() []byte {
	file_proto_prices_proto_rawDescOnce.Do(func() {
		file_proto_prices_proto_rawDescData = protoimpl.X.CompressGZIP(file_proto_prices_proto_rawDescData)
	})
	return file_proto_prices_proto_rawDescData
}

var file_proto_prices_proto_msgTypes = make([]protoimpl.MessageInfo, 5)
var file_proto_prices_proto_goTypes = []interface{}{
	(*CreatePriceRequest)(nil), // 0: payments_v1.CreatePriceRequest
	(*CreatePriceReply)(nil),   // 1: payments_v1.CreatePriceReply
	(*GetPriceRequest)(nil),    // 2: payments_v1.GetPriceRequest
	(*GetPriceReply)(nil),      // 3: payments_v1.GetPriceReply
	nil,                        // 4: payments_v1.CreatePriceRequest.MetadataEntry
}
var file_proto_prices_proto_depIdxs = []int32{
	4, // 0: payments_v1.CreatePriceRequest.metadata:type_name -> payments_v1.CreatePriceRequest.MetadataEntry
	0, // 1: payments_v1.PriceHandler.CreatePrice:input_type -> payments_v1.CreatePriceRequest
	2, // 2: payments_v1.PriceHandler.GetPrice:input_type -> payments_v1.GetPriceRequest
	1, // 3: payments_v1.PriceHandler.CreatePrice:output_type -> payments_v1.CreatePriceReply
	3, // 4: payments_v1.PriceHandler.GetPrice:output_type -> payments_v1.GetPriceReply
	3, // [3:5] is the sub-list for method output_type
	1, // [1:3] is the sub-list for method input_type
	1, // [1:1] is the sub-list for extension type_name
	1, // [1:1] is the sub-list for extension extendee
	0, // [0:1] is the sub-list for field type_name
}

func init() { file_proto_prices_proto_init() }
func file_proto_prices_proto_init() {
	if File_proto_prices_proto != nil {
		return
	}
	if !protoimpl.UnsafeEnabled {
		file_proto_prices_proto_msgTypes[0].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*CreatePriceRequest); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_proto_prices_proto_msgTypes[1].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*CreatePriceReply); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_proto_prices_proto_msgTypes[2].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*GetPriceRequest); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_proto_prices_proto_msgTypes[3].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*GetPriceReply); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
	}
	type x struct{}
	out := protoimpl.TypeBuilder{
		File: protoimpl.DescBuilder{
			GoPackagePath: reflect.TypeOf(x{}).PkgPath(),
			RawDescriptor: file_proto_prices_proto_rawDesc,
			NumEnums:      0,
			NumMessages:   5,
			NumExtensions: 0,
			NumServices:   1,
		},
		GoTypes:           file_proto_prices_proto_goTypes,
		DependencyIndexes: file_proto_prices_proto_depIdxs,
		MessageInfos:      file_proto_prices_proto_msgTypes,
	}.Build()
	File_proto_prices_proto = out.File
	file_proto_prices_proto_rawDesc = nil
	file_proto_prices_proto_goTypes = nil
	file_proto_prices_proto_depIdxs = nil
}
