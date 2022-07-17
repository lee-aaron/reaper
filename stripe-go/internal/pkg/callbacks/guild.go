package callbacks

import (
	"context"
	"fmt"

	"github.com/bwmarrin/discordgo"
)

// Add bot to guild and database
func (handler *Handler) GuildAdd(session *discordgo.Session, g *discordgo.GuildCreate) {
	ctx := context.Background()
	tx, err := handler.Db.BeginTx(ctx, nil)
	if err != nil {
		fmt.Println("Error starting transaction: " + err.Error())
		return
	}

	_, err = tx.ExecContext(ctx, `UPDATE bot_status SET bot_added = true WHERE server_id = $1`, g.ID)
	if err != nil {
		fmt.Println("Error updating bot_status: " + err.Error())
		return
	}

	err = tx.Commit()
	if err != nil {
		fmt.Println("Error committing transaction: " + err.Error())
		return
	}
}

// Bot is kicked from guild
func (handler *Handler) GuildLeave(session *discordgo.Session, g *discordgo.GuildDelete) {
	ctx := context.Background()
	tx, err := handler.Db.BeginTx(ctx, nil)
	if err != nil {
		fmt.Println("Error starting transaction: " + err.Error())
		return
	}

	_, err = tx.ExecContext(ctx, `UPDATE bot_status SET bot_added = false WHERE server_id = $1`, g.ID)
	if err != nil {
		fmt.Println("Error updating bot_status: " + err.Error())
		return
	}

	err = tx.Commit()
	if err != nil {
		fmt.Println("Error committing transaction: " + err.Error())
		return
	}
}
