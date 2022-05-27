use shared::utils::error_chain_fmt;
use stripe::{CustomerId, StripeError};

use crate::payments_v1::{
    customer_handler_server::CustomerHandler, CustomerCreateReply, CustomerCreateRequest,
    CustomerGetReply, CustomerGetRequest,
};

#[async_trait::async_trait]
pub trait CustomerImpl {
    async fn get_stripe_customer(
        &self,
        customer_id: CustomerId,
    ) -> Result<stripe::Customer, StripeError>;
    async fn create_stripe_customer(
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
    async fn get_stripe_customer(
        &self,
        customer_id: CustomerId,
    ) -> Result<stripe::Customer, StripeError> {
        Ok(stripe::Customer::retrieve(&self.client, &customer_id, &vec![]).await?)
    }

    async fn create_stripe_customer(
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
impl CustomerHandler for Customer {
    async fn create_customer(
        &self,
        request: tonic::Request<CustomerCreateRequest>,
    ) -> Result<tonic::Response<CustomerCreateReply>, tonic::Status> {
        let request = request.into_inner();
        let result = self
            .create_stripe_customer(request.customer_name, request.customer_email)
            .await;
        if let Ok(customer) = result {
            let reply = CustomerCreateReply {
                customer_id: customer.id.to_string(),
            };
            Ok(tonic::Response::new(reply))
        } else {
            let e = format!(
                "Internal server error - {}",
                result.unwrap_err().to_string()
            );
            Err(tonic::Status::new(tonic::Code::Internal, e))
        }
    }

    async fn get_customer(
        &self,
        request: tonic::Request<CustomerGetRequest>,
    ) -> Result<tonic::Response<CustomerGetReply>, tonic::Status> {
        let request = request.into_inner();

        let parsed_id =
            format!("{}{}", CustomerId::prefix(), request.customer_id).parse::<CustomerId>();
        if parsed_id.is_err() {
            let e = format!("Invalid customer id: {}", request.customer_id);
            return Err(tonic::Status::new(tonic::Code::InvalidArgument, e));
        }

        let result = self.get_stripe_customer(parsed_id.unwrap()).await;
        if let Ok(customer) = result {
            let reply = CustomerGetReply {
                customer_name: customer.name.unwrap_or("".to_string()),
                customer_email: customer.email.unwrap_or("".to_string()),
            };
            Ok(tonic::Response::new(reply))
        } else {
            let e = format!(
                "Internal server error - {}",
                result.unwrap_err().to_string()
            );
            Err(tonic::Status::new(tonic::Code::Internal, e))
        }
    }
}
