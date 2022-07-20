FROM alpine:latest as base

RUN apk --no-cache add tzdata

FROM scratch

COPY --from=base /etc/ssl/certs /etc/ssl/certs
COPY --from=base /usr/share/zoneinfo /usr/share/zoneinfo
COPY build/package/stripe/ .
COPY configuration /configuration

ENV GO_ENV production
EXPOSE 8081

ENTRYPOINT ["./stripe"]