#[macro_use]
extern crate rocket;

use rocket::fs::{relative, FileServer};

#[launch]
fn serve_website() -> _ {
    rocket::build()
        .mount("/", FileServer::from(relative!("scythe/build")))
}