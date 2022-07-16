use actix_session::Session;
use actix_session::SessionExt;
use actix_web::dev::Payload;
use actix_web::{FromRequest, HttpRequest};
use std::future::{ready, Ready};

use crate::routes::DiscordResponse;

pub struct TypedSession(Session);

impl TypedSession {
    const DISCORD_TOKEN_KEY: &'static str = "discord_token";
    const TIME_HASH: &'static str = "time_hash";

    pub fn renew(&self) {
        self.0.renew();
    }

    pub fn insert_discord_oauth(&self, cred: DiscordResponse) -> Result<(), serde_json::Error> {
        self.0.insert(Self::DISCORD_TOKEN_KEY, cred)
    }

    pub fn get_discord_oauth(&self) -> Result<Option<DiscordResponse>, serde_json::Error> {
        self.0.get(Self::DISCORD_TOKEN_KEY)
    }

    pub fn insert_time_hash(&self, hash: String) -> Result<(), serde_json::Error>{
        self.0.insert(Self::TIME_HASH, hash)
    }

    pub fn get_time_hash(&self) -> Result<Option<String>, serde_json::Error> {
        self.0.get(Self::TIME_HASH)
    }

    pub fn clear_time_hash(&self) {
        self.0.remove(Self::TIME_HASH);
    }

    pub fn log_out(self) {
        self.0.purge()
    }
}

impl FromRequest for TypedSession {
    type Error = <Session as FromRequest>::Error;
    type Future = Ready<Result<TypedSession, Self::Error>>;

    fn from_request(req: &HttpRequest, _payload: &mut Payload) -> Self::Future {
        ready(Ok(TypedSession(req.get_session())))
    }
}
