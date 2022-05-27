use stripe::CustomerId;

use crate::payments_v1::customer_handler_server::*;
use crate::payments_v1::*;

pub struct Customer {
    pub client: stripe::Client,
}

#[async_trait::async_trait]
impl CustomerHandler for Customer {
    async fn create_customer(
        &self,
        request: tonic::Request<CustomerCreateRequest>,
    ) -> Result<tonic::Response<CustomerCreateReply>, tonic::Status> {
        let request = request.into_inner();

        let mut customer = stripe::CreateCustomer::new();
        customer.name = Some(&request.customer_name);
        customer.email = Some(&request.customer_email);

        let result = stripe::Customer::create(&self.client, customer).await;
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

        let parsed_id = request.customer_id.parse::<CustomerId>();
        if parsed_id.is_err() {
            let e = format!("Invalid customer id: {}", request.customer_id);
            return Err(tonic::Status::new(tonic::Code::InvalidArgument, e));
        }

        let result = stripe::Customer::retrieve(&self.client, &parsed_id.unwrap(), &vec![]).await;
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

    async fn delete_customer(
        &self,
        request: tonic::Request<CustomerDeleteRequest>,
    ) -> Result<tonic::Response<CustomerDeleteReply>, tonic::Status> {
        let request = request.into_inner();

        let parsed_id = request.customer_id.parse::<CustomerId>();
        if parsed_id.is_err() {
            let e = format!("Invalid customer id: {}", request.customer_id);
            return Err(tonic::Status::new(tonic::Code::InvalidArgument, e));
        }

        let result = stripe::Customer::delete(&self.client, &parsed_id.unwrap()).await;
        if let Ok(_) = result {
            let reply = CustomerDeleteReply { deleted: true };
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
