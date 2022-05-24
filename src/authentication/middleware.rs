use actix_web::{
    body::MessageBody,
    dev::{ServiceRequest, ServiceResponse},
    FromRequest, HttpMessage,
};
use actix_web_lab::middleware::Next;

use crate::{session_state::TypedSession, utils::e500};

pub async fn reject_anonymous_users(
    mut req: ServiceRequest,
    next: Next<impl MessageBody>,
) -> Result<ServiceResponse<impl MessageBody>, actix_web::Error> {
    let session = {
        let (http_request, payload) = req.parts_mut();
        TypedSession::from_request(http_request, payload).await
    }?;

    match session.get_discord_oauth().map_err(e500)? {
        Some(user_id) => {
            req.extensions_mut().insert(user_id);
            next.call(req).await
        }
        None => {
            let e = anyhow::anyhow!("The user has not logged in");
            Err(e500(e))
        }
    }
}
