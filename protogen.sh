#!/bin/bash

mkdir -p ./ts/_proto
mkdir -p ./go/_proto

DIR=proto
OUTDIR=scythe/proto

protoc \
  --plugin=protoc-gen-ts=./scythe/node_modules/.bin/protoc-gen-ts \
  -I ./proto \
  --js_out=import_style=commonjs,binary:$OUTDIR \
  --ts_out=service=grpc-web:$OUTDIR \
  ./proto/helloworld.proto