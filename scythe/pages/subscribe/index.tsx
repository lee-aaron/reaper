import SearchIcon from "@mui/icons-material/Search";
import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Container,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import { useIsAuthenticated } from "../../src/state/authentication/hooks";

interface Subscription {
  discord_id: string;
  discord_icon: string;
  discord_name: string;
  subscription_name: string;
  subscription_description: string;
}

const Subscribe: NextPage = () => {
  const theme = useTheme();
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();
  const [form, setForm] = React.useState<any>();
  const [error, setError] = React.useState<boolean>();
  const [subscriptions, setSubscriptions] = React.useState(
    Array<Subscription>()
  );

  if (!isAuthenticated) {
    router.push("/login");
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.currentTarget;
    setForm({ ...form, [id]: value });
  };

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (form.discord_name.length < 3) {
      setError(true);
      return;
    }

    setError(false);

    // dispatch get all subscriptions on click
    let searchUrl = new URL("/api/v1/search_guilds", window.location.origin);
    searchUrl.searchParams.append("discord_name", form.discord_name);
    fetch(searchUrl.toString())
      .then((res) => res.json())
      .then((data) => {
        setSubscriptions(data);
      })
      .catch((err) => console.error(err));
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
            Subscribe
          </Typography>
        </Paper>
        <form onSubmit={handleSearch}>
          <Container maxWidth="md">
            <Grid
              container
              direction="row"
              justifyContent="center"
              alignItems="center"
              sx={{
                py: theme.spacing(2),
              }}
            >
              <Grid item xs={5}>
                <TextField
                  required
                  error={error}
                  id="discord_name"
                  label="Discord Server Name"
                  fullWidth
                  onChange={handleChange}
                  variant="standard"
                  helperText="Enter a minimum of 3 characters"
                />
              </Grid>
              <Grid alignItems="stretch" style={{ display: "flex" }}>
                <IconButton type="submit">
                  <SearchIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Container>
        </form>
        <Grid
          container
          spacing={{ xs: 2, md: 3 }}
          columns={{ xs: 4, sm: 8, md: 12 }}
          sx={{
            padding: theme.spacing(3, 2),
            justifyContent: "center",
          }}
        >
          {subscriptions.map((sub: Subscription) => (
            <Grid item xs={4} sm={4} md={3}>
              <Card sx={{ maxWidth: 340, padding: "1rem", my: "1rem" }}>
                <CardHeader
                  avatar={
                    <Avatar
                      sx={{
                        height: "64px",
                        width: "64px",
                      }}
                      src={`https://cdn.discordapp.com/icons/${sub.discord_id}/${sub.discord_icon}.png?size=64`}
                    />
                  }
                  title={sub.discord_name}
                  subheader={sub.subscription_name}
                />
                <CardContent>
                  <Typography
                    variant="body1"
                    color="textSecondary"
                    component="p"
                  >
                    {sub.subscription_description}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="p"
                  >
                    ${0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </React.Fragment>
  );
};

export default Subscribe;
