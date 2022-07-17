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
import React from "react";
import { CreateAccount } from "../../src/components/Account/";
import AccountLink from "../../src/components/Account/AccountLink";
import Payment from "../../src/components/Product";
import { useIsAuthenticated } from "../../src/state/authentication/hooks";
import { useOwner } from "../../src/state/payments/hooks";

const Create: NextPage = () => {
  const theme = useTheme();
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();
  const owner = useOwner();

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
            Create a Guild
          </Typography>
        </Paper>
        {owner.status === "verified" ? (
          <Grid
            container
            spacing={{ xs: 2, md: 3 }}
            columns={{ xs: 4, sm: 8, md: 12 }}
            sx={{
              py: theme.spacing(2),
            }}
          >
            <Grid item xs={12} sm={8} md={12}>
              <Card
                sx={{
                  padding: theme.spacing(1, 1),
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <CardHeader
                  title="Create a Subscription"
                  subtitle="Subscription for Access to your Guild"
                />
                <Payment />
              </Card>
            </Grid>
          </Grid>
        ) : owner.status === "pending" ? (
          <AccountLink />
        ) : (
          <CreateAccount />
        )}
      </Container>
    </React.Fragment>
  );
};

export default Create;
