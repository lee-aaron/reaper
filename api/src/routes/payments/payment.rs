use std::{collections::HashMap, net::ToSocketAddrs};

use actix_web::{error::InternalError, web, HttpResponse};
use stripe_server::payments_v1::{CreatePriceRequest, CreateProductRequest};
use shared::configuration::get_configuration;

use super::{
    customer_client::CustomerClient, portal_client::PortalClient, prices_client::PricesClient,
    ProductClient, AccountClient,
};

#[derive(Clone)]
pub struct Payment {
    pub customer_client: CustomerClient,
    pub portal_client: PortalClient,
    pub price_client: PricesClient,
    pub product_client: ProductClient,
    pub account_client: AccountClient,
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
        Payment {
            customer_client,
            portal_client,
            price_client,
            product_client,
            account_client,
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
}

pub async fn create_product_flow(
    query: web::Json<ProductFlow>,
    payment: web::Data<Payment>,
) -> Result<HttpResponse, InternalError<tonic::Status>> {
    let mut product_client = payment.product_client.clone();
    let mut price_client = payment.price_client.clone();

    // assert each discord server only has < 3 products
    // store in postgres db discord server id -> num products

    // create product
    // create metadata for product
    let mut metadata = HashMap::new();
    metadata.insert("email".to_string(), query.0.email.clone());
    metadata.insert("discord_server_id".to_string(), query.0.target_server.clone());

    let res = product_client
        .client
        .create_product(CreateProductRequest {
            name: query.0.product_name.clone(),
            description: query.0.description.clone(),
            metadata: metadata.clone(),
        })
        .await;

    if let Err(e) = res {
        let response = HttpResponse::InternalServerError().finish();
        return Err(InternalError::from_response(e, response));
    }

    // add product id to metadata
    let product_id = res.ok().unwrap().into_inner().id;
    metadata.insert("product_id".to_string(), product_id.clone());

    // create price
    let res = price_client
        .client
        .create_price(CreatePriceRequest {
            currency: "USD".to_string(),
            amount: query.0.price.checked_mul(100).unwrap(),
            product: product_id,
            metadata,
        })
        .await;

    if let Err(e) = res {
        let response = HttpResponse::InternalServerError().finish();
        return Err(InternalError::from_response(e, response));
    }

    Ok(HttpResponse::Ok().finish())
}
