package callbacks

import (
	"context"
	"fmt"

	"github.com/bwmarrin/discordgo"
)

func (handler *Handler) RoleDelete(session *discordgo.Session, r *discordgo.GuildRoleDelete) {
	ctx := context.Background()
	tx, err := handler.Db.BeginTx(ctx, nil)
	if err != nil {
		fmt.Println("Error starting transaction: " + err.Error())
		return
	}

	_, err = tx.ExecContext(ctx, `DELETE from role WHERE role_id = $1`, r.RoleID)
	if err != nil {
		fmt.Println("Error updating role: " + err.Error())
		return
	}

	err = tx.Commit()
	if err != nil {
		fmt.Println("Error committing transaction: " + err.Error())
		return
	}
}
