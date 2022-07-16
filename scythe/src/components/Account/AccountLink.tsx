import {
  Box,
  Button,
  Card,
  Container,
  Grid,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useEffect } from "react";
import { useUser } from "../../state/discord/hooks";
import { useAppDispatch } from "../../state/hooks";
import { GetAccount } from "../../state/payments/actions";
import Loading from "../Loading";

const AccountLink = () => {
  const theme = useTheme();
  const user = useUser();
  const [url, setURL] = React.useState("");
  // show loading symbol and periodically check for verified status
  const [isLoading, setIsLoading] = React.useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    let params = new URLSearchParams(window.location.search);
    if (!params.get("return")) {
      return;
    }

    // interval to get owner status every 2 seconds for 3 times
    let num = 0;
    setIsLoading(true);

    const interval = setInterval(() => {
      if (num++ === 3) {
        setIsLoading(false);
        clearInterval(interval);
      }

      dispatch(
        GetAccount({
          discord_id: user.id,
        })
      );
    }, 2000);

    return () => {
      clearInterval(interval);
      setIsLoading(false);
    };
  }, [user, dispatch]);

  useEffect(() => {
    let shouldFetch = true;

    if (!user.id) {
      return;
    }

    const fetchData = async () => {
      let accountUrl = new URL(
        "/api/v1/get_account_link",
        window.location.origin
      );
      accountUrl.searchParams.append("discord_id", user.id);

      let returnUrl = new URL(window.location.href);
      returnUrl.searchParams.set("return", "true");
      accountUrl.searchParams.append("return_url", returnUrl.toString());
      accountUrl.searchParams.append("refresh_url", window.location.href);

      let response = await fetch(accountUrl.toString()).then((res) =>
        res.json()
      );

      setURL(response.url);
    };

    if (shouldFetch) {
      fetchData().catch(console.error);
    }

    return () => {
      shouldFetch = false;
    };
  }, [user.id]);

  return (
    <React.Fragment>
      <Container
        sx={{
          marginTop: 1,
        }}
        maxWidth="md"
      >
        <Paper
          sx={{
            padding: theme.spacing(3, 2),
          }}
          elevation={3}
        >
          <Typography variant="h5" align="center">
            Complete your onboarding Stripe Account Process
          </Typography>
        </Paper>
        <Grid
          container
          spacing={{ xs: 2, md: 3 }}
          sx={{
            py: theme.spacing(2),
          }}
          justifyContent="center"
          alignItems="center"
        >
          {isLoading ? (
            <Loading />
          ) : (
            <Grid item>
              <Paper
                sx={{
                  padding: theme.spacing(1, 1),
                }}
                elevation={3}
              >
                <Button href={url}>Click here to go to Stripe</Button>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Container>
    </React.Fragment>
  );
};

export default AccountLink;
