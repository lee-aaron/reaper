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
        maxWidth="md"
      >
        <Paper
          sx={{
            padding: theme.spacing(3, 2),
          }}
          elevation={3}
        >
          <Typography variant="h4" align="center">
            Welcome to Shuudann!
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
                Users can create a private subscription to a creator&apos;s platform
                such as Discord
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
                Current management fee is 5% per user per month with a minimum
                subscription amount of $10.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </React.Fragment>
  );
};

export default Home;
