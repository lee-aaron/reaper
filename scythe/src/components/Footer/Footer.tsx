import { Link, Paper, Stack, Typography, useTheme } from "@mui/material";
import { useRouter } from "next/router";
import React from "react";

const Footer: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();

  return (
    <React.Fragment>
      <Paper
        sx={{
          my: theme.spacing(2),
          padding: theme.spacing(2),
        }}
      >
        <Stack
          direction="row"
          spacing={3}
          justifyContent="center"
          sx={{ mb: 1 }}
        >
          <Link component="button" onClick={() => {
            router.push("/faq");
          }}>
            <Typography variant="subtitle2">FAQ</Typography>
          </Link>
          <Link component="button" onClick={() => {
            router.push("/terms");
          }}>
            <Typography variant="subtitle2">Terms and Conditions</Typography>
          </Link>
          <Link component="button" onClick={() => {
            router.push("/privacy");
          }}>
            <Typography variant="subtitle2">Privacy Policy</Typography>
          </Link>
        </Stack>
        <Typography variant="body2" align="center">
          {"Copyright © "}
          Shuudann {new Date().getFullYear()}
          {". All Rights Reserved"}
        </Typography>
      </Paper>
    </React.Fragment>
  );
};

export default Footer;
