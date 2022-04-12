import { Menu, MenuItem, Paper, Typography } from "@mui/material";
import React from "react";
import {
  useAnchorEl,
  useModalOpen,
  useToggleSettingsMenu,
} from "../../state/application/hooks";
import { ApplicationModal } from "../../state/application/reducer";

export default function SettingsMenu() {
  const settingsMenuOpen = useModalOpen(ApplicationModal.SETTINGS);
  const settingsRef = useAnchorEl(ApplicationModal.SETTINGS);
  const toggleSettingsMenu = useToggleSettingsMenu();
  const anchorEl = document.getElementById(settingsRef) ?? null;

  return (
    <Paper>
      <Menu
        anchorEl={anchorEl}
        open={settingsMenuOpen}
        onClose={toggleSettingsMenu}
        keepMounted
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem>
          <Typography variant="inherit">Settings</Typography>
        </MenuItem>
      </Menu>
    </Paper>
  );
}
