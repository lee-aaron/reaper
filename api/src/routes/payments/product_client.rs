use actix_web::{error::InternalError, web, HttpResponse};
use payments_server::payments_v1::{product_handler_client::ProductHandlerClient, *};
use tonic::transport::{Channel, Uri};

use super::Payment;

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct ProductInfo {
    pub id: Option<String>,
    pub name: String,
    pub description: String,
}

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
}

pub async fn get_product(
    product: web::Query<ProductInfo>,
    client: web::Data<Payment>,
) -> Result<HttpResponse, InternalError<tonic::Status>> {
    let mut prd_client = client.product_client.clone();
    let result = prd_client
        .client
        .get_product(GetProductRequest {
            id: product.clone().0.id.unwrap_or("".to_string()),
        })
        .await;

    if let Ok(reply) = result {
        let reply = reply.into_inner();
        Ok(HttpResponse::Ok().json(ProductInfo {
            id: Some(product.clone().0.id.unwrap_or("".to_string())),
            name: reply.name,
            description: reply.description,
        }))
    } else {
        let response = HttpResponse::InternalServerError().finish();
        Err(InternalError::from_response(result.unwrap_err(), response))
    }
}

pub async fn update_product(
    product: web::Json<ProductInfo>,
    client: web::Data<Payment>,
) -> Result<HttpResponse, InternalError<tonic::Status>> {
    let mut prd_client = client.product_client.clone();
    let result = prd_client
        .client
        .update_product(UpdateProductRequest {
            id: product.0.id.unwrap_or("".to_string()),
            name: product.0.name,
            description: product.0.description,
        })
        .await;

    if let Ok(reply) = result {
        let reply = reply.into_inner();
        Ok(HttpResponse::Ok().json(reply.updated))
    } else {
        let response = HttpResponse::InternalServerError().finish();
        Err(InternalError::from_response(result.unwrap_err(), response))
    }
}

pub async fn delete_product(
    product: web::Form<ProductInfo>,
    client: web::Data<Payment>,
) -> Result<HttpResponse, InternalError<tonic::Status>> {
    let mut prd_client = client.product_client.clone();
    let result = prd_client
        .client
        .delete_product(DeleteProductRequest {
            id: product.0.id.unwrap_or("".to_string()),
        })
        .await;

    if let Ok(reply) = result {
        let reply = reply.into_inner();
        Ok(HttpResponse::Ok().json(reply.deleted))
    } else {
        let response = HttpResponse::InternalServerError().finish();
        Err(InternalError::from_response(result.unwrap_err(), response))
    }
}
