use actix_web::{http::Uri, web, HttpResponse};
use serde_json::json;
use sqlx::{PgPool, Postgres, Transaction};
use stripe_server::payments_v1::{
    subscription_handler_client::SubscriptionHandlerClient, CreateSubscriptionRequest,
};
use tonic::transport::Channel;

use crate::utils::e500;

use super::Payment;

#[derive(Clone)]
pub struct SubscriptionClient {
    pub client: SubscriptionHandlerClient<Channel>,
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

    pub async fn insert_into_subscriptions(
        &self,
        transaction: &mut Transaction<'_, Postgres>,
        product_id: String,
        discord_id: String,
        subscription_name: String,
        subscription_description: String,
        discord_name: String,
        discord_icon: String,
        subscription_price: String,
    ) -> Result<(), sqlx::Error> {
        sqlx::query!(
            r#"
            INSERT INTO subscriptions (prod_id, discord_id, subscription_name, subscription_description, discord_name, discord_icon, subscription_price)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            "#,
            product_id,
            discord_id,
            subscription_name,
            subscription_description,
            discord_name,
            discord_icon,
            subscription_price
        )
        .execute(transaction)
        .await?;
        Ok(())
    }

    pub async fn get_from_subscriptions(
        &self,
        pool: &PgPool,
        product_id: String,
    ) -> Result<SubscriptionSearchResponse, anyhow::Error> {
        let subscriptions = sqlx::query_as!(
            SubscriptionSearchResponse,
            r#"
            SELECT discord_id, discord_name, discord_icon, subscription_name, subscription_description, subscription_price FROM subscriptions
            WHERE prod_id = $1
            "#,
            product_id
        )
        .fetch_one(pool)
        .await?;
        Ok(subscriptions)
    }
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct SubscriptionRequest {
    pub customer_id: String,
    pub prod_id: String,
}

pub async fn create_subscription(
    client: web::Data<Payment>,
    req: web::Json<SubscriptionRequest>,
    pg: web::Data<PgPool>,
) -> Result<HttpResponse, actix_web::Error> {
    let mut sub_client = client.subscription_client.clone();
    // look up stripe account id with server id
    let search_res = sub_client
        .get_from_subscriptions(&pg, req.0.prod_id.clone())
        .await
        .map_err(e500)?;
    let owner_id = client
        .product_client
        .get_owner_id_from_guilds(&pg, search_res.discord_id)
        .await
        .map_err(e500)?;
    let (stripe_account_id, _) = client
        .account_client
        .get_account(&pg, owner_id)
        .await
        .map_err(e500)?;

    let res = sub_client
        .client
        .create_subscription(CreateSubscriptionRequest {
            customer_id: req.0.customer_id,
            price_id: req.0.prod_id.clone(),
            stripe_account: stripe_account_id.clone(),
        })
        .await
        .map_err(e500)?;

    let reply = res.into_inner();

    Ok(HttpResponse::Ok().json(json!({
        "product_id": req.0.prod_id,
        "subscription_id": reply.subscription_id,
        "client_secret": reply.client_secret,
        "stripe_account": stripe_account_id,
    })))
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct SubscriptionSearchRequest {
    pub prod_id: String,
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct SubscriptionSearchResponse {
    pub subscription_name: String,
    pub subscription_description: String,
    pub discord_name: String,
    pub discord_icon: String,
    pub subscription_price: String,
    pub discord_id: String,
}

pub async fn search_subscriptions(
    client: web::Data<Payment>,
    pg: web::Data<PgPool>,
    req: web::Query<SubscriptionSearchRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    let sub_client = client.subscription_client.clone();
    let res = sub_client
        .get_from_subscriptions(&pg, req.0.prod_id)
        .await
        .map_err(e500)?;
    Ok(HttpResponse::Ok().json(res))
}
