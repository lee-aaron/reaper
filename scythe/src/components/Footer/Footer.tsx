import { Paper, Typography, useTheme } from "@mui/material";
import React from "react";

const Footer: React.FC = () => {
  const theme = useTheme();

  return (
    <React.Fragment>
      <Paper sx={{
        mt: theme.spacing(2),
        padding: theme.spacing(2)
      }}>
        <Typography variant="body2" color="text.secondary" align="center">
          {"Copyright © "}
          Aaron Lee {new Date().getFullYear()}
          {". All Rights Reserved"}
        </Typography>
      </Paper>
    </React.Fragment>
  );
};

export default Footer;
