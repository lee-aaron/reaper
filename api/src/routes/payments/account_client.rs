use actix_web::http::StatusCode;
use anyhow::Context;
use serde_json::json;
use shared::utils::error_chain_fmt;
use sqlx::{PgPool, Postgres, Transaction};
use std::collections::HashMap;
use stripe_server::payments_v1::{account_handler_client::AccountHandlerClient, *};
use tonic::transport::{Channel, Uri};

use actix_web::{web, HttpResponse, ResponseError};

use crate::utils::e500;

use super::Payment;

#[derive(Clone)]
pub struct AccountClient {
    pub client: AccountHandlerClient<Channel>,
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct OwnerObject {
    pub discord_id: String,
    pub name: String,
    pub email: String,
    pub stripe_id: String,
    pub status: String,
}

impl AccountClient {
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
        let client = AccountHandlerClient::new(channel.clone());
        AccountClient { client }
    }

    #[tracing::instrument(name = "Creating Account in DB", skip(transaction, self))]
    pub async fn create_account(
        &self,
        transaction: &mut Transaction<'_, Postgres>,
        discord_id: String,
        name: String,
        stripe_id: String,
        email: String,
    ) -> Result<(), sqlx::Error> {
        sqlx::query!(
            r#"
            INSERT INTO owners (discord_id, name, email, stripe_id, status)
            VALUES ($1, $2, $3, $4, 'pending')
            "#,
            discord_id,
            name,
            email,
            stripe_id
        )
        .execute(transaction)
        .await?;
        Ok(())
    }

    #[tracing::instrument(name = "Getting Account in DB", skip(pool, self))]
    pub async fn get_account(
        &self,
        pool: &PgPool,
        discord_id: String,
    ) -> Result<Option<OwnerObject>, sqlx::Error> {
        let row = sqlx::query_as!(
            OwnerObject,
            r#"
        SELECT * FROM owners WHERE discord_id = $1
        "#,
            discord_id
        )
        .fetch_optional(pool)
        .await?;
        Ok(row)
    }

    #[tracing::instrument(name = "Delete Account in DB", skip(self, transaction))]
    pub async fn delete_account(
        &self,
        transaction: &mut Transaction<'_, Postgres>,
        discord_id: String,
    ) -> Result<(), sqlx::Error> {
        sqlx::query!(
            r#"
            DELETE FROM owners WHERE discord_id = $1
            "#,
            discord_id
        )
        .execute(transaction)
        .await?;
        Ok(())
    }
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct AccountInfo {
    pub email: String,
    pub name: String,
    pub discord_id: String,
    pub refresh_url: String,
    pub return_url: String,
}

#[tracing::instrument(name = "Creating Account", skip(client, pool, account))]
pub async fn create_account(
    client: web::Data<Payment>,
    account: web::Json<AccountInfo>,
    pool: web::Data<PgPool>,
) -> Result<HttpResponse, actix_web::Error> {
    let mut acc_client = client.account_client.clone();
    let mut query = HashMap::<String, String>::new();
    query.insert("email".to_string(), account.email.to_string());
    query.insert("name".to_string(), account.name.to_string());
    query.insert("discord_id".to_string(), account.discord_id.to_string());

    // create account
    let result = acc_client
        .client
        .create_account(CreateAccountRequest {
            email: account.0.email.clone(),
            metadata: query,
        })
        .await
        .map_err(e500)?
        .into_inner();

    // insert account into database
    let mut transaction = pool
        .begin()
        .await
        .context("Failed to acquire a Postgres connection from the pool")
        .map_err(e500)?;

    client
        .account_client
        .create_account(
            &mut transaction,
            account.0.discord_id,
            account.0.name,
            result.account_id.clone(),
            account.0.email,
        )
        .await
        .context("Failed to create a new account")
        .map_err(e500)?;

    transaction
        .commit()
        .await
        .context("Failed to commit the transaction")
        .map_err(e500)?;

    // create account link
    let result = acc_client
        .client
        .create_account_link(CreateAccountLinkRequest {
            account_id: result.account_id,
            refresh_url: account.0.refresh_url,
            return_url: account.0.return_url,
        })
        .await
        .map_err(e500)?
        .into_inner();

    Ok(HttpResponse::Ok().json(json!({
        "url": result.url,
        "expires_at": result.expires_at,
    })))
}

#[derive(thiserror::Error)]
pub enum AccountError {
    #[error("Account not found")]
    AccountNotFound,
    #[error(transparent)]
    UnexpectedError(#[from] anyhow::Error),
}

impl std::fmt::Debug for AccountError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        error_chain_fmt(self, f)
    }
}

impl ResponseError for AccountError {
    fn status_code(&self) -> StatusCode {
        match self {
            AccountError::AccountNotFound => StatusCode::NOT_FOUND,
            AccountError::UnexpectedError(_) => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct DiscordInfo {
    pub discord_id: String,
}

#[tracing::instrument(name = "Getting Account", skip(client, pg, query))]
pub async fn get_account(
    client: web::Data<Payment>,
    pg: web::Data<PgPool>,
    query: web::Query<DiscordInfo>,
) -> Result<HttpResponse, AccountError> {
    let owner = client
        .account_client
        .get_account(&pg, query.0.discord_id.clone())
        .await
        .context("Failed to retrieve the account")?;

    Ok(HttpResponse::Ok().json(owner))
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct AccountLinkInfo {
    pub discord_id: String,
    pub refresh_url: String,
    pub return_url: String,
}

#[tracing::instrument(name = "Get Account Link", skip(client, pg, query))]
pub async fn get_account_link(
    client: web::Data<Payment>,
    pg: web::Data<PgPool>,
    query: web::Query<AccountLinkInfo>,
) -> Result<HttpResponse, AccountError> {
    let owner = client
        .account_client
        .get_account(&pg, query.0.discord_id.clone())
        .await
        .context("Failed to retrieve the account")?
        .ok_or(AccountError::AccountNotFound)?;

    let mut acc_client = client.account_client.clone();
    let result = acc_client
        .client
        .create_account_link(CreateAccountLinkRequest {
            account_id: owner.stripe_id.clone(),
            refresh_url: query.0.refresh_url,
            return_url: query.0.return_url,
        })
        .await
        .context("Failed to retrieve the account")?
        .into_inner();

    Ok(HttpResponse::Ok().json(json!({
        "url": result.url,
        "expires_at": result.expires_at,
    })))
}

pub async fn delete_account(
    client: web::Data<Payment>,
    pg: web::Data<PgPool>,
    query: web::Json<String>,
) -> Result<HttpResponse, AccountError> {
    let mut acc_client = client.account_client.clone();

    let owner = client
        .account_client
        .get_account(&pg, query.0.clone())
        .await
        .context("Failed to retrieve the account")?
        .ok_or(AccountError::AccountNotFound)?;

    let mut transaction = pg
        .begin()
        .await
        .context("Failed to acquire a Postgres connection from the pool")?;

    client
        .account_client
        .delete_account(&mut transaction, query.0)
        .await
        .context("Failed to delete the account")?;

    acc_client
        .client
        .delete_account(DeleteAccountRequest {
            account_id: owner.stripe_id.clone(),
        })
        .await
        .context("Failed to delete the account")?;

    transaction
        .commit()
        .await
        .context("Failed to commit the transaction")?;

    Ok(HttpResponse::Ok().json(json!({
        "message": "Account deleted",
    })))
}
