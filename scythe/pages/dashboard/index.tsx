import {
  Card,
  CardHeader,
  Container,
  Grid,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useIsAuthenticated } from "../../src/state/authentication/hooks";

const Dashboard: NextPage = () => {
  const theme = useTheme();
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();

  if (!isAuthenticated) {
    router.push("/login");
  }

  useEffect(() => {
    // fetch subscriptions and current status
    // fetch customer portal url
  }, []);

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
        <Grid
          container
          spacing={{ xs: 2, md: 3 }}
          columns={{ xs: 4, sm: 8, md: 12 }}
          sx={{
            py: theme.spacing(2),
          }}
        >
          <Grid item>
            <Card>
              <CardHeader title="Created Subscriptions" />
            </Card>
          </Grid>
          <Grid item>
            <Card>
              <CardHeader title="Current Subscriptions" />
            </Card>
          </Grid>
        </Grid>
      </Container>
    </React.Fragment>
  );
};

export default Dashboard;
