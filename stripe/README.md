## Generate Files from Proto

`protoc proto/*.proto --go_out=. --go_opt=module=github.com/lee-aaron/stripe-go --go-grpc_out=. --g
o-grpc_opt=module=github.com/lee-aaron/stripe-go --proto_path=.`