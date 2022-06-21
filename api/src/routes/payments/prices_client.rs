use stripe_server::payments_v1::{price_handler_client::PriceHandlerClient,};
use tonic::transport::{Channel, Uri};

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct PriceInfo {
    pub price_id: String,
    pub product_id: String,
    pub price: i64,
    pub currency: String,
    pub stripe_account: String,
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
