import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  AppBar,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { NextRouter, withRouter } from "next/router";
import Link from "next/link";
import React from "react";
import {
  useAnchorElCallback,
  useToggleSettingsMenu,
} from "../../state/application/hooks";
import { ApplicationModal } from "../../state/application/reducer";
import { useAuthStatus } from "../../state/authentication/hooks";
import { AuthStatus } from "../../state/authentication/reducer";
import SettingsMenu from "../SettingsMenu";

interface Props {
  toggleColorMode: () => void;
  router: NextRouter;
}

const Header: React.FC<Props> = (props: Props) => {
  const theme = useTheme();
  const toggleSettingsMenu = useToggleSettingsMenu();
  const setAnchorEl = useAnchorElCallback(ApplicationModal.SETTINGS);
  const authStatus = useAuthStatus();

  return (
    <React.Fragment>
      <AppBar position="static">
        <Toolbar>
          <Typography
            sx={{ flexGrow: 1, cursor: "pointer", paddingLeft: 1 }}
            variant="h4"
            onClick={() => props.router.push("/")}
          >
            Reaper
          </Typography>
          <Tooltip title="Dark Mode">
            <IconButton onClick={props.toggleColorMode}>
              {theme.palette.mode === "dark" ? (
                <Brightness7Icon />
              ) : (
                <Brightness4Icon />
              )}
            </IconButton>
          </Tooltip>
          <IconButton>
            {authStatus === AuthStatus.LOGGED_IN ? (
              <Link href="/logout">
                <LogoutIcon />
              </Link>
            ) : (
              <Link href="/login">
                <Tooltip title="Login">
                  <LoginIcon />
                </Tooltip>
              </Link>
            )}
          </IconButton>
          <IconButton
            id="settings-menu-button"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              setAnchorEl(e.currentTarget.id);
              toggleSettingsMenu();
            }}
            sx={{
              mr: theme.spacing(1),
            }}
          >
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <SettingsMenu />
    </React.Fragment>
  );
};

export default withRouter(Header);
