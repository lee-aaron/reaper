.PHONY: generate fmt lint test build build-debug

MAKEFILE_PATH=$(shell readlink -f "${0}")
MAKEFILE_DIR=$(shell dirname "${MAKEFILE_PATH}")

protocDirectory=proto
protocArgumentsIncludes=-I ${protocDirectory}
protocArgumentsGo=--go_out=${protocDirectory} --go_opt=paths=source_relative
protocArgumentsGoGRPC=--go-grpc_out=${protocDirectory} --go-grpc_opt=paths=source_relative
protocArguments=${protocArgumentsIncludes} ${protocArgumentsGo} ${protocArgumentsGoGRPC}

generate:
	protoc ${protocArguments} ${protocDirectory}/*.proto

fmt:
	gofmt -s -w . && go mod tidy

lint: fmt
	golangci-liunt run ./...

test:
	go test -v -race -coverprofile=coverage.out ./...
	@ echo "all tests passed"

build-discord:
	CGO_ENABLED=0 go build -o build/package/stripe-go/discord cmd/discord/main.go

build-stripe:
	CGO_ENABLED=0 go build -o build/package/stripe-go/stripe cmd/stripe-go/main.go

build: build-discord build-stripe

debug-discord:
	CGO_ENABLED=0 go build -gcflags "all=-N -l" -o tmp/package/stripe-go/discord-debug cmd/discord/main.go

debug-stripe:
	CGO_ENABLED=0 go build -gcflags "all=-N -l" -o tmp/package/stripe-go/stripe-go-debug cmd/stripe-go/main.go

build-debug: debug-discord debug-stripe