use std::collections::HashMap;

use actix_web::{web, HttpResponse};
use sqlx::{PgPool, Transaction, Postgres};
use stripe_server::payments_v1::{product_handler_client::ProductHandlerClient, *};
use tonic::transport::{Channel, Uri};

use crate::utils::e500;

use super::Payment;

#[derive(Clone)]
pub struct ProductClient {
    pub client: ProductHandlerClient<Channel>,
}

impl ProductClient {
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
        let client = ProductHandlerClient::new(channel.clone());
        ProductClient { client }
    }

    pub async fn insert_into_db(
        &self,
        transaction: &mut Transaction<'_, Postgres>,
        product_id: String,
        discord_id: String,
        subscription_name: String,
        subscription_description: String,
        discord_name: String,
        discord_icon: String,
    ) -> Result<(), sqlx::Error> {
        sqlx::query!(
            r#"
            INSERT INTO subscriptions (prod_id, discord_id, subscription_name, subscription_description, discord_name, discord_icon)
            VALUES ($1, $2, $3, $4, $5, $6)
            "#,
            product_id,
            discord_id,
            subscription_name,
            subscription_description,
            discord_name,
            discord_icon
        )
        .execute(transaction)
        .await?;
        Ok(())
    }
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct ProductInfo {
    pub query: String,
    pub discord_id: String,
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct DeleteProduct {
    pub product_id: String,
    pub discord_id: String,
}

pub async fn search_product(
    product: web::Query<ProductInfo>,
    client: web::Data<Payment>,
    pg: web::Data<PgPool>,
) -> Result<HttpResponse, actix_web::Error> {
    // fetch stripe account id from postgres db
    let (stripe_account_id, _) = client
        .account_client
        .get_account(&pg, product.0.discord_id.clone())
        .await
        .map_err(e500)?;

    // convert query to metadata search
    let query = serde_json::from_str::<HashMap<String, String>>(&product.0.query).unwrap();
    let metadata = query
        .iter()
        .map(|(key, value)| format!("metadata[\"{}\"]:\"{}\"", key, value))
        .collect::<Vec<String>>()
        .join(" AND ");

    let mut prd_client = client.product_client.clone();
    let result = prd_client
        .client
        .search_product(SearchProductRequest {
            query: metadata,
            limit: None,
            page: None,
            stripe_account: stripe_account_id.clone(),
        })
        .await
        .map_err(e500)?;

    let reply = result.into_inner();

    Ok(HttpResponse::Ok().json(
        reply
            .products
            .into_iter()
            .map(|prd| Product {
                id: prd.id,
                name: prd.name,
                description: prd.description,
                metadata: prd.metadata,
                amount: prd.amount.checked_div(100).unwrap(),
            })
            .collect::<Vec<Product>>(),
    ))
}
