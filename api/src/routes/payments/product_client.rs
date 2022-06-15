use std::collections::HashMap;

use actix_web::{error::InternalError, web, HttpResponse};
use stripe_server::payments_v1::{product_handler_client::ProductHandlerClient, *};
use tonic::transport::{Channel, Uri};

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
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct ProductInfo {
    pub query: String,
}

pub async fn search_product(
    product: web::Query<ProductInfo>,
    client: web::Data<Payment>,
) -> Result<HttpResponse, InternalError<tonic::Status>> {
    
    // convert query to metadata search
    let query = serde_json::from_str::<HashMap<String, String>>(&product.0.query).unwrap();
    let metadata = query.iter().map(|(key, value)| {
        format!("metadata[\"{}\"]:\"{}\"", key, value)
    }).collect::<Vec<String>>().join(" AND ");

    let mut prd_client = client.product_client.clone();
    let result = prd_client
        .client
        .search_product(SearchProductRequest {
            query: metadata,
            limit: None,
            page: None
        })
        .await;

    if let Ok(reply) = result {
        let reply = reply.into_inner();

        Ok(HttpResponse::Ok().json(reply.products.into_iter().map(|prd| {
            Product {
                id: prd.id,
                name: prd.name,
                description: prd.description,
                metadata: prd.metadata,
                amount: prd.amount.checked_div(100).unwrap()
            }
        }).collect::<Vec<Product>>()))
    } else {
        let response = HttpResponse::InternalServerError().finish();
        Err(InternalError::from_response(result.unwrap_err(), response))
    }
}