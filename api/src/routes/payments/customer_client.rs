use std::collections::HashMap;

use actix_web::{error::InternalError, web, HttpResponse};
use stripe_server::payments_v1::customer_handler_client::CustomerHandlerClient;
use stripe_server::payments_v1::*;
use tonic::transport::{Channel, Uri};

use super::Payment;

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct CustomerInfo {
    pub customer_name: String,
    pub customer_email: String,
    pub metadata: HashMap<String, String>,
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
}

pub async fn create_customer(
    customer: web::Json<CustomerInfo>,
    client: web::Data<Payment>,
) -> Result<HttpResponse, InternalError<tonic::Status>> {
    let mut cus_client = client.customer_client.clone();
    let result = cus_client
        .client
        .create_customer(CustomerCreateRequest {
            customer_name: customer.0.customer_name,
            customer_email: customer.0.customer_email,
            metadata: customer.0.metadata,
        })
        .await;

    if let Ok(reply) = result {
        let reply = reply.into_inner();
        Ok(HttpResponse::Ok().json(reply.customer_id))
    } else {
        let response = HttpResponse::InternalServerError().finish();
        Err(InternalError::from_response(result.unwrap_err(), response))
    }
}

pub async fn get_customer(
    customer_id: String,
    client: web::Data<Payment>,
) -> Result<HttpResponse, InternalError<tonic::Status>> {
    let mut cus_client = client.customer_client.clone();
    let result = cus_client
        .client
        .get_customer(CustomerGetRequest { customer_id })
        .await;

    if let Ok(reply) = result {
        let reply = reply.into_inner();
        Ok(HttpResponse::Ok().json(CustomerInfo {
            customer_name: reply.customer_name,
            customer_email: reply.customer_email,
            metadata: reply.metadata,
        }))
    } else {
        let response = HttpResponse::InternalServerError().finish();
        Err(InternalError::from_response(result.unwrap_err(), response))
    }
}

pub async fn delete_customer(
    customer_id: String,
    client: web::Data<Payment>,
) -> Result<HttpResponse, InternalError<tonic::Status>> {
    let mut cus_client = client.customer_client.clone();
    let result = cus_client
        .client
        .delete_customer(CustomerDeleteRequest { customer_id })
        .await;

    if let Ok(reply) = result {
        let reply = reply.into_inner();
        Ok(HttpResponse::Ok().json(reply.deleted))
    } else {
        let response = HttpResponse::InternalServerError().finish();
        Err(InternalError::from_response(result.unwrap_err(), response))
    }
}
