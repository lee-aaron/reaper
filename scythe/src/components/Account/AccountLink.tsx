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

const AccountLink = () => {
  const theme = useTheme();
  const user = useUser();
  const [url, setURL] = React.useState("");

  useEffect(() => {
    let shouldFetch = true;

    const fetchData = async () => {
      let accountUrl = new URL(
        "/api/v1/get_account_link",
        window.location.origin
      );
      accountUrl.searchParams.append("discord_id", user.id);
      accountUrl.searchParams.append("return_url", window.location.href);
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
  }, []);

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
        </Grid>
      </Container>
    </React.Fragment>
  );
};

export default AccountLink;
