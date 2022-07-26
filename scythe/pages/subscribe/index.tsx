import SearchIcon from "@mui/icons-material/Search";
import {
  Container,
  IconButton,
  Paper,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import type { NextPage } from "next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useIsAuthenticated } from "../../src/state/authentication/hooks";
const Grid = dynamic(() => import("@mui/material/Grid"));
const Avatar = dynamic(() => import("@mui/material/Avatar"));
const Card = dynamic(() => import("@mui/material/Card"));
const CardHeader = dynamic(() => import("@mui/material/CardHeader"));
const CardContent = dynamic(() => import("@mui/material/CardContent"));
const Tooltip = dynamic(() => import("@mui/material/Tooltip"));

interface ServerInfo {
  server_id: string;
  icon: string;
  name: string;
  description: string;
}

function stringToColor(string: string) {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}

function stringAvatar(name: string) {
  return {
    sx: {
      height: "64px",
      width: "64px",
      bgcolor: stringToColor(name),
    },
    children: `${name.split(" ")[0][0]}${name.split(" ")[1][0]}`,
  };
}

const Subscribe: NextPage = () => {
  const theme = useTheme();
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();
  const [form, setForm] = React.useState<any>();
  const [error, setError] = React.useState<boolean>();
  const [serverInfo, setServerInfo] = React.useState(Array<ServerInfo>());

  if (!isAuthenticated) {
    router.push("/login");
  }

  useEffect(() => {
    // check query params
    let query = router.query.discord_name as string;

    if (query) {
      // fetch and load discord server info
      let searchUrl = new URL("/api/v1/search_guilds", window.location.origin);
      searchUrl.searchParams.append("discord_name", query);

      fetch(searchUrl.toString())
        .then((res) => res.json())
        .then((data) => {
          setServerInfo(data);
        })
        .catch((err) => console.error(err));
    }
  }, [router.query.discord_name, router.isReady]);

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
    // set window's searchParams
    router.push(
      { pathname: "/subscribe", query: { discord_name: form.discord_name } },
      undefined,
      {
        shallow: true,
      }
    );

    fetch(searchUrl.toString())
      .then((res) => res.json())
      .then((data) => {
        setServerInfo(data);
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
          {serverInfo.map((sub: ServerInfo) => (
            <Grid key={sub.server_id} item xs={4} sm={4} md={3}>
              <Tooltip
                title="Click to be redirected to the list of subscriptions for this server"
                arrow
              >
                <Card
                  sx={{ maxWidth: 340, padding: "1rem", my: "1rem" }}
                  onClick={() => {
                    router.push({
                      pathname: `/subscribe/${sub.server_id}`,
                    });
                  }}
                >
                  <CardHeader
                    avatar={
                      sub.icon ? (
                        <Avatar
                          sx={{
                            height: "64px",
                            width: "64px",
                          }}
                          src={`https://cdn.discordapp.com/icons/${sub.server_id}/${sub.icon}.png?size=64`}
                        />
                      ) : (
                        <Avatar {...stringAvatar(sub.name)} />
                      )
                    }
                    title={sub.name}
                  />
                  <CardContent>
                    <Typography
                      variant="body1"
                      color="textSecondary"
                      component="p"
                    >
                      {sub.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Tooltip>
            </Grid>
          ))}
        </Grid>
      </Container>
    </React.Fragment>
  );
};

export default Subscribe;
