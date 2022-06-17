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

    #[tracing::instrument(name = "get_account", skip(pool, self))]
    pub async fn get_account(&self, pool: &PgPool, id: String) -> Result<(String, String), anyhow::Error> {
        let row = sqlx::query!(
            r#"
        SELECT stripe_account_id, status FROM accounts WHERE discord_id = $1
        "#,
            id
        )
        .fetch_optional(pool)
        .await
        .context("Failed to perform a query to retrieve an account")?;
        if row.is_some() {
            let row = row.unwrap();
            Ok((row.stripe_account_id, row.status))
        } else {
            Err(anyhow::anyhow!("No account found for this user"))
        }
    }

    #[tracing::instrument(name = "create_account", skip(transaction, self))]
    pub async fn create_account(
        &self,
        transaction: &mut Transaction<'_, Postgres>,
        discord_id: String,
        username: String,
        stripe_account_id: String,
        email: String,
    ) -> Result<(), sqlx::Error> {
        sqlx::query!(
            r#"
            INSERT INTO accounts (discord_id, username, email, stripe_account_id, status)
            VALUES ($1, $2, $3, $4, 'pending')
            "#,
            discord_id,
            username,
            email,
            stripe_account_id
        )
        .execute(transaction)
        .await?;
        Ok(())
    }

    #[tracing::instrument(name = "delete_account", skip(self, transaction))]
    pub async fn delete_account(
        &self,
        transaction: &mut Transaction<'_, Postgres>,
        discord_id: String,
    ) -> Result<(), sqlx::Error> {
        sqlx::query!(
            r#"
            DELETE FROM accounts WHERE discord_id = $1
            "#,
            discord_id
        ).execute(transaction)
        .await?;
        Ok(())
    }

    #[tracing::instrument(name = "update_account", skip(self, transaction))]
    pub async fn update_account(
        &self,
        transaction: &mut Transaction<'_, Postgres>,
        stripe_account_id: String,
        status: String,
    ) -> Result<(), sqlx::Error> {
        sqlx::query!(
            r#"
            UPDATE accounts SET status = $1 WHERE stripe_account_id = $2
            "#,
            status,
            stripe_account_id
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

    transaction.commit().await.context("Failed to commit the transaction").map_err(e500)?;

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
        }
    }
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct DiscordInfo {
    pub discord_id: String,
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct AccountLinkInfo {
    pub discord_id: String,
    pub refresh_url: String,
    pub return_url: String,
}

pub async fn get_account(
    client: web::Data<Payment>,
    pg: web::Data<PgPool>,
    query: web::Query<DiscordInfo>,
) -> Result<HttpResponse, actix_web::Error> {

    let account_tuple = client
        .account_client
        .get_account(&pg, query.0.discord_id.clone())
        .await
        .map_err(e500)?;

    Ok(HttpResponse::Ok().json(account_tuple))
}

pub async fn get_account_link(
    client: web::Data<Payment>,
    pg: web::Data<PgPool>,
    query: web::Query<AccountLinkInfo>,
) -> Result<HttpResponse, actix_web::Error> {

    let (stripe_account_id, _) = client
        .account_client
        .get_account(&pg, query.0.discord_id.clone())
        .await
        .map_err(e500)?;

    let mut acc_client = client.account_client.clone();
    let result = acc_client
        .client
        .create_account_link(CreateAccountLinkRequest {
            account_id: stripe_account_id,
            refresh_url: query.0.refresh_url,
            return_url: query.0.return_url,
        })
        .await
        .map_err(e500)?
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
) -> Result<HttpResponse, actix_web::Error> {
    
    let mut acc_client = client.account_client.clone();

    let (stripe_account_id, _) = client
        .account_client
        .get_account(&pg, query.0.clone())
        .await
        .map_err(e500)?;

    let mut transaction = pg
        .begin()
        .await
        .context("Failed to acquire a Postgres connection from the pool")
        .map_err(e500)?;

    client.account_client.delete_account(&mut transaction, query.0).await.map_err(e500)?;

    acc_client
        .client
        .delete_account(DeleteAccountRequest {
            account_id: stripe_account_id,
        })
        .await
        .map_err(e500)?;

    transaction.commit().await.context("Failed to commit the transaction").map_err(e500)?;

    Ok(HttpResponse::Ok().json(json!({
        "message": "Account deleted",
    })))
}

pub async fn update_account(
    client: web::Data<Payment>,
    pg: web::Data<PgPool>,
    query: web::Json<String>
) -> Result<HttpResponse, actix_web::Error> {

    let mut transaction = pg
        .begin()
        .await
        .context("Failed to acquire a Postgres connection from the pool")
        .map_err(e500)?;

    client.account_client.update_account(&mut transaction, query.0, "verified".to_string()).await.map_err(e500)?;

    transaction.commit().await.context("Failed to commit the transaction").map_err(e500)?;

    Ok(HttpResponse::Ok().finish())
}