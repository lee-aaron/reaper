import {
  Button,
  Container,
  Grid,
  Paper,
  Typography,
  useTheme
} from "@mui/material";
import type { NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import discord from "../public/discord_logo_small.svg";
import { useIsAuthenticated } from "../src/state/authentication/hooks";

const Login: NextPage = () => {
  const theme = useTheme();

  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();

  if (isAuthenticated) {
    router.push("/dashboard");
  }

  useEffect(() => {
    router.prefetch("/dashboard");
  }, []);

  return (
    <React.Fragment>
      <Container
        component="main"
        maxWidth="xs"
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
            Login
          </Typography>
        </Paper>
        <Grid
          container
          spacing={{ xs: 2, md: 3 }}
          columns={{ xs: 4, sm: 8, md: 12 }}
          sx={{
            padding: theme.spacing(3, 2),
            justifyContent: "center",
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
              <Button
                href="/api/login"
                sx={{
                  padding: theme.spacing(1, 1),
                }}
                variant="outlined"
              >
                <Image src={discord} height="50%" />
                <Typography
                  variant="button"
                  align="center"
                  sx={{
                    ml: theme.spacing(2),
                  }}
                >
                  Connect to Discord
                </Typography>
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </React.Fragment>
  );
};

export default Login;
