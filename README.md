# guilds.gg

## Front End

```
Serve front end from backend
```

## Back End

```
Exposes /api endpoint for login, signup, etc
Use OAuth2 for Discord Login

RUST_LOG=debug cargo watch -w 'api' -x 'run --guilds'
```

## Microservices

```
HTTP/2/3 servers?
Stripe Billing, Database Interaction
```