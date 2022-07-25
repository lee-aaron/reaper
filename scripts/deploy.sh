#!/usr/bin/env bash

set -e
set -o pipefail # Only exit with zero if all commands of the pipeline exit successfully

SCRIPT_PATH=$(readlink -f "${0}")
SCRIPT_DIR=$(dirname "${SCRIPT_PATH}")

COMMIT=$(git rev-parse --short HEAD)

REPO_YMLS="${SCRIPT_DIR}/../deployments/kubernetes/base"

SCYTHE_YML="${REPO_YMLS}/scythe.yaml"
API_YAML="${REPO_YMLS}/api.yaml"
DISCORD_YAML="${REPO_YMLS}/discord.yaml"
STRIPE_YAML="${REPO_YMLS}/stripe.yaml"

deploy() {
  kubectl apply -f "${SCYTHE_YML}"
  kubectl apply -f "${API_YAML}"
  kubectl apply -f "${DISCORD_YAML}"
  kubectl apply -f "${STRIPE_YAML}"
}

deploy