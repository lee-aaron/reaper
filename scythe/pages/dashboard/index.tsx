import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Container,
  Grid,
  Paper,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useIsAuthenticated } from "../../src/state/authentication/hooks";
import { useUser } from "../../src/state/discord/hooks";
import { SearchSubscription } from "../../src/state/payments/actions";
import { useCustomer } from "../../src/state/payments/hooks";
import { DashboardSubscription } from "../../src/state/payments/reducer";

const Dashboard: NextPage = () => {
  const theme = useTheme();
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();
  const cus = useCustomer();
  const dispatch = useDispatch();
  const user = useUser();

  if (!isAuthenticated) {
    router.push("/login");
  }

  useEffect(() => {
    if (!cus.user_created) return;

    // fetch and load customer subscriptions
    dispatch(
      SearchSubscription({
        discord_id: user.id,
      })
    );
  }, [cus.user_created]);

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
            Dashboard
          </Typography>
        </Paper>
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
                <Tooltip title="Looking to cancel / view your subscriptions? Visit your account's settings page!">
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
          {cus.subscriptions.map((sub: DashboardSubscription) => (
            <Grid item>
              <Card>
                <CardHeader
                  avatar={
                    <Avatar
                      sx={{
                        height: "64px",
                        width: "64px",
                      }}
                      src={`https://cdn.discordapp.com/icons/${sub.server_id}/${sub.icon}.png?size=64`}
                    />
                  }
                  title={sub.name}
                  subheader={sub.description}
                />
                <CardContent>
                  <Typography variant="subtitle1">{sub.sub_name}</Typography>
                  <Typography variant="body2">{sub.sub_description}</Typography>
                  <Typography variant="body2">
                    ${sub.sub_price} / month
                  </Typography>
                  <Typography variant="body2">
                    {sub.status}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </React.Fragment>
  );
};

export default Dashboard;
