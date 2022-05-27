use payments_server::payments_v1::customer_handler_client::CustomerHandlerClient;
use payments_server::payments_v1::*;
use tonic::transport::{Channel, Uri};

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct CustomerInfo {
    pub customer_name: String,
    pub customer_email: String,
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

    // Client side calls
    pub async fn get_customer(
        &mut self,
        customer_id: String,
    ) -> Result<CustomerInfo, anyhow::Error> {
        let result = self
            .client
            .get_customer(CustomerGetRequest { customer_id })
            .await;

        if let Ok(reply) = result {
            let values = reply.into_inner();
            Ok(CustomerInfo {
                customer_name: values.customer_name,
                customer_email: values.customer_email,
            })
        } else {
            Err(anyhow::anyhow!("Failed to get customer"))
        }
    }

    pub async fn create_customer(
        &mut self,
        customer_name: String,
        customer_email: String,
    ) -> Result<String, anyhow::Error> {
        let result = self
            .client
            .create_customer(CustomerCreateRequest {
                customer_name,
                customer_email,
            })
            .await;

        if let Ok(reply) = result {
            let values = reply.into_inner();
            Ok(values.customer_id)
        } else {
            Err(anyhow::anyhow!("Failed to create customer"))
        }
    }

    pub async fn delete_customer(&mut self, customer_id: String) -> Result<bool, anyhow::Error> {
        let result = self
            .client
            .delete_customer(CustomerDeleteRequest { customer_id })
            .await;

        if let Ok(reply) = result {
            let values = reply.into_inner();
            Ok(values.deleted)
        } else {
            Err(anyhow::anyhow!("Failed to delete customer"))
        }
    }
}
