import {
  Container,
  Link,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import type { NextPage } from "next";
import React from "react";

const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: "center",
}));

const FAQ: NextPage = () => {
  const theme = useTheme();

  return (
    <React.Fragment>
      <Container maxWidth="md">
        <Paper
          sx={{
            padding: theme.spacing(3, 2),
            my: theme.spacing(2),
          }}
          elevation={3}
        >
          <Typography variant="h4" align="center">
            FAQ
          </Typography>
        </Paper>
        <Stack spacing={2}>
          <Item>
            <Typography variant="h6" align="center">
              How do I get started?
            </Typography>
            <Typography variant="body1" align="center">
              As a user, you can login with discord by clicking on the login
              button on the top right. You can then create a private
              subscription to a creator&apos;s platform such as Discord. Also as
              a user, you can search and subscribe to a private Discord server.
            </Typography>
          </Item>
          <Item>
            <Typography variant="h6" align="center">
              Where can I find the bot to invite to the server?
            </Typography>
            <Typography variant="body1" align="center">
              You can invite the bot using this{" "}
              <Link href="https://discord.com/api/oauth2/authorize?client_id=966453809335382106&permissions=8&response_type=code&scope=bot">
                link
              </Link>
            </Typography>
          </Item>
          <Item>
            <Typography variant="h6" align="center">
              Where can I manage my subscriptions?
            </Typography>
            <Typography variant="body1" align="center">
              Once you have logged in, you can view your current subscriptions
              and/or created products on the dashboard page. If you want to
              manage your subscriptions and cancel them, you can visit your
              account settings page.
            </Typography>
          </Item>
          <Item>
            <Typography variant="h6" align="center">
              Where can I contact you if I need help?
            </Typography>
            <Typography variant="body1" align="center">
              Please join the discord server{" "}
              <Link href="https://discord.gg/VT5T9wXbQP">here</Link> for updates
              on the platform
            </Typography>
          </Item>
          <Item>
            <Typography variant="h6" align="center">
              Why was my payment rejected?
            </Typography>
            <Typography variant="body1" align="center">
              We do not handle or store your payment details. We only use Stripe
              as our payment processor. Please check your credit card to make
              sure it is valid and has not expired or check Stripe for more
              information.
            </Typography>
          </Item>
          <Item>
            <Typography variant="h6" align="center">
              How can I delete my account?
            </Typography>
            <Typography variant="body1" align="center">
              Please join the discord server and open a ticket describing your
              request. Please add additional information such as if you are a
              customer or if you are an owner.
            </Typography>
          </Item>
        </Stack>
      </Container>
    </React.Fragment>
  );
};

export default FAQ;
