import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Typography,
} from "@mui/material";
import React from "react";
import { Product } from ".";

const SubscriptionItem: React.FC<Product> = (product: Product) => {

  return (
    <React.Fragment>
      <Card sx={{ maxWidth: 340, padding: "1rem", my: "1rem" }}>
        <CardHeader avatar={
          <Avatar sx={{
            height: "64px",
            width: "64px",
          }} src={`https://cdn.discordapp.com/icons/${product.metadata.get("discord_server_id")}/${product.metadata.get("discord_server_icon")}.png?size=64`} />
        } 
        title={product.metadata.get("discord_server_name")}
        subheader={product.name}
        />
        <CardContent>
          <Typography variant="body1" color="textSecondary" component="p">
            {product.description}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            ${product.amount}
          </Typography>
        </CardContent>
        <CardActions>
          <Button size="small">Remove</Button>
        </CardActions>
      </Card>
    </React.Fragment>
  );
};

export default SubscriptionItem;
