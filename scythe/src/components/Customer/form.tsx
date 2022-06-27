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
import { useRouter } from "next/router";
import React from "react";
import { useUser } from "../../state/discord/hooks";
import { useAppDispatch } from "../../state/hooks";
import { CreateCustomer } from "../../state/payments/actions";

const CustomerForm: React.FC<{}> = () => {
  const user = useUser();
  const theme = useTheme();
  const router = useRouter();
  const [name, setName] = React.useState("");
  const dispatch = useAppDispatch();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    dispatch(
      CreateCustomer({
        name: name,
        email: user.email,
        discord_id: user.id,
        server_id: router.query.id as string,
      })
    );
  };

  return (
    <React.Fragment>
      <Container maxWidth="xl">
        <Paper
          sx={{
            padding: theme.spacing(3, 2),
          }}
          elevation={3}
        >
          <Typography variant="h5" align="center">
            Customer Signup
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

export default CustomerForm;
