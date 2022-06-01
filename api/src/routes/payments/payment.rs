use std::net::ToSocketAddrs;

use actix_web::{error::InternalError, web, HttpResponse};
use shared::configuration::get_configuration;

use super::{
    customer_client::CustomerClient, portal_client::PortalClient, prices_client::PricesClient,
    ProductClient,
};

#[derive(Clone)]
pub struct Payment {
    pub customer_client: CustomerClient,
    pub portal_client: PortalClient,
    pub price_client: PricesClient,
    pub product_client: ProductClient,
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
        Payment {
            customer_client,
            portal_client,
            price_client,
            product_client,
        }
    }
}

#[derive(serde::Serialize, serde::Deserialize, Clone)]
pub struct ProductFlow {
    pub name: String,
    pub email: String,
    pub product_name: String,
    pub description: String,
    pub price: i64,
}

pub async fn create_product_flow(
    query: web::Json<ProductFlow>,
    payment: web::Data<Payment>,
) -> Result<HttpResponse, InternalError<tonic::Status>> {
    let mut product_client = payment.product_client.clone();
    let mut price_client = payment.price_client.clone();

    // create metadata for product

    // assert each discord server only has < 5 products

    // create product

    // create price

    // update product

    Ok(HttpResponse::Ok().finish())
}
