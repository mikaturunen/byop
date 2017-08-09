resource "heroku_app" "default" {
  name    = "payment-api"
  region  = "eu"

  config_vars {
    NODE_ENV = "production"
  }

  buildpacks = [
    "heroku/nodejs"
  ]
}
