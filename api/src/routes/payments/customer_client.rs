use actix_web::{web, HttpResponse, ResponseError};
use actix_web::http::StatusCode;
use anyhow::Context;
use sqlx::{PgPool, Postgres, Transaction};
use stripe_server::payments_v1::customer_handler_client::CustomerHandlerClient;
use stripe_server::payments_v1::*;
use tonic::transport::{Channel, Uri};

use crate::{utils::e500, routes::error_chain_fmt};

use super::Payment;

#[derive(Clone)]
pub struct CustomerClient {
    pub client: CustomerHandlerClient<Channel>,
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct CustomerInfo {
    pub discord_id: String,
    pub name: String,
    pub email: String,
}

impl CustomerClient {
    pub fn new(addr: &str) -> Self {
        let addr = addr.to_string();
        let uri = match addr.contains("http://") {
            true => addr.parse::<Uri>().unwrap(),
            false => {
                if let Ok(u) = Uri::builder()
                    .scheme("http")
                    .authority(addr.to_string())
                    .path_and_query("/")
                    .build()
                {
                    u
                } else {
                    addr.parse::<Uri>().unwrap()
                }
            }
        };
        let channel = Channel::builder(uri).connect_lazy();
        let client = CustomerHandlerClient::new(channel.clone());
        CustomerClient { client }
    }

    #[tracing::instrument(name = "Create Customer in DB", skip(transaction, self))]
    pub async fn create_customer(
        &self,
        transaction: &mut Transaction<'_, Postgres>,
        discord_id: String,
        name: String,
        email: String,
    ) -> Result<(), sqlx::Error> {
        sqlx::query!(
            r#"
            INSERT INTO customers (discord_id, name, email)
            VALUES ($1, $2, $3)
            on conflict (discord_id) do nothing
            "#,
            discord_id,
            name,
            email
        )
        .execute(transaction)
        .await?;
        Ok(())
    }

    #[tracing::instrument(name = "Get Customer from DB", skip(pool, self))]
    pub async fn get_customer(
        &self,
        pool: &PgPool,
        discord_id: String,
    ) -> Result<Option<CustomerInfo>, sqlx::Error> {
        let result = sqlx::query_as!(
            CustomerInfo,
            r#"
            SELECT * FROM customers WHERE discord_id = $1
            "#,
            discord_id
        )
        .fetch_optional(pool)
        .await?;
        Ok(result)
    }

    #[tracing::instrument(name = "Delete Customer from DB", skip(self, transaction))]
    pub async fn delete_customer(
        &self,
        transaction: &mut Transaction<'_, Postgres>,
        discord_id: String,
    ) -> Result<(), sqlx::Error> {
        sqlx::query!(
            r#"
            DELETE FROM customers WHERE discord_id = $1
            "#,
            discord_id
        )
        .execute(transaction)
        .await?;
        Ok(())
    }

    #[tracing::instrument(name = "Get Owner's Stripe Id from Cus Subscription", skip(self, pool))]
    pub async fn get_owner_stripe_id(
        &self,
        pool: &PgPool,
        cus_id: String,
    ) -> Result<String, sqlx::Error> {
        let result = sqlx::query!(
            r#"
            SELECT stripe_id FROM owners WHERE discord_id = (SELECT discord_id FROM guilds where server_id = (SELECT server_id FROM cus_subscriptions where cus_id = $1))
            "#,
            cus_id
        )
        .fetch_one(pool)
        .await?;
        Ok(result.stripe_id)
    }
}

#[derive(thiserror::Error)]
pub enum CustomerError {
    #[error(transparent)]
    UnexpectedError(#[from] anyhow::Error),
    #[error("No Customer Found")]
    NoCustomerFound,
}

impl std::fmt::Debug for CustomerError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        error_chain_fmt(self, f)
    }
}

impl ResponseError for CustomerError {
    fn status_code(&self) -> StatusCode {
        match self {
            CustomerError::NoCustomerFound => StatusCode::NOT_FOUND,
            _ => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }
}

pub async fn create_customer(
    customer: web::Json<CustomerInfo>,
    client: web::Data<Payment>,
    pg: web::Data<PgPool>,
) -> Result<HttpResponse, actix_web::Error> {
    // insert into customer db
    let mut transaction = pg
        .begin()
        .await
        .context("Failed to acquire a Postgres connection from the pool")
        .map_err(e500)?;

    client
        .customer_client
        .create_customer(
            &mut transaction,
            customer.0.discord_id,
            customer.0.name,
            customer.0.email,
        )
        .await
        .context("Failed to create a customer in the database")
        .map_err(e500)?;

    transaction
        .commit()
        .await
        .context("Failed to commit the transaction")
        .map_err(e500)?;

    Ok(HttpResponse::Ok().finish())
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct CustomerGet {
    pub discord_id: String,
}

pub async fn get_customer(
    query: web::Query<CustomerGet>,
    pg: web::Data<PgPool>,
    client: web::Data<Payment>,
) -> Result<HttpResponse, actix_web::Error> {
    let discord_id = query.0.discord_id.clone();
    let customer = client
        .customer_client
        .get_customer(&pg, discord_id)
        .await
        .context("Failed to get a customer from the database")
        .map_err(e500)?;
    Ok(HttpResponse::Ok().json(customer))
}

pub async fn delete_customer(
    query: web::Json<String>,
    client: web::Data<Payment>,
    pg: web::Data<PgPool>,
) -> Result<HttpResponse, actix_web::Error> {
    // get connected stripe id from db
    let cus_id = query.into_inner();

    let stripe_id = client
        .customer_client
        .get_owner_stripe_id(&pg, cus_id.clone())
        .await
        .context("Failed to perform a query to fetch owner's stripe id")
        .map_err(e500)?;

    let mut cus_client = client.customer_client.clone();
    let result = cus_client
        .client
        .delete_customer(CustomerDeleteRequest {
            customer_id: cus_id.clone(),
            stripe_account: stripe_id.clone(),
        })
        .await
        .map_err(e500)?;

    let reply = result.into_inner();
    Ok(HttpResponse::Ok().json(reply.deleted))
}
