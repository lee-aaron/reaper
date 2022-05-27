use actix_web::{error::InternalError, web, HttpResponse};
use payments_server::payments_v1::{price_handler_client::PriceHandlerClient, *};
use tonic::transport::{Channel, Uri};

use super::Payment;

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct PriceInfo {
    pub price_id: String,
    pub product_id: String,
    pub price: i64,
    pub currency: String,
}

#[derive(Clone)]
pub struct PricesClient {
    pub client: PriceHandlerClient<Channel>,
}

impl PricesClient {
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
        let client = PriceHandlerClient::new(channel.clone());
        PricesClient { client }
    }
}

pub async fn create_price(
    query: web::Form<PriceInfo>,
    client: web::Data<Payment>,
) -> Result<HttpResponse, InternalError<tonic::Status>> {
    let mut prc_client = client.price_client.clone();
    let result = prc_client
        .client
        .create_price(CreatePriceRequest {
            product: query.0.product_id,
            amount: query.0.price,
            currency: "USD".to_string(),
        })
        .await;

    if let Ok(reply) = result {
        let reply = reply.into_inner();
        Ok(HttpResponse::Ok().json(reply.price_id))
    } else {
        let response = HttpResponse::InternalServerError().finish();
        Err(InternalError::from_response(result.unwrap_err(), response))
    }
}

pub async fn get_price(
    query: web::Query<PriceInfo>,
    client: web::Data<Payment>,
) -> Result<HttpResponse, InternalError<tonic::Status>> {
    let mut prc_client = client.price_client.clone();
    let result = prc_client
        .client
        .get_price(GetPriceRequest { price_id: query.0.price_id })
        .await;

    if let Ok(reply) = result {
        let reply = reply.into_inner();
        let price_info = PriceInfo {
            price_id: reply.price_id,
            product_id: reply.product,
            price: reply.amount,
            currency: reply.currency,
        };
        Ok(HttpResponse::Ok().json(price_info))
    } else {
        let response = HttpResponse::InternalServerError().finish();
        Err(InternalError::from_response(result.unwrap_err(), response))
    }
}
