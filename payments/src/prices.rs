use stripe::{CreatePrice, Currency, PriceId, ProductId};

use crate::payments_v1::{price_handler_server::PriceHandler, *};

pub struct PricesClient {
    pub client: stripe::Client,
}

#[async_trait::async_trait]
impl PriceHandler for PricesClient {
    async fn create_price(
        &self,
        request: tonic::Request<CreatePriceRequest>,
    ) -> Result<tonic::Response<CreatePriceReply>, tonic::Status> {
        let request = request.into_inner();

        let parsed_id = request.product.parse::<ProductId>();
        if parsed_id.is_err() {
            let e = format!("Invalid product id: {}", request.product);
            return Err(tonic::Status::new(tonic::Code::InvalidArgument, e));
        }
        let prod_id = parsed_id.unwrap();

        let mut create_price = CreatePrice::new(Currency::USD);
        create_price.product = Some(stripe::IdOrCreate::Id(&prod_id));
        create_price.unit_amount = Some(request.amount);

        let result = stripe::Price::create(&self.client, create_price).await;
        if let Ok(price) = result {
            let reply = CreatePriceReply {
                price_id: price.id.to_string(),
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

    async fn get_price(
        &self,
        request: tonic::Request<GetPriceRequest>,
    ) -> Result<tonic::Response<GetPriceReply>, tonic::Status> {
        let request = request.into_inner();

        let parsed_id = request.price_id.parse::<PriceId>();
        if parsed_id.is_err() {
            let e = format!("Invalid price id: {}", request.price_id);
            return Err(tonic::Status::new(tonic::Code::InvalidArgument, e));
        }

        let result =
            stripe::Price::retrieve(&self.client, &parsed_id.unwrap(), &vec!["product"]).await;
        if let Ok(price) = result {
            let reply = GetPriceReply {
                price_id: price.id.to_string(),
                currency: price.currency.unwrap_or(Currency::USD).to_string(),
                product: price.product.unwrap().id().to_string(),
                amount: price.unit_amount.unwrap_or(0),
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
