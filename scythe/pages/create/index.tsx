import {
  Box,
  Button,
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
import { CreateAccount } from "../../src/components/Account/";
import AccountLink from "../../src/components/Account/AccountLink";
import Payment from "../../src/components/Product";
import { useIsAuthenticated } from "../../src/state/authentication/hooks";
import { useUser } from "../../src/state/discord/hooks";
import { useOwner } from "../../src/state/payments/hooks";

const Create: NextPage = () => {
  const theme = useTheme();
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();
  const user = useUser();
  const owner = useOwner();

  if (!isAuthenticated) {
    router.push("/login");
  }

  const handleDelete = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const deleteUrl = new URL("/api/v1/delete_account", window.location.origin);

    const response = await fetch(deleteUrl.toString(), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: `"${user.id}"`,
    }).then((res) => res.json());

    console.log(response);
  };

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
      <form onSubmit={handleDelete}>
        <Container maxWidth="md">
          <Grid item xl={2}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Button type="submit">Delete Account</Button>
            </Box>
          </Grid>
        </Container>
      </form>
    </React.Fragment>
  );
};

export default Create;
