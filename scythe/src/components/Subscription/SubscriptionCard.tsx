import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  Typography
} from "@mui/material";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  CreateSubscription,
  SearchSubscription
} from "../../state/payments/actions";
import { useCustomer, useSubscription } from "../../state/payments/hooks";
import Loading from "../Loading";

const SubscriptionCard: React.FC<{}> = () => {
  const sub = useSubscription();
  const dispatch = useDispatch();
  const cus = useCustomer();
  const router = useRouter();

  // fetch relevant product information
  useEffect(() => {
    // given prod_id
    let prod_id = router.query.prod_id as string;

    dispatch(SearchSubscription({ prod_id }));
  }, [router.query.prod_id]);

  // router push to checkout page when customer secret loads
  useEffect(() => {
    if (cus.secret[router.query.prod_id as string]) {
      router.push(`/subscribe/${router.query.id}/${router.query.prod_id}/checkout`);
    }
  }, [cus.secret]);

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    let body = {
      prod_id: router.query.prod_id as string,
      customer_id: cus.id,
    };

    dispatch(CreateSubscription(body));
  };

  return (
    <React.Fragment>
      <Grid
        container
        direction="column"
        alignItems="center"
        justifyContent="center"
      >
        {sub.loading === "loading" ? (
          <Loading />
        ) : (
          <Card sx={{ px: 5 }}>
            <CardHeader
              avatar={
                <Avatar
                  sx={{
                    height: "64px",
                    width: "64px",
                  }}
                  src={`https://cdn.discordapp.com/icons/${sub.discord_id}/${sub.discord_icon}.png?size=64`}
                />
              }
              title={sub.discord_name}
              subheader={sub.sub_name}
            />
            <CardContent>
              <Typography variant="body1" color="textSecondary" component="p">
                {sub.sub_description}
              </Typography>
              <Typography variant="body2" color="textSecondary" component="p">
                ${sub.sub_price}
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={handleClick}>
                Subscribe
              </Button>
            </CardActions>
          </Card>
        )}
      </Grid>
    </React.Fragment>
  );
};

export default SubscriptionCard;
