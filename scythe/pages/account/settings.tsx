import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  CardActions,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import type { NextPage } from "next";
import router, { useRouter } from "next/router";
import React, { useEffect } from "react";
import SubCard from "../../src/components/Subscription/Card";
import { useIsAuthenticated } from "../../src/state/authentication/hooks";
import { useUser } from "../../src/state/discord/hooks";
import { useAppDispatch } from "../../src/state/hooks";
import {
  CancelSubscription,
  SearchSubscription,
} from "../../src/state/payments/actions";
import { useCustomer, useOwner } from "../../src/state/payments/hooks";
import { DashboardSubscription } from "../../src/state/payments/reducer";

const Subscribe: NextPage = () => {
  const theme = useTheme();
  const router = useRouter();
  const user = useUser();
  const dispatch = useAppDispatch();
  const cus = useCustomer();
  const isAuthenticated = useIsAuthenticated();
  const [sub, setSub] = React.useState<DashboardSubscription>();
  const owner = useOwner();

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
  }, [user.id, cus.user_created]);

  const handleCancel = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (!sub) return;
    let body = {
      prod_id: sub.prod_id,
      server_id: sub.server_id,
      discord_id: user.id,
    };

    dispatch(CancelSubscription(body));
    handleClose();
  };

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = (sub: DashboardSubscription) => {
    setSub(sub);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleView = (sub: DashboardSubscription) => {
    let query = {
      server_id: sub.server_id,
      customer_id: sub.cus_id,
      return_url: window.location.href,
    };

    router.push(`/api/v1/create_portal?${new URLSearchParams(query)}`);
  };

  const handleViewAll = () => {
    let query = {
      discord_id: user.id
    }

    router.push(`/api/v1/create_login_link?${new URLSearchParams(query)}`);
  }

  return (
    <React.Fragment>
      <Container
        sx={{
          marginTop: 5,
        }}
        maxWidth="xl"
      >
        <Paper
          sx={{
            padding: theme.spacing(3, 2),
          }}
          elevation={3}
        >
          <Typography variant="h4" align="center">
            Settings
          </Typography>
        </Paper>
        {owner.id && (
          <Grid
            container
            justifyContent="center"
            alignItems="center"
            flexDirection="column"
            sx={{
              my: 2,
              p: 2,
            }}
          >
            <Paper sx={{ p: 3 }} component={Stack} direction="column" justifyContent="center">
              <Typography variant="h5">View your Customers and Track Income</Typography>
              <Button sx={{ mt: 2 }} onClick={handleViewAll}>Click to be redirected</Button>
            </Paper>
          </Grid>
        )}
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
            <SubCard
              sub={sub}
              key={i}
              actions={
                <CardActions>
                  <LoadingButton onClick={() => handleClickOpen(sub)}>
                    Cancel Subscription
                  </LoadingButton>
                  <Button onClick={() => handleView(sub)}>
                    Manage Payments & View Invoices
                  </Button>
                </CardActions>
              }
            />
          ))}
        </Grid>
      </Container>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Are you sure you want to cancel this subscription?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Your subscription will still be active until end of cycle.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Do not Cancel</Button>
          <Button onClick={handleCancel} autoFocus>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default Subscribe;
