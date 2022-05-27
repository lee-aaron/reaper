use stripe::{CreateBillingPortalSession, CustomerId};

use crate::payments_v1::{
    portal_handler_server::PortalHandler, PortalCreateReply, PortalCreateRequest,
};

pub struct BillingPortal {
    pub client: stripe::Client,
}

#[async_trait::async_trait]
impl PortalHandler for BillingPortal {
    async fn create_portal(
        &self,
        request: tonic::Request<PortalCreateRequest>,
    ) -> Result<tonic::Response<PortalCreateReply>, tonic::Status> {
        let request = request.into_inner();

        let parsed_id = request.customer_id.parse::<CustomerId>();
        if parsed_id.is_err() {
            let e = format!("Invalid customer id: {}", request.customer_id);
            return Err(tonic::Status::new(tonic::Code::InvalidArgument, e));
        }

        let mut portal_session = CreateBillingPortalSession::new(parsed_id.unwrap());
        portal_session.return_url = Some(&request.return_url);

        let session = stripe::BillingPortalSession::create(&self.client, portal_session).await;
        if let Ok(session) = session {
            let reply = PortalCreateReply {
                portal_url: session.url.to_string(),
            };
            Ok(tonic::Response::new(reply))
        } else {
            Err(tonic::Status::new(
                tonic::Code::Internal,
                "Failed to create session",
            ))
        }
    }
}
