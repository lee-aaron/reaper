#!/usr/bin/env bash

set -e
set -o pipefail # Only exit with zero if all commands of the pipeline exit successfully

SCRIPT_PATH=$(readlink -f "${0}")
SCRIPT_DIR=$(dirname "${SCRIPT_PATH}")

COMMIT=$(git rev-parse --short HEAD)

REPO_YMLS="${SCRIPT_DIR}/../deployments/kubernetes"

SCYTHE_YML="${REPO_YMLS}/scythe.yaml"
API_YAML="${REPO_YMLS}/api.yaml"

deploy() {
  kubectl apply -f "${SCYTHE_YML}"
  kubectl apply -f "${API_YAML}"
}

deploy