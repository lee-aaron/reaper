import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import {
  AppBar,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import Link from "next/link";
import { NextRouter, withRouter } from "next/router";
import React from "react";
import { useToggleNavMenu } from "../../state/application/hooks";
import { useUser } from "../../state/authentication/hooks";
import NavMenu from "../NavMenu";
import SettingsMenu from "../SettingsMenu";

interface Props {
  toggleColorMode: () => void;
  router: NextRouter;
}

const Header: React.FC<Props> = (props: Props) => {
  const theme = useTheme();
  const toggleNavMenu = useToggleNavMenu();
  const { isError } = useUser();

  return (
    <React.Fragment>
      <AppBar position="static">
        <Toolbar>
          {!isError ? <NavMenu /> : null}
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
            {!isError ? (
              <Link href="/api/v1/logout">
                <Tooltip title="Logout">
                  <LogoutIcon />
                </Tooltip>
              </Link>
            ) : (
              <Link href="/login">
                <Tooltip title="Login">
                  <LoginIcon />
                </Tooltip>
              </Link>
            )}
          </IconButton>
          <SettingsMenu />
        </Toolbar>
      </AppBar>
    </React.Fragment>
  );
};

export default withRouter(Header);
