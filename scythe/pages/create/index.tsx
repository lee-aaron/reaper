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
import { useUser } from "../../src/state/authentication/hooks";

const Create: NextPage = () => {
  const theme = useTheme();
  const { isError } = useUser();
  const router = useRouter();

  if (isError) {
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
        <Grid
          container
          spacing={{ xs: 2, md: 3 }}
          columns={{ xs: 4, sm: 8, md: 12 }}
          sx={{
            py: theme.spacing(2),
          }}
        >
          <Grid item xs={12} sm={6} md={8}>
            <Card
              sx={{
                padding: theme.spacing(1, 1),
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <CardHeader
                title="Getting Started"
                subtitle="Click here to get started"
              />
            </Card>
          </Grid>
        </Grid>
      </Container>
    </React.Fragment>
  );
};

export default Create;
