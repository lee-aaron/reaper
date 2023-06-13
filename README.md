# guilds.gg

All private tokens and keys you see are not in use anymore or have since been deprecated.

## Front End

```
Serve front end from backend
```

## Back End

```
Exposes /api endpoint for login, signup, etc
Use OAuth2 for Discord Login

RUST_LOG=debug cargo watch -w 'api' -w 'shared' -x 'run --guilds'
```

## Microservices

```
HTTP/2/3 servers?
Stripe Billing, Database Interaction
```

## Kubernetes Notes

```
helm install my-redis bitnami/redis
```