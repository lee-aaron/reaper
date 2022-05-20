use actix_web::{HttpResponse, Error};

pub async fn login() -> Result<HttpResponse, Error> {
  Ok(HttpResponse::Ok().json(""))
}

pub async fn login_callback() -> Result<HttpResponse, Error> {
  Ok(HttpResponse::Ok().json(""))
}