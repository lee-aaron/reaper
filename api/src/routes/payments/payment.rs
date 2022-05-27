use std::net::ToSocketAddrs;

use actix_web::{error::InternalError, web, HttpResponse};
use shared::configuration::get_configuration;

use super::{
    customer_client::{CustomerClient, CustomerInfo},
    portal_client::PortalClient,
};

#[derive(Clone)]
pub struct Payment {
    pub customer_client: CustomerClient,
    pub portal_client: PortalClient,
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
        Payment {
            customer_client,
            portal_client,
        }
    }
}

pub async fn create_customer(
    customer: web::Json<CustomerInfo>,
    client: web::Data<Payment>,
) -> Result<HttpResponse, InternalError<anyhow::Error>> {
    let mut cus_client = client.customer_client.clone();
    let result = cus_client
        .create_customer(customer.0.customer_name, customer.0.customer_email)
        .await;

    if let Ok(reply) = result {
        Ok(HttpResponse::Ok().json(reply))
    } else {
        let response = HttpResponse::InternalServerError().finish();
        Err(InternalError::from_response(result.unwrap_err(), response))
    }
}

pub async fn get_customer(
    customer_id: String,
    client: web::Data<Payment>,
) -> Result<HttpResponse, InternalError<anyhow::Error>> {
    let mut cus_client = client.customer_client.clone();
    let result = cus_client.get_customer(customer_id).await;

    if let Ok(reply) = result {
        Ok(HttpResponse::Ok().json(reply))
    } else {
        let response = HttpResponse::InternalServerError().finish();
        Err(InternalError::from_response(result.unwrap_err(), response))
    }
}

pub async fn delete_customer(
    customer_id: String,
    client: web::Data<Payment>,
) -> Result<HttpResponse, InternalError<anyhow::Error>> {
    let mut cus_client = client.customer_client.clone();
    let result = cus_client.delete_customer(customer_id).await;

    if let Ok(reply) = result {
        Ok(HttpResponse::Ok().json(reply))
    } else {
        let response = HttpResponse::InternalServerError().finish();
        Err(InternalError::from_response(result.unwrap_err(), response))
    }
}
