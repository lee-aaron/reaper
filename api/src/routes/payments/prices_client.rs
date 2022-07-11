use sqlx::{PgPool, Postgres, Transaction};
use stripe_server::payments_v1::price_handler_client::PriceHandlerClient;
use tonic::transport::{Channel, Uri};

#[derive(Clone)]
pub struct PricesClient {
    pub client: PriceHandlerClient<Channel>,
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct PriceObject {
    pub price_id: String,
    pub sub_price: i32,
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

    #[tracing::instrument(name = "Create Price in DB", skip(transaction, self))]
    pub async fn create_price(
        &self,
        transaction: &mut Transaction<'_, Postgres>,
        price_info: &PriceObject,
    ) -> Result<(), sqlx::Error> {
        sqlx::query!(
            r#"
            INSERT INTO sub_price (price_id, sub_price)
            VALUES ($1, $2)
            "#,
            price_info.price_id,
            price_info.sub_price,
        )
        .execute(transaction)
        .await?;
        Ok(())
    }

    #[tracing::instrument(name = "Get Price from DB", skip(pool, self))]
    pub async fn get_price(
        &self,
        pool: &PgPool,
        price_id: String,
    ) -> Result<PriceObject, sqlx::Error> {
        let price_info = sqlx::query_as!(
            PriceObject,
            r#"
            SELECT *
            FROM sub_price
            WHERE price_id = $1
            "#,
            price_id,
        )
        .fetch_one(pool)
        .await?;
        Ok(price_info)
    }
}
