package callbacks

import (
	"context"
	"fmt"

	"github.com/bwmarrin/discordgo"
)

func (handler *Handler) Ready(session *discordgo.Session, r *discordgo.Ready) {
	ctx := context.Background()
	tx, err := handler.Db.BeginTx(ctx, nil)
	if err != nil {
		fmt.Println("Error starting transaction: " + err.Error())
		return
	}

	for _, g := range r.Guilds {
		_, err = tx.ExecContext(ctx, `UPDATE bot_status SET bot_added = true where server_id = $1`, g.ID)
		if err != nil {
			fmt.Println("Error updating bot_status: " + err.Error())
			return
		}
	}

	err = tx.Commit()
	if err != nil {
		fmt.Println("Error committing transaction: " + err.Error())
		return
	}
}
