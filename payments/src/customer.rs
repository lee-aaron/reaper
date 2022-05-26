use stripe::{CustomerId, StripeError};

use crate::payments_v1::customer_handler_server::CustomerHandler;

#[async_trait::async_trait]
pub trait CustomerImpl {
    async fn get_customer(&self, customer_id: CustomerId) -> Result<stripe::Customer, StripeError>;
    async fn create_customer(
        &self,
        name: String,
        email: String,
    ) -> Result<stripe::Customer, StripeError>;
}

pub struct Customer {
    pub client: stripe::Client,
}

#[async_trait::async_trait]
impl CustomerImpl for Customer {
    async fn get_customer(&self, customer_id: CustomerId) -> Result<stripe::Customer, StripeError> {
        Ok(stripe::Customer::retrieve(&self.client, &customer_id, &vec![]).await?)
    }

    async fn create_customer(
        &self,
        name: String,
        email: String,
    ) -> Result<stripe::Customer, StripeError> {
        let mut customer = stripe::CreateCustomer::new();
        customer.name = Some(&name);
        customer.email = Some(&email);

        Ok(stripe::Customer::create(&self.client, customer).await?)
    }
}

#[async_trait::async_trait]
impl CustomerHandler for Customer {}
