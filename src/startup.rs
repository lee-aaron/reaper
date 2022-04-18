use std::net::TcpListener;

use actix_web::{web, App, HttpServer};
use actix_web::dev::Server;
use actix_files::Files;
use crate::routes::*;

pub struct Application {
    port: u16,
    server: Server,
}

impl Application {
    pub async fn build() -> Result<Self, anyhow::Error> {
        let address = format!("{}:{}", "127.0.0.1", "8000");
        let listener = TcpListener::bind(&address)?;
        let port = listener.local_addr().unwrap().port();
        let server = run(listener).await?;

        Ok(Self { port, server })
    }

    pub fn port(&self) -> u16 {
        self.port
    }

    pub async fn run_until_stopped(self) -> Result<(), std::io::Error> {
        self.server.await
    }
}

async fn run(listener: TcpListener) -> Result<Server, anyhow::Error> {
  let server = HttpServer::new(move || {
    App::new()
      .service(Files::new("/", "scythe/out").index_file("index.html"))
      .route("/health_check", web::get().to(health_check))
  })
  .listen(listener)?
  .run();
  Ok(server)
}