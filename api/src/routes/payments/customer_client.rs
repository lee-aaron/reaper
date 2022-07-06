use std::collections::HashMap;

use actix_web::{web, HttpResponse};
use anyhow::Context;
use serde_json::json;
use sqlx::{PgPool, Postgres, Transaction};
use stripe_server::payments_v1::customer_handler_client::CustomerHandlerClient;
use stripe_server::payments_v1::*;
use tonic::transport::{Channel, Uri};

use crate::utils::e500;

use super::Payment;

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct CustomerInfo {
    pub customer_name: String,
    pub customer_email: String,
    pub metadata: HashMap<String, String>,
    pub server_id: String,
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct CustomerIdInfo {
    pub customer_id: String,
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct CustomerGetInfo {
    pub server_id: String,
    pub discord_id: String,
}

#[derive(Clone)]
pub struct CustomerClient {
    pub client: CustomerHandlerClient<Channel>,
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

    #[tracing::instrument(name = "create_customers", skip(transaction, self))]
    pub async fn insert_into_db(
        &self,
        transaction: &mut Transaction<'_, Postgres>,
        cus_id: String,
        discord_id: String,
        server_id: String,
        cus_name: String,
        cus_email: String,
    ) -> Result<(), anyhow::Error> {
        sqlx::query!(
            r#"
            INSERT INTO customers (cus_id, discord_id, server_id, cus_name, cus_email)
            VALUES ($1, $2, $3, $4, $5)
            "#,
            cus_id,
            discord_id,
            server_id,
            cus_name,
            cus_email
        )
        .execute(transaction)
        .await?;
        Ok(())
    }

    #[tracing::instrument(name = "update_customer_prod_id", skip(transaction, self))]
    pub async fn update_customer_prod_id(
        &self,
        transaction: &mut Transaction<'_, Postgres>,
        cus_id: String,
        prod_id: String,
    ) -> Result<(), anyhow::Error> {
        sqlx::query!(
            r#"
            UPDATE customers SET prod_id = $1 WHERE cus_id = $2
            "#,
            prod_id,
            cus_id
        )
        .execute(transaction)
        .await?;
        Ok(())
    }

    #[tracing::instrument(name = "get_customer_info", skip(pool, self))]
    pub async fn get_server_id(
        &self,
        pool: &PgPool,
        cus_id: String,
    ) -> Result<String, anyhow::Error> {
        let row = sqlx::query!(
            r#"
            SELECT server_id FROM customers WHERE cus_id = $1
            "#,
            cus_id
        )
        .fetch_optional(pool)
        .await
        .context("Failed to perform a query to get server id")?;

        if let Some(row) = row {
            Ok(row.server_id)
        } else {
            Err(anyhow::anyhow!("Failed to get server id"))
        }
    }
}

pub async fn create_customer(
    customer: web::Json<CustomerInfo>,
    client: web::Data<Payment>,
    pg: web::Data<PgPool>,
) -> Result<HttpResponse, actix_web::Error> {
    // look up stripe account id with server id
    let owner_id = client
        .product_client
        .get_owner_id_from_guilds(&pg, customer.0.server_id.clone())
        .await
        .map_err(e500)?;
    let (stripe_account_id, _) = client
        .account_client
        .get_account(&pg, owner_id)
        .await
        .map_err(e500)?;

    let mut cus_client = client.customer_client.clone();
    let result = cus_client
        .client
        .create_customer(CustomerCreateRequest {
            customer_name: customer.0.customer_name.clone(),
            customer_email: customer.0.customer_email.clone(),
            metadata: customer.0.metadata.clone(),
            stripe_account: stripe_account_id,
        })
        .await
        .map_err(e500)?;

    let reply = result.into_inner();

    // insert into customer db
    let mut transaction = pg
        .begin()
        .await
        .context("Failed to acquire a Postgres connection from the pool")
        .map_err(e500)?;

    let discord_id = customer
        .0
        .metadata
        .get("discord_id")
        .map_or("", String::as_str);

    client
        .customer_client
        .insert_into_db(
            &mut transaction,
            reply.customer_id.clone(),
            discord_id.to_string(),
            customer.0.server_id.clone(),
            customer.0.customer_name,
            customer.0.customer_email
        )
        .await
        .context("Failed to create a customer in the database")
        .map_err(e500)?;

    transaction
        .commit()
        .await
        .context("Failed to commit the transaction")
        .map_err(e500)?;

    Ok(HttpResponse::Ok().json(json!({
        "id": reply.customer_id,
        "server_id": customer.0.server_id,
    })))
}

// pub async fn get_customer(
//     query: web::Query<CustomerIdInfo>,
//     client: web::Data<Payment>,
//     pg: web::Data<PgPool>,
// ) -> Result<HttpResponse, actix_web::Error> {
//     let server_id = client
//         .customer_client
//         .get_server_id(&pg, query.0.customer_id.clone())
//         .await
//         .map_err(e500)?;

//     let (stripe_account_id, _) = client
//         .account_client
//         .get_account(&pg, server_id)
//         .await
//         .map_err(e500)?;

//     let mut cus_client = client.customer_client.clone();
//     let result = cus_client
//         .client
//         .get_customer(CustomerGetRequest {
//             customer_id: query.0.customer_id,
//             stripe_account: stripe_account_id,
//         })
//         .await
//         .map_err(e500)?;

//     let reply = result.into_inner();
//     Ok(HttpResponse::Ok().json(json!({
//         "customer_name": reply.customer_name,
//         "customer_email": reply.customer_email,
//         "metadata": reply.metadata,
//     })))
// }

pub async fn get_customer_db(
    query: web::Query<CustomerGetInfo>,
    pg: web::Data<PgPool>,
) -> Result<HttpResponse, actix_web::Error> {
    let row = sqlx::query!(
        r#"
        SELECT * FROM customers WHERE server_id = $1 AND discord_id = $2
        "#,
        query.0.server_id,
        query.0.discord_id
    )
    .fetch_optional(&**pg)
    .await
    .context("Failed to perform a query to get customer info")
    .map_err(e500)?;

    if let Some(row) = row {
        Ok(HttpResponse::Ok().json(json!({
            "customer_id": row.cus_id,
            "customer_name": row.cus_name,
            "customer_email": row.cus_email,
            "server_id": query.0.server_id,
            "prod_id": row.prod_id,
        })))
    } else {
        Err(e500("Failed to get customer info"))
    }
}

pub async fn delete_customer(
    query: web::Json<CustomerIdInfo>,
    client: web::Data<Payment>,
    pg: web::Data<PgPool>,
) -> Result<HttpResponse, actix_web::Error> {
    let server_id = client
        .customer_client
        .get_server_id(&pg, query.0.customer_id.clone())
        .await
        .map_err(e500)?;

    let (stripe_account_id, _) = client
        .account_client
        .get_account(&pg, server_id)
        .await
        .map_err(e500)?;

    let mut cus_client = client.customer_client.clone();
    let result = cus_client
        .client
        .delete_customer(CustomerDeleteRequest {
            customer_id: query.0.customer_id,
            stripe_account: stripe_account_id,
        })
        .await
        .map_err(e500)?;

    let reply = result.into_inner();
    Ok(HttpResponse::Ok().json(reply.deleted))
}
