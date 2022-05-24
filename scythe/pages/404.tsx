import { Button, Container, Paper, styled, Typography, useTheme } from "@mui/material";
import type { NextPage } from "next";
import React from "react";

const ContentStyle = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: theme.spacing(12, 0)
}));

const Error: NextPage = () => {
  const theme = useTheme();

  return (
    <React.Fragment>
      <Container
        sx={{
          marginTop: 5,
        }}
      >
        <ContentStyle sx={{ textAlign: 'center', alignItems: 'center' }}>
          <Paper
            sx={{
              padding: theme.spacing(3, 2),
              mb: theme.spacing(2),
            }}
            elevation={3}
          >
            <Typography variant="h4" align="center">
              Page Not Found!
            </Typography>
          </Paper>
          <Button href="/" size="large" variant="contained">
            Go Home
          </Button>
        </ContentStyle>
      </Container>
    </React.Fragment>
  );
};

export default Error;
