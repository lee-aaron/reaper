use anyhow::anyhow;
use argon2::{
    password_hash::{rand_core::OsRng, PasswordHasher, SaltString},
    Algorithm, Argon2, Params, PasswordHash, PasswordVerifier, Version,
};
use chrono::prelude::*;
use secrecy::{Secret, ExposeSecret};

pub fn error_chain_fmt(
    e: &impl std::error::Error,
    f: &mut std::fmt::Formatter<'_>,
) -> std::fmt::Result {
    writeln!(f, "{}\n", e)?;
    let mut current = e.source();
    while let Some(cause) = current {
        writeln!(f, "Caused by:\n\t{}", cause)?;
        current = cause.source();
    }
    Ok(())
}

pub fn compute_timestamp_hash() -> Result<Secret<String>, anyhow::Error> {
    let dt = Utc::now().to_string();

    let salt = SaltString::generate(&mut OsRng);
    let hash = Argon2::new(
        Algorithm::Argon2id,
        Version::V0x13,
        Params::new(15000, 2, 1, None).unwrap(),
    )
    .hash_password(dt.as_bytes(), &salt)
    .map_err(|_| anyhow!("Failed to hash password"))?
    .to_string();
    Ok(Secret::new(hash))
}

pub fn verify_timestamp_hash(
    expected_hash: Secret<String>,
    hash_candidate: Secret<String>,
) -> Result<(), anyhow::Error> {
    let expected_hash =
        PasswordHash::new(expected_hash.expose_secret()).map_err(|_| anyhow!("Failed to parse expected hash"))?;

    tracing::info!("\n{} {}\n", expected_hash, hash_candidate.expose_secret());

    Argon2::default()
        .verify_password(hash_candidate.expose_secret().as_bytes(), &expected_hash)
        .map_err(|_| anyhow!("Invalid state hash"))
}
