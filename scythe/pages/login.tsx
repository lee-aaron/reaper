import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import type { NextPage } from "next";
import React from "react";

const Login: NextPage = () => {
  const theme = useTheme();

  return (
    <React.Fragment>
      <Container
        component="main"
        maxWidth="xs"
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
            Login
          </Typography>
        </Paper>
      </Container>
    </React.Fragment>
  );
};

export default Login;
