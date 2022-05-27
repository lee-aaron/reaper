fn main() -> Result<(), Box<dyn std::error::Error>> {
    tonic_build::configure()
        .build_server(true)
        .build_client(true)
        .out_dir("src")
        .compile(
            &[
                "proto/customer.proto",
                "proto/portal.proto",
                "proto/subscription.proto",
                "proto/product.proto",
                "proto/prices.proto"
            ],
            &["proto"],
        )?;
    Ok(())
}
