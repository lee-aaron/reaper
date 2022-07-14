package utils

import (
	"os"
	"path/filepath"

	"github.com/gookit/config/v2"
	"github.com/gookit/config/v2/yamlv3"
)

type Settings struct {
	Application ApplicationSettings
	Database    DatabaseSettings
	Stripe      StripeSettings
	Payments    PaymentsSettings
	Discord     DiscordSettings
}

type ApplicationSettings struct {
	Host string
	Port uint
}

type DatabaseSettings struct {
	Username      string
	Password      string
	Port          uint
	Host          string
	Database_name string
	Require_ssl   bool
}

type StripeSettings struct {
	Secret_key string
}

type PaymentsSettings struct {
	Port        uint
	Host        string
	WebhookPort uint
}

type DiscordSettings struct {
	Bot_token string
}

const (
	Development = "development"
	Production  = "production"
)

func GetEnvironment() string {
	env := os.Getenv("GO_ENV")
	if env == "" || env == Development {
		env = "local"
	}
	return env
}

func LoadYaml() Settings {
	env := GetEnvironment()

	var settings Settings

	config.WithOptions(config.ParseEnv)
	config.AddDriver(yamlv3.Driver)

	pwd, err := os.Getwd()
	if err != nil {
		panic(err)
	}
	pwd, err = filepath.Abs(pwd + "/../configuration/")
	if err != nil {
		panic(err)
	}

	err = config.LoadFiles(filepath.Join(pwd, "base.yaml"), filepath.Join(pwd, env+".yaml"))
	if err != nil {
		panic(err)
	}

	settings.Application.Host = config.String("application.host")
	settings.Application.Port = config.Uint("application.port")

	settings.Payments.Port = config.Uint("payments.port")
	settings.Payments.Host = config.String("payments.host")
	settings.Payments.WebhookPort = config.Uint("payments.webhook_port")

	settings.Stripe.Secret_key = config.String("stripe.secret_key")

	settings.Database.Username = config.String("database.username")
	settings.Database.Password = config.String("database.password")
	settings.Database.Port = config.Uint("database.port")
	settings.Database.Host = config.String("database.host")
	settings.Database.Database_name = config.String("database.database_name")
	settings.Database.Require_ssl = config.Bool("database.require_ssl")

	settings.Discord.Bot_token = config.String("discord.bot_token")

	return settings
}
