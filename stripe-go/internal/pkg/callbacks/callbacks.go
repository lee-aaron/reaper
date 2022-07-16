package callbacks

import (
	"database/sql"
	"time"
)

type Handler struct {
	BotName        string
	BotKeyword     string
	ContextTimeout time.Duration
	Db             *sql.DB
}
