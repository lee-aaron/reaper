use std::collections::HashMap;

use actix_web::http::StatusCode;
use actix_web::{http::Uri, web, HttpResponse, ResponseError};
use anyhow::Context;
use serde_json::json;
use sqlx::{PgPool, Postgres, Transaction};
use stripe_server::payments_v1::CustomerCreateRequest;
use stripe_server::payments_v1::{
    subscription_handler_client::SubscriptionHandlerClient, CreateSubscriptionRequest,
};
use tonic::transport::Channel;

use crate::{
    routes::{error_chain_fmt, get_owner_id},
    utils::e500,
};

use super::{CustomerError, Payment};

#[derive(Clone)]
pub struct SubscriptionClient {
    pub client: SubscriptionHandlerClient<Channel>,
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct SubscriptionObject {
    pub cus_id: String,
    pub discord_id: String,
    pub prod_id: String,
    pub server_id: String,
    pub sub_id: String,
}

impl SubscriptionClient {
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
        let client = SubscriptionHandlerClient::new(channel.clone());
        SubscriptionClient { client }
    }

    pub async fn create_subscriptions(
        &self,
        transaction: &mut Transaction<'_, Postgres>,
        cus_sub: &SubscriptionObject,
    ) -> Result<(), sqlx::Error> {
        sqlx::query!(
            r#"
            INSERT INTO cus_subscriptions (cus_id, discord_id, prod_id, server_id, sub_id)
            VALUES ($1, $2, $3, $4, $5)
            "#,
            cus_sub.cus_id,
            cus_sub.discord_id,
            cus_sub.prod_id,
            cus_sub.server_id,
            cus_sub.sub_id
        )
        .execute(transaction)
        .await?;
        Ok(())
    }

    pub async fn get_subscriptions(
        &self,
        pool: &PgPool,
        discord_id: String,
    ) -> Result<Vec<SubscriptionSearchResponse>, sqlx::Error> {
        let subscriptions = sqlx::query_as!(
            SubscriptionSearchResponse,
            r#"
            select c.*,g.*,s.sub_name,s.sub_description,p.sub_price from sub_info s 
            inner join (select prod_id, sub_id, cus_id from cus_subscriptions where discord_id = $1) c on c.prod_id = s.prod_id 
            inner join (select * from guild_info) g on g.server_id = s.server_id 
            inner join (select * from sub_price) p on p.price_id = s.price_id
            "#,
            discord_id
        )
        .fetch_all(pool)
        .await?;
        Ok(subscriptions)
    }

    pub async fn get_cus_id(
        &self,
        pool: &PgPool,
        server_id: String,
        discord_id: String,
    ) -> Result<Option<String>, sqlx::Error> {
        let r = sqlx::query!(
            r#"
            select cus_id from cus_subscriptions where discord_id = $1 and server_id = $2
            "#,
            discord_id,
            server_id
        )
        .fetch_optional(pool)
        .await?;
        Ok(r.map(|row| row.cus_id))
    }
}

#[derive(thiserror::Error)]
pub enum SubscriptionError {
    #[error(transparent)]
    UnexpectedError(#[from] anyhow::Error),
    #[error("No Subscription Found")]
    NoSubscriptionFound,
    #[error("Customer Fetch Error")]
    CustomerFetchError(#[from] CustomerError),
}

impl std::fmt::Debug for SubscriptionError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        error_chain_fmt(self, f)
    }
}

impl ResponseError for SubscriptionError {
    fn status_code(&self) -> StatusCode {
        match self {
            SubscriptionError::NoSubscriptionFound => StatusCode::NOT_FOUND,
            SubscriptionError::UnexpectedError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            SubscriptionError::CustomerFetchError(e) => CustomerError::status_code(e),
        }
    }
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct SubscriptionRequest {
    pub prod_id: String,
    pub price_id: String,
    pub server_id: String,
    pub discord_id: String,
}

// customer subscribes to a product
pub async fn create_subscription(
    client: web::Data<Payment>,
    req: web::Json<SubscriptionRequest>,
    pg: web::Data<PgPool>,
) -> Result<HttpResponse, SubscriptionError> {
    // find owner's stripe id
    let owner_id = get_owner_id(&pg, req.0.server_id.clone())
        .await
        .context("Failed to get owner id")?
        .ok_or(SubscriptionError::NoSubscriptionFound)?;

    let owner = client
        .account_client
        .get_account(&pg, owner_id)
        .await
        .context("Failed to get stripe id")?
        .ok_or(SubscriptionError::NoSubscriptionFound)?;

    // check that customer id doesn't exist
    let cus_id = client
        .subscription_client
        .get_cus_id(&pg, req.0.server_id.clone(), req.0.discord_id.clone())
        .await
        .context("Failed to get customer id")?;

    let cus_id = match cus_id {
        Some(id) => id,
        None => {
            // fetch customer name and email
            let customer = client
                .customer_client
                .get_customer(&pg, req.0.discord_id.clone())
                .await
                .context("Failed to get customer")?
                .ok_or(SubscriptionError::CustomerFetchError(
                    CustomerError::NoCustomerFound,
                ))?;

            // create customer on stripe
            let mut cus_client = client.customer_client.clone();
            let cus_result = cus_client
                .client
                .create_customer(CustomerCreateRequest {
                    customer_name: customer.name.clone(),
                    customer_email: customer.email.clone(),
                    metadata: HashMap::new(),
                    stripe_account: owner.stripe_id.clone(),
                })
                .await
                .context("Failed to create customer")?
                .into_inner();
            cus_result.customer_id
        }
    };

    // create subscription in stripe
    let mut sub_client = client.subscription_client.clone();
    let sub_result = sub_client
        .client
        .create_subscription(CreateSubscriptionRequest {
            customer_id: cus_id.clone(),
            price_id: req.0.price_id.clone(),
            stripe_account: owner.stripe_id.clone(),
        })
        .await
        .context("Failed to create subscription")?
        .into_inner();

    // update database
    // increment num_subscribed
    // insert into cus_subscriptions
    let mut transaction = pg.begin().await.context("Failed to start transaction")?;

    client
        .product_client
        .increment_product(&mut transaction, req.0.prod_id.clone())
        .await
        .context("Failed to increment product")?;

    client
        .subscription_client
        .create_subscriptions(
            &mut transaction,
            &SubscriptionObject {
                cus_id: cus_id.clone(),
                discord_id: req.0.discord_id.clone(),
                prod_id: req.0.prod_id.clone(),
                server_id: req.0.server_id.clone(),
                sub_id: sub_result.subscription_id.clone(),
            },
        )
        .await
        .context("Failed to create subscriptions")?;

    transaction
        .commit()
        .await
        .context("Failed to commit transaction")?;

    Ok(HttpResponse::Ok().json(json!({
        "prod_id": req.0.prod_id,
        "client_secret": sub_result.client_secret,
        "stripe_id": owner.stripe_id.clone(),
    })))
}


#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct SubscriptionSearch {
    pub discord_id: String,
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct SubscriptionSearchResponse {
    pub prod_id: String,
    pub sub_id: String,
    pub server_id: String,
    pub cus_id: String,
    pub name: String,
    pub icon: String,
    pub description: String,
    pub sub_name: String,
    pub sub_description: String,
    pub sub_price: i32,
}

// search for existing customer's subscriptions
pub async fn search_subscriptions(
    client: web::Data<Payment>,
    pg: web::Data<PgPool>,
    req: web::Query<SubscriptionSearch>,
) -> Result<HttpResponse, actix_web::Error> {
    let sub_client = client.subscription_client.clone();
    let res = sub_client
        .get_subscriptions(&pg, req.0.discord_id)
        .await
        .map_err(e500)?;
    Ok(HttpResponse::Ok().json(res))
}
