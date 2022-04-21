use std::collections::HashMap;
use std::error::Error;
use std::fmt;

use crate::session_state::TypedSession;
use actix_web::ResponseError;
use actix_web::error::InternalError;
use actix_web::http::header::LOCATION;
use actix_web::web;
use actix_web::HttpResponse;
use serde::Deserialize;
use serde::Serialize;

#[derive(Debug, Serialize, Deserialize)]
pub struct FormData {
    code: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DiscordResponse {
    access_token: String,
    expires_in: u64,
    token_type: String,
    refresh_token: String,
    scope: String,
}


const client_id: &str = "966453809335382106";
const client_secret: &str = "A_RnL_ikt2SF6bZ1lyGJhgdKPeQz3hof";
const grant_type: &str = "authorization_code";
const redirect_uri: &str = "http://localhost:3000/login";

pub async fn login(
    form: web::Form<FormData>,
    session: TypedSession,
) -> Result<HttpResponse, Box<dyn Error>> {
    // get oauth code
    // make bearer token request to discord
    // get user info
    // send user info to database
    // send user token back to client
    let mut map = HashMap::new();
    map.insert("client_id", client_id);
    map.insert("client_secret", client_secret);
    map.insert("grant_type", grant_type);
    map.insert("code", form.code.as_str());
    map.insert("redirect_uri", redirect_uri);

    let client = reqwest::Client::new();
    let res = client
        .post("https://discord.com/api/oauth2/token")
        .form(&map)
        .send()
        .await?;

    let body = res.text().await?;

    tracing::debug!("{:?}", serde_json::from_str::<DiscordResponse>(body.as_str()).unwrap());

    Ok(HttpResponse::SeeOther()
        .insert_header((LOCATION, "http://localhost:3000/dashboard"))
        .finish())
}

#[derive(thiserror::Error)]
pub enum LoginError {
    #[error("Authentication failed")]
    AuthError(#[source] anyhow::Error),
    #[error("Something went wrong")]
    UnexpectedError(#[from] anyhow::Error),
    #[error("Unknown")]
    Unknown,
}

impl std::fmt::Debug for LoginError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        error_chain_fmt(self, f)
    }
}

pub fn error_chain_fmt(
    e: &impl std::error::Error,
    f: &mut std::fmt::Formatter<'_>,
) -> std::fmt::Result {
    writeln!(f, "{}\n", e)?;
    let mut current = e.source();
    while let Some(cause) = current {
        writeln!(f, "Caused by:\n\t{}", cause)?;
        current = cause.source();
    }
    Ok(())
}
