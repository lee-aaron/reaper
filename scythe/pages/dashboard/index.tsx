import { Container, Grid, Paper, Typography, useTheme } from "@mui/material";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import Payment from "../../src/components/Payment";
import { useUser } from "../../src/state/authentication/hooks";

const Dashboard: NextPage = () => {
  const theme = useTheme();
  const { isError } = useUser();
  const router = useRouter();

  if (isError) {
    router.push("/login");
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
            <Paper
              sx={{
                padding: theme.spacing(1, 1),
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <Typography variant="h4" align="center">
                No Guilds
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        <Payment />
      </Container>
    </React.Fragment>
  );
};

export default Dashboard;
