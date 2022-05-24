import SettingsIcon from "@mui/icons-material/Settings";
import {
  Box,
  Divider,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useRef, useState } from "react";
import MenuPopover from "../MenuPopover";

export default function SettingsMenu() {
  const theme = useTheme();
  const anchorRef = useRef(null);

  const [open, setOpen] = useState<any>(null);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  return (
    <>
      <IconButton
        ref={anchorRef}
        onClick={handleOpen}
        sx={{
          mr: theme.spacing(1),
          p: 0,
        }}
      >
        <SettingsIcon />
      </IconButton>
      <MenuPopover
        anchorEl={open}
        open={Boolean(open)}
        onClose={handleClose}
        sx={{
          mt: 1.5,
          ml: 0.75,
          "& .MuiMenuItem-root": {
            typography: "body2",
            borderRadius: 0.75,
          },
        }}
      >
        <Box sx={{ my: 1.5, px: 2.5 }}>
          <Typography variant="subtitle2" noWrap>
            User?
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }} noWrap>
            Email
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: "dashed" }} />

        <Stack sx={{ p: 1 }}></Stack>
      </MenuPopover>
    </>
  );
}
