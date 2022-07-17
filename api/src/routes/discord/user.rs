use actix_web::{web, HttpResponse};
use serde::{Deserialize, Serialize};
use shared::configuration::get_configuration;
use sqlx::{Transaction, Postgres};

use crate::{session_state::TypedSession, utils::e500};

pub async fn get_user(session: TypedSession) -> Result<HttpResponse, actix_web::Error> {
    let token = session.get_discord_oauth().map_err(e500)?.unwrap();

    match reqwest::Client::new()
        .get("https://discord.com/api/v10/users/@me")
        .bearer_auth(token.access_token)
        .send()
        .await
    {
        Ok(response) => {
            let body = response.text().await.map_err(e500)?;
            Ok(HttpResponse::Ok()
                .content_type("application/json")
                .body(body))
        }
        Err(e) => Err(e500(e)),
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct RoleReq {
    pub server_id: String,
}

pub async fn get_role(
    session: TypedSession,
    req: web::Query<RoleReq>,
) -> Result<HttpResponse, actix_web::Error> {
    let token = session.get_discord_oauth().map_err(e500)?.unwrap();

    let configuration = get_configuration().expect("Failed to read configuration");

    match reqwest::Client::new()
        .get(format!(
            "http://{}:{}/roles?server_id={}",
            configuration.payments.host,
            configuration.payments.webhook_port,
            req.0.server_id.clone()
        ))
        .bearer_auth(token.access_token)
        .send()
        .await
    {
        Ok(response) => {
            let body = response.text().await.map_err(e500)?;
            Ok(HttpResponse::Ok()
                .content_type("application/json")
                .body(body))
        }
        Err(e) => Err(e500(e)),
    }
}

#[tracing::instrument(name = "Insert Role", skip(transaction, role_id, role_name))]
pub async fn insert_role(
    transaction: &mut Transaction<'_, Postgres>,
    role_id: String,
    role_name: String,
    server_id: String,
) -> Result<(), sqlx::Error> {
    sqlx::query!(
        r#"
        INSERT INTO role (role_id, name, server_id)
        VALUES ($1, $2, $3)
        ON CONFLICT (role_id) DO UPDATE
        SET name = $2
        "#,
        role_id,
        role_name,
        server_id
    )
    .execute(transaction)
    .await?;
    Ok(())
}
