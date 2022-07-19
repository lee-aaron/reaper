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
  useTheme
} from "@mui/material";
import Link from "next/link";
import { NextRouter, withRouter } from "next/router";
import React, { useCallback } from "react";
import { logoutRequest } from "../../state/authentication/actions";
import { useIsAuthenticated } from "../../state/authentication/hooks";
import { useAppDispatch } from "../../state/hooks";
import NavMenu from "../NavMenu";
import SettingsMenu from "../SettingsMenu";

interface Props {
  toggleColorMode: () => void;
  router: NextRouter;
}

const Header: React.FC<Props> = (props: Props) => {
  const theme = useTheme();
  const isAuthenticated = useIsAuthenticated();
  const dispatch = useAppDispatch();

  const handleLogoutUser = useCallback(() => {
    dispatch(logoutRequest());
  }, [dispatch]);

  return (
    <React.Fragment>
      <AppBar position="static">
        <Toolbar>
          {isAuthenticated ? <NavMenu /> : null}
          <Typography
            sx={{ flexGrow: 1, cursor: "pointer", paddingLeft: 1 }}
            variant="h4"
            onClick={() => props.router.push("/")}
          >
            Shuudann
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
            {isAuthenticated ? (
              <Link href="/login">
                <Tooltip title="Logout">
                  <LogoutIcon onClick={handleLogoutUser}/>
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
          {
            isAuthenticated ? <SettingsMenu /> : null
          }
        </Toolbar>
      </AppBar>
    </React.Fragment>
  );
};

export default withRouter(Header);
