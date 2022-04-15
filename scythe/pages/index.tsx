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
            A Discussion and Forum for Aaron&apos;s Crypto Holdings
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
                I provide crypto yield farming analysis services for various
                coins and protocols across different networks.
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
                This is a subscription based platform that allows you to use this platform and gain access to our discussion page.
              </Typography>
              <Typography variant="body1" align="center">
                $10 USD per month
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </React.Fragment>
  );
};

export default Home;
