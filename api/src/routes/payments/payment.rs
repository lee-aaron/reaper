use std::{collections::HashMap, net::ToSocketAddrs};

use actix_web::{web, HttpResponse};
use anyhow::Context;
use shared::configuration::get_configuration;
use sqlx::PgPool;
use stripe_server::payments_v1::CreateProductRequest;

use crate::{
    routes::{insert_bot_status, insert_guild_info, insert_guilds, insert_role, GuildInfo},
    utils::e500,
};

use super::{
    AccountClient, CustomerClient, PortalClient, PriceObject, PricesClient, ProductClient, SubInfo,
    SubscriptionClient,
};

#[derive(Clone)]
pub struct Payment {
    pub customer_client: CustomerClient,
    pub portal_client: PortalClient,
    pub price_client: PricesClient,
    pub product_client: ProductClient,
    pub account_client: AccountClient,
    pub subscription_client: SubscriptionClient,
}

impl Payment {
    pub fn new() -> Payment {
        let configuration = get_configuration().expect("Failed to read configuration");
        let addr = match format!(
            "{}:{}",
            configuration.payments.host, configuration.payments.port
        )
        .to_socket_addrs()
        {
            Ok(mut addrs) => addrs.next().unwrap(),
            Err(e) => panic!("Failed to resolve address: {}", e),
        };
        let customer_client = CustomerClient::new(&addr.clone().to_string());
        let portal_client = PortalClient::new(&addr.clone().to_string());
        let price_client = PricesClient::new(&addr.clone().to_string());
        let product_client = ProductClient::new(&addr.clone().to_string());
        let account_client = AccountClient::new(&addr.clone().to_string());
        let subscription_client = SubscriptionClient::new(&addr.clone().to_string());
        Payment {
            customer_client,
            portal_client,
            price_client,
            product_client,
            account_client,
            subscription_client,
        }
    }
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct ProductFlow {
    pub name: String,
    pub email: String,
    pub product_name: String,
    pub description: String,
    pub price: i64,
    pub target_server: String,
    pub discord_id: String,
    pub discord_name: String,
    pub discord_description: String,
    pub discord_icon: String,
    pub role_id: Option<String>,
    pub role_name: Option<String>,
}

#[tracing::instrument(name = "product_flow", skip(pg, client))]
pub async fn create_product_flow(
    query: web::Json<ProductFlow>,
    client: web::Data<Payment>,
    pg: web::Data<PgPool>,
) -> Result<HttpResponse, actix_web::Error> {
    let mut product_client = client.product_client.clone();

    // assert price is minimum 10 dollars
    if query.0.price < 10 {
        return Err(e500("Price must be at least $10"));
    }

    // assert role name is not none if role id is not none
    if query.0.role_id.is_none() && query.0.role_name.is_some() {
        return Err(e500("Role ID must be set if Role Name is set"));
    }

    // assert role id is not none if role name is not none
    if query.0.role_id.is_some() && query.0.role_name.is_none() {
        return Err(e500("Role Name must be set if Role ID is set"));
    }

    // fetch stripe account id from postgres db
    let owner = client
        .account_client
        .get_account(&pg, query.0.discord_id.clone())
        .await
        .context("Failed to get account")
        .map_err(e500)?
        .ok_or(e500("Failed to get account"))?;

    // create product
    // create metadata for product
    let mut metadata = HashMap::new();
    metadata.insert("email".to_string(), query.0.email.clone());
    metadata.insert(
        "discord_server_id".to_string(),
        query.0.target_server.clone(),
    );
    metadata.insert(
        "discord_server_name".to_string(),
        query.0.discord_name.clone(),
    );
    metadata.insert(
        "discord_server_icon".to_string(),
        query.0.discord_icon.clone(),
    );

    let res = product_client
        .client
        .create_product(CreateProductRequest {
            name: query.0.product_name.clone(),
            description: query.0.description.clone(),
            metadata: metadata.clone(),
            stripe_account: owner.stripe_id.clone(),
            amount: query.0.price.checked_mul(100).unwrap(),
        })
        .await
        .map_err(e500)?
        .into_inner();

    // add product id to metadata
    metadata.insert("product_id".to_string(), res.prod_id.clone());

    let mut transaction = pg
        .begin()
        .await
        .context("Failed to acquire a Postgres connection from the pool")
        .map_err(e500)?;

    // insert guild info into db
    insert_guild_info(
        &mut transaction,
        &GuildInfo {
            server_id: query.0.target_server.clone(),
            name: query.0.discord_name.clone(),
            description: query.0.discord_description.clone(),
            icon: query.0.discord_icon.clone(),
        },
    )
    .await
    .map_err(e500)?;

    // if using a role, insert into db
    if query.0.role_id.is_some() {
        let role_name = query.0.role_name.ok_or(e500("Role name is not set"))?;
        let role_id = query.0.role_id.as_deref().unwrap_or("").to_string();
        insert_role(
            &mut transaction,
            role_id,
            role_name,
            query.0.target_server.clone(),
        )
        .await
        .context("Failed to insert role")
        .map_err(e500)?;
    }

    // insert guilds
    insert_guilds(
        &mut transaction,
        query.0.discord_id.clone(),
        query.0.target_server.clone(),
    )
    .await
    .map_err(e500)?;

    // insert bot status
    insert_bot_status(&mut transaction, query.0.target_server.clone())
        .await
        .map_err(e500)?;

    // insert sub_price into db
    client
        .price_client
        .create_price(
            &mut transaction,
            &PriceObject {
                price_id: res.price_id.clone(),
                sub_price: query.0.price as i32,
            },
        )
        .await
        .map_err(e500)?;

    // insert sub_info into postgres db
    client
        .product_client
        .create_product(
            &mut transaction,
            &SubInfo {
                prod_id: res.prod_id.clone(),
                price_id: res.price_id.clone(),
                sub_name: query.0.product_name.clone(),
                sub_description: query.0.description.clone(),
                server_id: query.0.target_server.clone(),
                num_subscribed: 0,
                role_id: query.0.role_id,
            },
        )
        .await
        .map_err(e500)?;

    transaction
        .commit()
        .await
        .context("Failed to commit transaction")
        .map_err(e500)?;

    Ok(HttpResponse::Ok().finish())
}
