use stripe::{BillingPortalSession, CreateBillingPortalSession, CustomerId, StripeError};

#[async_trait::async_trait]
pub trait Portal {
    async fn create_session(
        &self,
        customer_id: CustomerId,
        return_url: String,
    ) -> Result<BillingPortalSession, StripeError>;
}

pub struct BillingPortal {
    pub client: stripe::Client,
}

#[async_trait::async_trait]
impl Portal for BillingPortal {
    async fn create_session(
        &self,
        customer_id: CustomerId,
        return_url: String,
    ) -> Result<BillingPortalSession, StripeError> {
        let mut portal_session = CreateBillingPortalSession::new(customer_id.clone());
        portal_session.return_url = Some(&return_url);

        let session = stripe::BillingPortalSession::create(&self.client, portal_session).await?;

        Ok(session)
    }
}
