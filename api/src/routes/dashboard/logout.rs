use crate::session_state::TypedSession;
use crate::utils::e500;
use actix_web::HttpResponse;

pub async fn log_out(session: TypedSession) -> Result<HttpResponse, actix_web::Error> {
    if session.get_discord_oauth().map_err(e500)?.is_none() {
        Ok(HttpResponse::Ok().finish())
    } else {
        session.log_out();
        Ok(HttpResponse::Ok().finish())
    }
}
