import {
  Card,
  CardHeader,
  Container,
  Grid,
  Paper,
  Typography,
  useTheme
} from "@mui/material";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import { useIsAuthenticated } from "../../src/state/authentication/hooks";

const Subscribe: NextPage = () => {
  const theme = useTheme();
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const color = "primary";

  if (!isAuthenticated) {
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
            Settings
          </Typography>
        </Paper>
        <Grid container>
          <Grid item xs={12} md={6} lg={8}>
            <Card
              sx={{
                py: 5,
                boxShadow: 1,
                textAlign: "center",
                color: (theme) => theme.palette[color].light,
                bgcolor: (theme) => theme.palette.background.paper,
                my: theme.spacing(2),
              }}
            >
              <CardHeader title="Payments" subtitle="Handle Payments" />
            </Card>
          </Grid>
        </Grid>
      </Container>
    </React.Fragment>
  );
};

export default Subscribe;
