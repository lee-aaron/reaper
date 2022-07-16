import { LoadingButton } from "@mui/lab";
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  Typography
} from "@mui/material";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useUser } from "../../state/discord/hooks";
import { useAppDispatch } from "../../state/hooks";
import { SearchProduct } from "../../state/payments/actions";
import { useSubscription } from "../../state/payments/hooks";
import { CreateSubscription } from "../../state/stripe/action";
import { useStripe } from "../../state/stripe/hooks";
import Loading from "../Loading";

const SubscriptionCard: React.FC<{}> = () => {
  const sub = useSubscription();
  const dispatch = useAppDispatch();
  const stripe = useStripe();
  const router = useRouter();
  const user = useUser();

  // fetch relevant product information from prod_id
  useEffect(() => {
    if (!router.query.prod_id) return;

    dispatch(SearchProduct({ prod_id: router.query.prod_id as string }));
  }, [router.isReady]);

  // router push to checkout page when customer secret loads
  useEffect(() => {
    if (stripe.secret[router.query.prod_id as string]) {
      router.push(
        `/subscribe/${router.query.server_id}/${router.query.prod_id}/checkout`
      );
    }
  }, [stripe.secret]);

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    let body = {
      prod_id: router.query.prod_id as string,
      price_id: sub.price_id,
      server_id: router.query.server_id as string,
      discord_id: user.id,
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
            <CardHeader title={sub.sub_name} />
            <CardContent>
              <Typography variant="body1">{sub.sub_description}</Typography>
              <Typography variant="body1">${sub.sub_price} / month</Typography>
            </CardContent>
            <CardActions>
              <LoadingButton
                loading={stripe.loading === "idle"}
                size="small"
                onClick={handleClick}
              >
                Subscribe
              </LoadingButton>
            </CardActions>
          </Card>
        )}
      </Grid>
    </React.Fragment>
  );
};

export default SubscriptionCard;
