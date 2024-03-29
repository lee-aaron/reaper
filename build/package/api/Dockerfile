FROM lukemathwalker/cargo-chef:latest as chef
WORKDIR /app
RUN apt update && apt install lld clang cmake -y

FROM chef as planner
COPY api/ api/
COPY shared/ shared/
COPY stripe-go/ stripe-go/
COPY configuration/ configuration/
COPY Cargo.toml .
# Compute a lock-like file for our project
RUN cargo chef prepare  --recipe-path recipe.json

FROM chef as builder
COPY --from=planner /app/recipe.json recipe.json
# Build our project dependencies, not our application!
RUN cargo chef cook --release --recipe-path recipe.json
COPY api/ api/
COPY shared/ shared/
COPY stripe-go/ stripe-go/
COPY configuration/ configuration/
COPY Cargo.toml .
ENV SQLX_OFFLINE true
# Build our project
RUN cargo build --release --bin api

FROM debian:bullseye-slim AS runtime
WORKDIR /app
RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    # Clean up
    && apt-get autoremove -y \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/api api
COPY configuration configuration
ENTRYPOINT ["./api"]