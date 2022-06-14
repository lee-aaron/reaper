fn main() -> Result<(), Box<dyn std::error::Error>> {
    tonic_build::configure()
        .build_client(true)
        .out_dir("src")
        .type_attribute(".payments_v1.Product", "#[derive(serde::Serialize, serde::Deserialize)]")
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
