use payments_server::payments_v1::customer_handler_server::CustomerHandlerServer;
use shared::configuration::*;
use std::net::ToSocketAddrs;

use payments_server::customer::Customer;

use tokio::net::TcpListener;
use tokio_stream::wrappers::TcpListenerStream;
use tonic::transport::Server;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    env_logger::init();

    let configuration = get_configuration().expect("Failed to read configuration");
    let addr = match format!(
        "{}:{}",
        configuration.payments.host, configuration.payments.port
    )
    .to_socket_addrs()
    {
        Ok(mut addrs) => addrs.next().unwrap(),
        Err(e) => panic!("Failed to resolve address: {}", e),
    };

    let incoming: TcpListenerStream = match TcpListener::bind(addr).await {
        Ok(listener) => tokio_stream::wrappers::TcpListenerStream::new(listener),
        Err(e) => {
            return Err(e.into());
        }
    };

    let client = stripe::Client::new(configuration.stripe.secret_key.clone());

    let cust_service = Customer {
        client: client.clone(),
    };

    Server::builder()
        .add_service(CustomerHandlerServer::new(cust_service))
        .serve_with_incoming(incoming)
        .await?;

    Ok(())
}
