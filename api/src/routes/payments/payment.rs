use shared::configuration::get_configuration;
use crate::session_state::TypedSession;
use crate::utils::{e500, see_other};
use actix_web::HttpResponse;
use payments_server::payments_v1::customer_handler_server::CustomerHandler;

pub async fn temp(session: TypedSession) -> Result<HttpResponse, actix_web::Error> {
    let configuration = get_configuration().expect("Failed to read configuration");
    if session.get_discord_oauth().map_err(e500)?.is_none() {
        Ok(see_other(&configuration.discord.frontend_uri))
    } else {
        session.log_out();
        Ok(see_other(&configuration.discord.frontend_uri))
    }
}

pub struct Payment {}