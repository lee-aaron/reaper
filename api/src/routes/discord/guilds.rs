use actix_web::{web, HttpResponse};
use anyhow::Context;
use serde_json::json;
use sqlx::PgPool;

use crate::{session_state::TypedSession, utils::e500};

pub async fn get_guilds(session: TypedSession) -> Result<HttpResponse, actix_web::Error> {
    let token = session.get_discord_oauth().map_err(e500)?.unwrap();

    match reqwest::Client::new()
        .get("https://discord.com/api/v10/users/@me/guilds")
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

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct GuildRequest {
    pub discord_name: String,
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct GuildResponse {
    pub prod_id: String,
    pub discord_id: String,
    pub discord_name: String,
    pub subscription_name: String,
    pub subscription_description: String,
    pub subscription_price: String,
    pub discord_icon: String,
}

#[tracing::instrument(name = "search_guilds", skip(pg))]
pub async fn search_guilds(
    guild: web::Query<GuildRequest>,
    pg: web::Data<PgPool>,
) -> Result<HttpResponse, actix_web::Error> {
    // assert query is at least 3 characters long
    if guild.0.discord_name.len() < 3 {
        return Ok(HttpResponse::BadRequest()
            .content_type("application/json")
            .body(
                serde_json::to_string(&json!({
                    "error": "query must be at least 3 characters long"
                }))
                .unwrap(),
            ));
    }

    let rows = sqlx::query_as!(
        GuildResponse,
        r#"
        SELECT prod_id, discord_id, discord_name, subscription_name, subscription_description, discord_icon, subscription_price
        FROM subscriptions
        WHERE discord_name ILIKE $1 || '%'
    "#,
        guild.0.discord_name
    )
    .fetch_all(&**pg)
    .await
    .context("Failed to perform a query to fetch guilds")
    .map_err(e500)?;

    Ok(HttpResponse::Ok()
        .content_type("application/json")
        .body(serde_json::to_string(&rows).unwrap()))
}
