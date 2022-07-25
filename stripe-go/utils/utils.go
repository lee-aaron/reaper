package utils

import (
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/spf13/viper"
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
	Port         uint
	Host         string
	Webhook_port uint
}

type DiscordSettings struct {
	Bot_token string
}

const (
	Development = "local"
)

func GetEnvironment() string {
	env := os.Getenv("GO_ENV")
	if env == "" || env == Development {
		env = "local"
	}
	return env
}

func filter(envs []string) (ret []string) {
	for _, env := range envs {
		if strings.HasPrefix(env, "APP_") {
			ret = append(ret, env)
		}
	}
	return
}

func LoadYaml() Settings {
	env := GetEnvironment()

	var settings Settings

	pwd, err := os.Getwd()
	if err != nil {
		panic(err)
	}
	pwd, err = filepath.Abs(pwd + "/../configuration/")
	if err != nil {
		panic(err)
	}

	viper.SetConfigFile(filepath.Join(pwd, "base.yaml"))
	err = viper.ReadInConfig()
	if err != nil {
		panic(err)
	}

	viper.SetConfigFile(filepath.Join(pwd, env+".yaml"))
	viper.MergeInConfig()

	if env == Development {
		viper.WatchConfig()
	}

	err = viper.Unmarshal(&settings)
	if err != nil {
		panic(err)
	}

	// Override database settings
	envs := filter(os.Environ())
	for _, env := range envs {
		vars := strings.Split(env, "=")
		// trim key by APP_ prefix and replace __ with .
		key := strings.TrimPrefix(vars[0], "APP_")
		key = strings.Replace(key, "__", ".", -1)
		key = strings.ToLower(key)

		switch key {
		case "database.username":
			settings.Database.Username = vars[1]
		case "database.password":
			settings.Database.Password = vars[1]
		case "database.port":
			u64, _ := strconv.ParseUint(vars[1], 10, 32)
			settings.Database.Port = uint(u64)
		case "database.host":
			settings.Database.Host = vars[1]
		case "database.database_name":
			settings.Database.Database_name = vars[1]
		case "database.require_ssl":
			settings.Database.Require_ssl = vars[1] == "true"
		}
	}

	return settings
}
