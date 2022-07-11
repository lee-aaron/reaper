import { LoadingButton } from "@mui/lab";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useUser } from "../../state/discord/hooks";
import {
  CreateSubscription,
  SearchProduct,
} from "../../state/payments/actions";
import { useCustomer, useSubscription } from "../../state/payments/hooks";
import Loading from "../Loading";

const SubscriptionCard: React.FC<{}> = () => {
  const sub = useSubscription();
  const dispatch = useDispatch();
  const cus = useCustomer();
  const router = useRouter();
  const user = useUser();

  // fetch relevant product information from prod_id
  useEffect(() => {
    if (!router.query.prod_id) return;

    dispatch(SearchProduct({ prod_id: router.query.prod_id as string }));
  }, [router.isReady]);

  // router push to checkout page when customer secret loads
  useEffect(() => {
    if (cus.secret[router.query.prod_id as string]) {
      router.push(
        `/subscribe/${router.query.server_id}/${router.query.prod_id}/checkout`
      );
    }
  }, [cus.secret]);

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
              <LoadingButton loading={cus.secret_loading === "idle"} size="small" onClick={handleClick}>
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
