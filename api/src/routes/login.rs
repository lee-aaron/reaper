use std::collections::HashMap;

use actix_web::{error::InternalError, web, HttpResponse};
use serde::{Deserialize, Serialize};

use crate::{session_state::TypedSession, utils::see_other};
use actix_web::http::header::LOCATION;
use shared::configuration::get_configuration;

// https://developers.google.com/identity/protocols/oauth2/web-server#example

#[derive(Debug, Serialize, Deserialize)]
pub struct FormData {
    code: Option<String>,
    error: Option<String>,
    error_description: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DiscordResponse {
    pub access_token: String,
    pub expires_in: u64,
    pub token_type: String,
    pub refresh_token: String,
    pub scope: String,
}

pub async fn login(
    form: web::Query<FormData>,
    session: TypedSession,
) -> Result<HttpResponse, InternalError<LoginError>> {
    // if credentials are not available, redirect to OAUTH API
    let configuration = get_configuration().expect("Failed to read configuration");

    if form.error.is_some() && form.error_description.is_some() {
        let e = LoginError::UnexpectedError(anyhow::anyhow!(form.0.error_description.unwrap()));
        return Err(login_redirect(e));
    }

    if form.code.is_none() {
        let discord_uri = format!(
            "https://discord.com/api/oauth2/authorize?client_id={}&redirect_uri={}&response_type=code&scope=guilds.join%20identify%20email%20guilds",
            configuration.discord.client_id,
            configuration.discord.redirect_uri
        );
        Ok(see_other(&discord_uri))
    } else {
        let code = form.0.code.unwrap();
        let mut map = HashMap::new();
        map.insert("client_id", configuration.discord.client_id);
        map.insert("client_secret", configuration.discord.client_secret);
        map.insert("grant_type", configuration.discord.grant_type);
        map.insert("code", code.clone());
        map.insert("redirect_uri", configuration.discord.redirect_uri);

        match reqwest::Client::new()
            .post("https://discord.com/api/v10/oauth2/token")
            .form(&map)
            .send()
            .await
        {
            Ok(response) => {
                if response.status() == reqwest::StatusCode::OK {
                    let discord_response =
                        serde_json::from_str::<DiscordResponse>(&response.text().await.unwrap())
                            .map_err(|e| login_redirect(LoginError::UnexpectedError(e.into())))?;
                    session.renew();
                    session
                        .insert_discord_oauth(discord_response)
                        .map_err(|e| login_redirect(LoginError::UnexpectedError(e.into())))?;
                    Ok(see_other(
                        format!("{}{}", &configuration.discord.frontend_uri, "/dashboard")
                            .as_str(),
                    ))
                } else {
                    let e = LoginError::UnexpectedError(anyhow::anyhow!(
                        "Unexpected response from Discord"
                    ));
                    Err(login_redirect(e))
                }
            }
            Err(e) => {
                let e = LoginError::UnexpectedError(e.into());
                Err(login_redirect(e))
            }
        }
    }
}

fn login_redirect(e: LoginError) -> InternalError<LoginError> {
    let configuration = get_configuration().expect("Failed to read configuration");
    let response = HttpResponse::SeeOther()
        .insert_header((
            LOCATION,
            format!("{}{}", &configuration.discord.frontend_uri, "/login"),
        ))
        .finish();
    InternalError::from_response(e, response)
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
