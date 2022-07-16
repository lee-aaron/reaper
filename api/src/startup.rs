use std::net::TcpListener;

use crate::authentication::reject_anonymous_users;
use crate::routes::*;
use actix_session::storage::RedisSessionStore;
use actix_session::SessionMiddleware;
use actix_web::cookie::Key;
use actix_web::dev::Server;
use actix_web::web::Data;
use actix_web::{web, App, HttpServer};
use actix_web_lab::middleware::from_fn;
use secrecy::{ExposeSecret, Secret};
use shared::configuration::{DatabaseSettings, Settings};
use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;
use tracing_actix_web::TracingLogger;

pub struct Application {
    port: u16,
    server: Server,
}

impl Application {
    pub async fn build(configuration: Settings) -> Result<Self, anyhow::Error> {
        let connection_pool = get_connection_pool(&configuration.database);
        let address = format!(
            "{}:{}",
            configuration.application.host, configuration.application.port
        );
        let listener = TcpListener::bind(&address)?;
        let port = listener.local_addr().unwrap().port();
        let server = run(
            listener,
            connection_pool,
            configuration.application.base_url,
            configuration.application.hmac_secret,
            configuration.redis_uri,
        )
        .await?;

        tracing::debug!("Listening on {}", address);

        Ok(Self { port, server })
    }

    pub fn port(&self) -> u16 {
        self.port
    }

    pub async fn run_until_stopped(self) -> Result<(), std::io::Error> {
        self.server.await
    }
}

pub fn get_connection_pool(configuration: &DatabaseSettings) -> PgPool {
    PgPoolOptions::new()
        .connect_timeout(std::time::Duration::from_secs(2))
        .connect_lazy_with(configuration.with_db())
}

pub struct ApplicationBaseUrl(pub String);

async fn run(
    listener: TcpListener,
    db_pool: PgPool,
    base_url: String,
    hmac_secret: Secret<String>,
    redis_uri: Secret<String>,
) -> Result<Server, anyhow::Error> {
    let db_pool = Data::new(db_pool);
    let base_url = Data::new(ApplicationBaseUrl(base_url));
    let secret_key = Key::from(hmac_secret.expose_secret().as_bytes());
    let redis_store = RedisSessionStore::new(redis_uri.expose_secret()).await?;
    let payment_client = Payment::new();
    let server = HttpServer::new(move || {
        App::new()
            .wrap(SessionMiddleware::new(
                redis_store.clone(),
                secret_key.clone(),
            ))
            .wrap(TracingLogger::default())
            .route("/login", web::get().to(login))
            .route("/health_check", web::get().to(health_check))
            .service(
                web::scope("/v1")
                    .wrap(from_fn(reject_anonymous_users))
                    .route("/user", web::get().to(user))
                    .route("/logout", web::get().to(log_out))
                    .route("/get_guilds", web::get().to(get_guilds))
                    .route("/get_user", web::get().to(get_user))
                    .route("/search_guilds", web::get().to(search_guilds))
                    .route("/create_product", web::post().to(create_product_flow))
                    .route("/search_product", web::get().to(search_product))
                    .route("/search_one_product", web::get().to(search_one_product))
                    .route("/search_owner_product", web::get().to(search_owner_product))
                    .route("/get_account", web::get().to(get_account))
                    .route("/create_account", web::post().to(create_account))
                    .route("/delete_account", web::delete().to(delete_account))
                    .route("/get_account_link", web::get().to(get_account_link))
                    .route("/get_customer", web::get().to(get_customer))
                    .route("/create_customer", web::post().to(create_customer))
                    // .route("/delete_customer", web::delete().to(delete_customer))
                    .route("/create_subscription", web::post().to(create_subscription))
                    .route("/search_subscription", web::get().to(search_subscriptions))
                    .route(
                        "/cancel_subscription",
                        web::delete().to(cancel_subscriptions),
                    ),
            )
            .app_data(db_pool.clone())
            .app_data(base_url.clone())
            .app_data(Data::new(HmacSecret(hmac_secret.clone())))
            .app_data(Data::new(payment_client.clone()))
    })
    .listen(listener)?
    .run();
    Ok(server)
}

#[derive(Clone)]
pub struct HmacSecret(pub Secret<String>);
