use payments_server::payments_v1::{
    portal_handler_client::PortalHandlerClient, PortalCreateRequest,
};
use tonic::transport::{Channel, Uri};

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

    // Client side calls
    pub async fn create_portal(
        &mut self,
        customer_id: String,
        return_url: String,
    ) -> Result<String, anyhow::Error> {
        let request = PortalCreateRequest {
            customer_id,
            return_url,
        };
        let result = self.client.create_portal(request).await;

        if let Ok(reply) = result {
            let values = reply.into_inner();
            Ok(values.portal_url)
        } else {
            Err(anyhow::anyhow!("Failed to create portal"))
        }
    }
}
