use actix_web::HttpResponse;

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
