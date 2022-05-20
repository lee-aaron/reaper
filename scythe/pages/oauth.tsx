import {
  Button,
  Container,
  Grid,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import type { NextPage } from "next";
import Image from "next/image";
import React from "react";
import discord from "../public/discord_logo_small.svg";
import Loading from "../src/components/Loading";
import { useAuthStatus } from "../src/state/authentication/hooks";
import { AuthStatus } from "../src/state/authentication/reducer";

const Login: NextPage = () => {
  const theme = useTheme();
  const authStatus = useAuthStatus();

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
            Login Page
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
          {authStatus == AuthStatus.PENDING ? (
            <Loading />
          ) : (
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
                  href="https://discord.com/api/oauth2/authorize?client_id=966453809335382106&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Flogin&response_type=code&scope=identify%20email"
                  sx={{
                    padding: theme.spacing(1, 1),
                  }}
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
          )}
        </Grid>
      </Container>
    </React.Fragment>
  );
};

export default Login;
