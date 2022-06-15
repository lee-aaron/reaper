import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import React from "react";
import { useUser } from "../../state/discord/hooks";

const CreateAccount = () => {
  const theme = useTheme();
  const user = useUser();
  const [name, setName] = React.useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const createUrl = new URL("/api/v1/create_account", window.location.origin);

    const response = await fetch(createUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        discord_id: user.id,
        email: user.email,
        name: name,
        refresh_url: window.location.href,
        return_url: window.location.href,
      }),
    }).then(res => res.json());
    location.assign(response.url);
  };

  return (
    <React.Fragment>
      <Container
        sx={{
          marginTop: 1,
        }}
        maxWidth="xl"
      >
        <Paper
          sx={{
            padding: theme.spacing(3, 2),
          }}
          elevation={3}
        >
          <Typography variant="h5" align="center">
            Create a Stripe Account
          </Typography>
        </Paper>
        <form onSubmit={handleSubmit}>
          <Container maxWidth="md">
            <Grid
              container
              spacing={{ xs: 2, md: 3 }}
              columns={{ xl: 2 }}
              sx={{
                py: theme.spacing(2),
              }}
            >
              <Grid item xl={1}>
                <TextField
                  required
                  id="name"
                  label="Name"
                  fullWidth
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  variant="standard"
                />
              </Grid>
              <Grid item xl={1}>
                <Tooltip
                  title="Not your email? Make sure your Discord email is correct!"
                  arrow
                >
                  <TextField
                    required
                    disabled
                    id="email"
                    label="Email"
                    value={user.email}
                    fullWidth
                    variant="standard"
                  />
                </Tooltip>
              </Grid>
              <Grid item xl={2}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <Button type="submit">Create Account</Button>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </form>
      </Container>
    </React.Fragment>
  );
};

export default CreateAccount;
