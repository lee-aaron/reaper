package main

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/bwmarrin/discordgo"
	"github.com/lee-aaron/stripe-go/internal/pkg/callbacks"
	internalHTTP "github.com/lee-aaron/stripe-go/internal/pkg/http"
	"github.com/lee-aaron/stripe-go/utils"
	_ "github.com/lib/pq"
)

const (
	contextTimeout = 5 * time.Minute
)

var config = utils.LoadYaml()

func startSession(token string, db *sql.DB) (*discordgo.Session, error) {
	session, err := discordgo.New("Bot " + token)
	if err != nil {
		return nil, err
	}

	session.LogLevel = discordgo.LogInformational
	session.State.TrackEmojis = false
	session.State.TrackEmojis = false
	session.Identify.Intents = discordgo.MakeIntent(discordgo.IntentsAll)

	setupCallbackHandler(
		session,
		&callbacks.Handler{
			BotName:        "",
			BotKeyword:     "",
			Db:             db,
			ContextTimeout: contextTimeout,
		},
	)

	err = session.Open()
	if err != nil {
		return nil, err
	}

	return session, nil
}

func setupCallbackHandler(session *discordgo.Session, callbackConfig *callbacks.Handler) {
	session.AddHandler(callbackConfig.GuildAdd)
	session.AddHandler(callbackConfig.GuildLeave)
}

func closeComponent(component string, closer io.Closer) {
	err := closer.Close()
	if err != nil {
		log.Fatalf("Error closing %s", component)
	}
}

func startHTTPServer(db *sql.DB, session *discordgo.Session, port string) (httpServer *http.Server, stop chan os.Signal) {
	httpServer = internalHTTP.NewServer(db, session, port)
	stop = make(chan os.Signal, 1)

	go func() {
		if err := httpServer.ListenAndServe(); err != nil {
			if !errors.Is(err, http.ErrServerClosed) {
				stop <- syscall.SIGTERM
			}
		}
	}()

	signal.Notify(stop, syscall.SIGTERM)

	return httpServer, stop
}

func main() {
	sslmode := "disable"
	if config.Database.Require_ssl {
		sslmode = "require"
	}
	dbinfo := fmt.Sprintf("user=%s password=%s dbname=%s sslmode=%s", config.Database.Username, config.Database.Password, config.Database.Database_name, sslmode)
	db, err := sql.Open("postgres", dbinfo)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	session, err := startSession(config.Discord.Bot_token, db)
	if err != nil {
		log.Fatal(err)
	}

	defer closeComponent("Discord session", session)

	httpServer, stop := startHTTPServer(db, session, fmt.Sprint(config.Payments.WebhookPort))
	<-stop

	shutdownCtx, cancelShutdownCtx := context.WithTimeout(context.Background(), contextTimeout)
	defer cancelShutdownCtx()

	err = httpServer.Shutdown(shutdownCtx)
	if err != nil {
		log.Fatal("Error shutting down HTTP server gracefully")
	}
}
