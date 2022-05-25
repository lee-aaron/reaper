use actix_web::{http::header::ContentType, HttpResponse};

pub async fn user() -> HttpResponse {
    HttpResponse::Ok()
        .content_type(ContentType::json())
        .body("Authorized user")
}

mod logout;

pub use logout::*;