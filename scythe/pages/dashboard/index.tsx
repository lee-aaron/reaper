import { Container, Paper, Typography, useTheme } from "@mui/material";
import type { NextPage } from "next";
import React from "react";

const Dashboard: NextPage = () => {
  const theme = useTheme();

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
            Dashboard
          </Typography>
        </Paper>
      </Container>
    </React.Fragment>
  );
};

export default Dashboard;
