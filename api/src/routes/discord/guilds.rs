use actix_web::{error::InternalError, HttpResponse};

use crate::session_state::TypedSession;

pub async fn get_guilds(
    session: TypedSession,
) -> Result<HttpResponse, InternalError<anyhow::Error>> {
    let token = session
        .get_discord_oauth()
        .map_err(|e| handle_error(anyhow::Error::new(e)))?
        .unwrap();

    match reqwest::Client::new()
        .get("https://discord.com/api/v10/users/@me/guilds")
        .bearer_auth(token.access_token)
        .send()
        .await
    {
        Ok(response) => {
            let body = response
                .text()
                .await
                .map_err(|e| handle_error(anyhow::Error::new(e)))?;
            Ok(HttpResponse::Ok().json(body))
        }
        Err(e) => Err(handle_error(anyhow::Error::new(e))),
    }
}

fn handle_error(e: anyhow::Error) -> InternalError<anyhow::Error> {
    let response = HttpResponse::InternalServerError().finish();
    InternalError::from_response(e, response)
}
