import {
  Avatar,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  Typography,
} from "@mui/material";
import React, { ReactNode } from "react";
import { DashboardSubscription } from "../../state/payments/reducer";

function stringToColor(string: string) {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}

function stringAvatar(name: string) {
  return {
    sx: {
      height: "64px",
      width: "64px",
      bgcolor: stringToColor(name),
    },
    children: `${name.split(" ")[0][0]}${name.split(" ")[1][0]}`,
  };
}

interface Props {
  sub: DashboardSubscription;
  actions?: ReactNode;
}

const SubCard: React.FC<Props> = (props: Props) => {
  return (
    <React.Fragment>
      <Grid item>
        <Card>
          <CardHeader
            avatar={
              props.sub.icon ? (
                <Avatar
                  sx={{
                    height: "64px",
                    width: "64px",
                  }}
                  src={`https://cdn.discordapp.com/icons/${props.sub.server_id}/${props.sub.icon}.png?size=64`}
                />
              ) : (
                <Avatar {...stringAvatar(props.sub.name)} />
              )
            }
            title={props.sub.name}
            subheader={props.sub.description}
          />
          <CardContent>
            <Typography variant="subtitle1">{props.sub.sub_name}</Typography>
            <Typography variant="body2">{props.sub.sub_description}</Typography>
            <Typography variant="body2">{props.sub.role_name}</Typography>
            <Typography variant="body2">
              ${props.sub.sub_price} / month
            </Typography>
            {props.sub.status ? (
              <Typography variant="body2">{props.sub.status}</Typography>
            ) : null}
            {props.sub.num_subscribed != undefined ? (
              <Typography variant="body2">
                # of Subscribed: {props.sub.num_subscribed}
              </Typography>
            ) : null}
          </CardContent>
          {props.actions ? <CardActions>{props.actions}</CardActions> : null}
        </Card>
      </Grid>
    </React.Fragment>
  );
};

export default SubCard;
