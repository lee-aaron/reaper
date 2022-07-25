import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  Container,
  Grid,
  Paper,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import SubCard from "../../src/components/Subscription/Card";
import { useIsAuthenticated } from "../../src/state/authentication/hooks";
import { useUser } from "../../src/state/discord/hooks";
import { useAppDispatch } from "../../src/state/hooks";
import {
  SearchOwnerSubscription,
  SearchSubscription,
} from "../../src/state/payments/actions";
import { useCustomer, useOwner } from "../../src/state/payments/hooks";
import { DashboardSubscription } from "../../src/state/payments/reducer";

const Dashboard: NextPage = () => {
  const theme = useTheme();
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();
  const cus = useCustomer();
  const owner = useOwner();
  const dispatch = useAppDispatch();
  const user = useUser();

  if (!isAuthenticated) {
    router.push("/login");
  }

  useEffect(() => {
    if (!user.id || !cus.user_created) return;

    // fetch and load customer subscriptions
    dispatch(
      SearchSubscription({
        discord_id: user.id,
      })
    );
  }, [dispatch, user.id, cus.user_created]);

  useEffect(() => {
    // fetch owner subscriptions
    if (!owner.id || !user.id) return;

    dispatch(
      SearchOwnerSubscription({
        discord_id: user.id,
      })
    );
  }, [dispatch, owner.id, user.id]);

  return (
    <React.Fragment>
      <Container maxWidth="xl">
        <Paper
          sx={{
            padding: theme.spacing(3, 2),
            mt: 3,
          }}
          elevation={3}
        >
          <Typography variant="h4" align="center">
            Dashboard
          </Typography>
        </Paper>
        {owner.subscriptions.length > 0 ? (
          <Paper
            sx={{
              my: 2,
              padding: theme.spacing(3, 2),
            }}
          >
            <Grid container>
              <Grid item sx={{ flex: 1 }}>
                <Typography variant="h5" align="center">
                  Created Subscriptions
                </Typography>
              </Grid>
              <Grid item>
                <Tooltip title="Looking to manage your subscriptions? Visit your account's settings page!">
                  <InfoOutlinedIcon />
                </Tooltip>
              </Grid>
            </Grid>
          </Paper>
        ) : null}
        <Grid
          container
          spacing={{ xs: 2, md: 3 }}
          columns={{ xs: 4, sm: 8, md: 12 }}
          sx={{
            py: theme.spacing(2),
          }}
        >
          {owner.subscriptions.map((sub: DashboardSubscription, i) => (
            <SubCard sub={sub} key={i} />
          ))}
        </Grid>

        {cus.subscriptions.length > 0 ? (
          <Paper
            sx={{
              my: 2,
              padding: theme.spacing(3, 2),
            }}
          >
            <Grid container>
              <Grid item sx={{ flex: 1 }}>
                <Typography variant="h5" align="center">
                  Current Subscriptions
                </Typography>
              </Grid>
              <Grid item>
                <Tooltip title="Looking to manage your subscriptions? Visit your account's settings page!">
                  <InfoOutlinedIcon />
                </Tooltip>
              </Grid>
            </Grid>
          </Paper>
        ) : null}
        <Grid
          container
          spacing={{ xs: 2, md: 3 }}
          columns={{ xs: 4, sm: 8, md: 12 }}
          sx={{
            py: theme.spacing(2),
          }}
        >
          {cus.subscriptions.map((sub: DashboardSubscription, i) => (
            <SubCard sub={sub} key={i} />
          ))}
        </Grid>
      </Container>
    </React.Fragment>
  );
};

export default Dashboard;
