use actix_web::{web, HttpResponse};
use sqlx::{PgPool, Postgres, Transaction};
use stripe_server::payments_v1::product_handler_client::ProductHandlerClient;
use tonic::transport::{Channel, Uri};

use crate::utils::e500;

use super::Payment;

#[derive(Clone)]
pub struct ProductClient {
    pub client: ProductHandlerClient<Channel>,
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct SubInfo {
    pub prod_id: String,
    pub price_id: String,
    pub sub_name: String,
    pub sub_description: String,
    pub server_id: String,
    pub num_subscribed: i32,
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

    #[tracing::instrument(name = "Creating Sub Info in DB", skip(transaction, self))]
    pub async fn create_product(
        &self,
        transaction: &mut Transaction<'_, Postgres>,
        sub_info: &SubInfo,
    ) -> Result<(), sqlx::Error> {
        sqlx::query!(
            r#"
            INSERT INTO sub_info (prod_id, price_id, sub_name, sub_description, server_id, num_subscribed)
            VALUES ($1, $2, $3, $4, $5, $6)
            "#,
            sub_info.prod_id,
            sub_info.price_id,
            sub_info.sub_name,
            sub_info.sub_description,
            sub_info.server_id,
            sub_info.num_subscribed
        ).execute(transaction).await?;
        Ok(())
    }

    #[tracing::instrument(name = "Increment Sub Info in DB", skip(transaction, self))]
    pub async fn increment_product(
        &self,
        transaction: &mut Transaction<'_, Postgres>,
        prod_id: String,
    ) -> Result<(), sqlx::Error> {
        sqlx::query!(
            r#"
            UPDATE sub_info
            SET num_subscribed = num_subscribed + 1
            WHERE prod_id = $1
            "#,
            prod_id
        )
        .execute(transaction)
        .await?;
        Ok(())
    }

    #[tracing::instrument(name = "Decrement Sub Info in DB", skip(transaction, self))]
    pub async fn decrement_product(
        &self,
        transaction: &mut Transaction<'_, Postgres>,
        prod_id: String,
    ) -> Result<(), sqlx::Error> {
        sqlx::query!(
            r#"
            UPDATE sub_info
            SET num_subscribed = num_subscribed - 1
            WHERE prod_id = $1
            "#,
            prod_id
        )
        .execute(transaction)
        .await?;
        Ok(())
    }

    #[tracing::instrument(name = "Getting Products from DB", skip(pool, self))]
    pub async fn get_product(
        &self,
        pool: &PgPool,
        prod_id: String,
    ) -> Result<SearchProduct, sqlx::Error> {
        let rows = sqlx::query_as!(
            SearchProduct,
            r#"
        SELECT s.prod_id,s.sub_name,s.sub_description,s.server_id,s.num_subscribed,p.sub_price,p.price_id FROM sub_info s 
        INNER JOIN (select * from sub_price) p on p.price_id = s.price_id WHERE s.prod_id = $1 
        "#,
            prod_id
        )
        .fetch_one(pool)
        .await?;
        Ok(rows)
    }

    #[tracing::instrument(name = "Getting Owner Products from DB", skip(pool, self))]
    pub async fn get_owner_products(
        &self,
        pool: &PgPool,
        discord_id: String,
    ) -> Result<Vec<SearchProduct>, sqlx::Error> {
        let rows = sqlx::query_as!(
            SearchProduct,
            r#"
        SELECT s.prod_id,s.sub_name,s.sub_description,s.server_id,s.num_subscribed,p.sub_price,p.price_id FROM sub_info s 
        INNER JOIN (select * from sub_price) p on p.price_id = s.price_id 
        WHERE s.server_id in (select server_id from guilds where discord_id = $1)
        "#,
            discord_id
        )
        .fetch_all(pool)
        .await?;
        Ok(rows)
    }
}

// owner's products from DB
pub async fn search_owner_product(
    product: web::Query<String>,
    client: web::Data<Payment>,
    pg: web::Data<PgPool>,
) -> Result<HttpResponse, actix_web::Error> {
    // search product from DB using owner's discord_id
    let results = client
        .product_client
        .get_owner_products(&pg, product.into_inner())
        .await
        .map_err(e500)?;

    Ok(HttpResponse::Ok().json(results))
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct SearchProductRequest {
    pub prod_id: String,
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct SearchProduct {
    pub prod_id: String,
    pub price_id: String,
    pub sub_price: i32,
    pub sub_name: String,
    pub sub_description: String,
    pub server_id: String,
    pub num_subscribed: i32,
}

// customer searching for products given prod_id
pub async fn search_product(
    product: web::Query<SearchProductRequest>,
    client: web::Data<Payment>,
    pg: web::Data<PgPool>,
) -> Result<HttpResponse, actix_web::Error> {
    // search product from DB using prod id
    let prod = client
        .product_client
        .get_product(&pg, product.0.prod_id.clone())
        .await
        .map_err(e500)?;

    Ok(HttpResponse::Ok().json(prod))
}
