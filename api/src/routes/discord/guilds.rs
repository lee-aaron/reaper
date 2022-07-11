use actix_web::{web, HttpResponse};
use anyhow::Context;
use serde_json::json;
use sqlx::{PgPool, Postgres, Transaction};

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
    pub server_id: String,
    pub name: String,
    pub description: String,
    pub icon: String,
}

#[tracing::instrument(name = "Search for Guilds", skip(pg))]
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
        SELECT *
        FROM guild_info
        WHERE name ILIKE $1 || '%'
    "#,
        guild.0.discord_name
    )
    .fetch_all(&**pg)
    .await
    .context("Failed to perform a query to fetch guilds")
    .map_err(e500)?;

    Ok(HttpResponse::Ok()
        .content_type("application/json")
        .json(rows))
}

#[derive(Debug)]
pub struct GuildInfo {
    pub server_id: String,
    pub name: String,
    pub description: String,
    pub icon: String,
}

#[tracing::instrument(name = "Insert Guild Info", skip(transaction, guild_info))]
pub async fn insert_guild_info(
    transaction: &mut Transaction<'_, Postgres>,
    guild_info: &GuildInfo,
) -> Result<(), sqlx::Error> {
    sqlx::query!(
        r#"
        INSERT INTO guild_info (server_id, name, description, icon)
        VALUES ($1, $2, $3, $4)
        on conflict (server_id) do nothing
        "#,
        guild_info.server_id,
        guild_info.name,
        guild_info.description,
        guild_info.icon
    )
    .execute(transaction)
    .await?;
    Ok(())
}

#[tracing::instrument(name = "Insert Guilds", skip(transaction))]
pub async fn insert_guilds(
    transaction: &mut Transaction<'_, Postgres>,
    discord_id: String,
    server_id: String,
) -> Result<(), sqlx::Error> {
    sqlx::query!(
        r#"
        INSERT INTO guilds (discord_id, server_id)
        VALUES ($1, $2)
        on conflict (server_id) do nothing
        "#,
        discord_id,
        server_id
    )
    .execute(transaction)
    .await?;
    Ok(())
}

#[tracing::instrument(name = "Get Owner Id from Guild Id", skip(pool))]
pub async fn get_owner_id(pool: &PgPool, guild_id: String) -> Result<Option<String>, sqlx::Error> {
    let result = sqlx::query!(
        r#"SELECT discord_id from guilds where server_id = $1"#,
        guild_id
    )
    .fetch_optional(pool)
    .await?;
    Ok(result.map(|r| r.discord_id))
}

#[tracing::instrument(name = "Get Owner's Guilds", skip(pool))]
pub async fn get_owner_guilds(
    pool: &PgPool,
    discord_id: String,
) -> Result<Vec<String>, sqlx::Error> {
    let result = sqlx::query!(
        r#"SELECT server_id from guilds where discord_id = $1"#,
        discord_id
    )
    .fetch_all(pool)
    .await?;
    Ok(result.into_iter().map(|r| r.server_id).collect())
}
