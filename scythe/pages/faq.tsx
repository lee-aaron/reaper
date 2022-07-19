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
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: "center",
  color: theme.palette.text.secondary,
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
              subscription to a creator&apos;s platform such as Discord. Also as a
              user, you can create a private subscription to your own Discord
              server.
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
              Please join the discord server <Link href="/">here</Link> for
              updates on the platform
            </Typography>
          </Item>
        </Stack>
      </Container>
    </React.Fragment>
  );
};

export default FAQ;
