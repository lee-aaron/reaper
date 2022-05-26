use payments_server::payments_v1::customer_handler_client::CustomerHandlerClient;
use std::error::Error;
use tonic::transport::{Channel, Uri};

pub struct CustomerClient {
    pub client: CustomerHandlerClient<Channel>,
}

impl CustomerClient {
    pub async fn new(addr: &str) -> Result<Self, Box<(dyn Error + Send + Sync)>> {
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
        Ok(CustomerClient { client })
    }
}

// Trait def that the api gateway will call