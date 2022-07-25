FROM alpine:latest as base

RUN apk --no-cache add tzdata

FROM scratch

COPY --from=base /etc/ssl/certs /etc/ssl/certs
COPY --from=base /usr/share/zoneinfo /usr/share/zoneinfo
COPY build/package/discord/ .
COPY configuration /configuration

EXPOSE 9001

ENTRYPOINT ["./discord"]