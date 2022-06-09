use stripe::ProductId;

use crate::payments_v1::{product_handler_server::ProductHandler, *};

pub struct ProductClient {
    pub client: stripe::Client,
}

#[async_trait::async_trait]
impl ProductHandler for ProductClient {
    async fn get_product(
        &self,
        request: tonic::Request<GetProductRequest>,
    ) -> Result<tonic::Response<GetProductReply>, tonic::Status> {
        let request = request.into_inner();

        let parsed_id = request.id.parse::<ProductId>();
        if parsed_id.is_err() {
            let e = format!("Invalid product id: {}", request.id);
            return Err(tonic::Status::new(tonic::Code::InvalidArgument, e));
        }

        let result = stripe::Product::retrieve(&self.client, &parsed_id.unwrap(), &vec![]).await;
        if let Ok(product) = result {
            let reply = GetProductReply {
                name: product.name.unwrap_or("".to_string()),
                description: product.description.unwrap_or("".to_string()),
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

    async fn create_product(
        &self,
        request: tonic::Request<CreateProductRequest>,
    ) -> Result<tonic::Response<CreateProductReply>, tonic::Status> {
        let request = request.into_inner();

        let mut product = stripe::CreateProduct::new(&request.name);
        product.description = Some(&request.description);
        product.metadata = Some(request.metadata);

        let result = stripe::Product::create(&self.client, product).await;
        if let Ok(product) = result {
            let reply = CreateProductReply {
                id: product.id.to_string(),
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

    async fn delete_product(
        &self,
        request: tonic::Request<DeleteProductRequest>,
    ) -> Result<tonic::Response<DeleteProductReply>, tonic::Status> {
        let request = request.into_inner();

        let parsed_id = request.id.parse::<ProductId>();
        if parsed_id.is_err() {
            let e = format!("Invalid product id: {}", request.id);
            return Err(tonic::Status::new(tonic::Code::InvalidArgument, e));
        }

        let result = stripe::Product::delete(&self.client, &parsed_id.unwrap()).await;
        if let Ok(_) = result {
            let reply = DeleteProductReply { deleted: true };
            Ok(tonic::Response::new(reply))
        } else {
            let e = format!(
                "Internal server error - {}",
                result.unwrap_err().to_string()
            );
            Err(tonic::Status::new(tonic::Code::Internal, e))
        }
    }

    async fn update_product(
        &self,
        request: tonic::Request<UpdateProductRequest>,
    ) -> Result<tonic::Response<UpdateProductReply>, tonic::Status> {
        let request = request.into_inner();

        let parsed_id = request.id.parse::<ProductId>();
        if parsed_id.is_err() {
            let e = format!("Invalid product id: {}", request.id);
            return Err(tonic::Status::new(tonic::Code::InvalidArgument, e));
        }

        let mut product = stripe::UpdateProduct::new();
        product.name = Some(&request.name);
        product.description = Some(&request.description);

        let result = stripe::Product::update(&self.client, &parsed_id.unwrap(), product).await;
        if let Ok(_) = result {
            let reply = UpdateProductReply { updated: true };
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
