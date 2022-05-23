import { Container, Grid, Paper, Typography, useTheme } from "@mui/material";
import type { NextPage } from "next";
import React from "react";

const Home: NextPage = () => {
  const theme = useTheme();

  return (
    <React.Fragment>
      <Container
        sx={{
          marginTop: 5,
        }}
      >
        <Paper
          sx={{
            padding: theme.spacing(3, 2),
          }}
          elevation={3}
        >
          <Typography variant="h4" align="center">
            Welcome to Reaper!
          </Typography>
          <Typography
            sx={{ mt: theme.spacing(2) }}
            variant="body1"
            align="center"
          >
            A Place to start up your Private Community
          </Typography>
        </Paper>
        <Grid
          container
          spacing={{ xs: 2, md: 3 }}
          columns={{ xs: 4, sm: 8, md: 12 }}
          sx={{
            padding: theme.spacing(3, 2),
          }}
        >
          <Grid item xs={4} sm={8} md={12}>
            <Paper
              sx={{
                padding: theme.spacing(1),
              }}
            >
              <Typography variant="h6" align="center">
                Services
              </Typography>
              <Typography variant="body1" align="center">
                Users can create a private subscription to their various
                platforms such as Discord
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={4} sm={8} md={12}>
            <Paper
              sx={{
                padding: theme.spacing(1),
              }}
            >
              <Typography variant="h6" align="center">
                Pricing
              </Typography>
              <Typography variant="body1" align="center">
                This is a managed subscription based platform where we charge
                monthly maintenance fees.
              </Typography>
              <Typography variant="body1" align="center">
                Hosts can charge any amount greater than the management fee and
                can keep all profits!
              </Typography>
              <Typography variant="body1" align="center">
                Current management fee is $10 per user per month.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </React.Fragment>
  );
};

export default Home;
