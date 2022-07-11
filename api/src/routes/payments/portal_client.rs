use actix_web::{web, HttpResponse};
use sqlx::PgPool;
use stripe_server::payments_v1::{portal_handler_client::PortalHandlerClient, CreatePortalRequest};
use tonic::transport::{Channel, Uri};

use crate::utils::{e500, see_other};

use super::Payment;

#[derive(Clone)]
pub struct PortalClient {
    pub client: PortalHandlerClient<Channel>,
}

impl PortalClient {
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
        let client = PortalHandlerClient::new(channel.clone());
        PortalClient { client }
    }
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct PortalInfoReq {
    pub customer_id: String,
    pub return_url: String,
    pub server_id: String,
}

pub async fn create_portal(
    query: web::Query<PortalInfoReq>,
    client: web::Data<Payment>,
    pg: web::Data<PgPool>,
) -> Result<HttpResponse, actix_web::Error> {
    let mut portal_client = client.portal_client.clone();

    // look up stripe account id with server id
    let stripe_id = client
        .customer_client
        .get_owner_stripe_id(&pg, query.0.customer_id.clone())
        .await
        .map_err(e500)?;

    let url = portal_client
        .client
        .create_portal(CreatePortalRequest {
            customer_id: query.0.customer_id,
            return_url: query.0.return_url,
            stripe_account: stripe_id,
        })
        .await
        .map_err(e500)?;

    Ok(see_other(&url.into_inner().portal_url))
}
