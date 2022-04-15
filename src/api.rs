use actix_files::Files;
use actix_web::{web, App, HttpServer};
use clap::Parser;

#[derive(Parser, Debug)]
#[clap(author, version, about, long_about = None)]
struct Cfg {
    /// the host address to bind to. e.g. 127.0.0.1 or 0.0.0.0
    #[clap(long, default_value = "127.0.0.1")]
    host: String,

    /// the host port to bind
    #[clap(long, default_value = "8000")]
    port: u16,
}

#[tokio::main]
async fn main() -> std::io::Result<()> {
    let args = Cfg::parse();

    let srv = HttpServer::new(move || {
        App::new()
            .service(web::scope("/api").service(api::add_user))
            .service(Files::new("/", "scythe/out").index_file("index.html"))
    })
    .bind((args.host.as_str(), args.port))?
    .run();

    log::info!(
        "Starting web server on http://{}:{}",
        &args.host,
        &args.port
    );

    srv.await?;
    Ok(())
}

mod api {
    use std::error::Error;
    use std::{collections::HashMap, sync::Arc};

    use actix_web::{get, http::header::ContentType, post, web, HttpResponse, Responder};
    use serde::{Deserialize, Serialize};

    fn build_resp<T: Serialize>(d: &T) -> HttpResponse {
        HttpResponse::Ok()
            .content_type(ContentType::plaintext())
            .json(d)
    }

    fn err_response(err: Box<dyn Error>) -> HttpResponse {
        HttpResponse::InternalServerError().body(err.to_string())
    }

    #[post("/add-user")]
    pub async fn add_user(
        data: web::Data<()>,
        form: web::Form<HashMap<String, String>>,
    ) -> impl Responder {
        build_resp(&{
          "Ok"
        })
    }
}
