import { CircularProgress } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";

const Loading: React.FC = () => {
  return (
    <Box display="flex" height="50vh">
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        flex="1 1 auto"
      >
        <CircularProgress />
      </Box>
    </Box>
  );
};

export default Loading;