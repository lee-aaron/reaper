import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import MenuIcon from "@mui/icons-material/Menu";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  AppBar,
  Container,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  styled,
  SwipeableDrawer,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";
import { NextRouter, withRouter } from "next/router";
import React from "react";
import useToggle from "../../hooks/useToggle";
import {
  useAnchorElCallback,
  useToggleSettingsMenu,
} from "../../state/application/hooks";
import { ApplicationModal } from "../../state/application/reducer";
import SettingsMenu from "../SettingsMenu";

interface Props {
  toggleColorMode: () => void;
  router: NextRouter;
}

const Header: React.FC<Props> = (props: Props) => {
  const theme = useTheme();
  const Offset = styled("div")(({ theme }) => theme.mixins.toolbar);
  const [open, setOpen] = useToggle();
  const toggleSettingsMenu = useToggleSettingsMenu();
  const setAnchorEl = useAnchorElCallback(ApplicationModal.SETTINGS);

  return (
    <React.Fragment>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={setOpen}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            sx={{ flexGrow: 1, cursor: "pointer", paddingLeft: 1 }}
            variant="h4"
            onClick={() => props.router.push("/")}
          >
            Reaper
          </Typography>
          <IconButton onClick={props.toggleColorMode}>
            {theme.palette.mode === "dark" ? (
              <Brightness7Icon />
            ) : (
              <Brightness4Icon />
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
      <SwipeableDrawer open={open} onOpen={setOpen} onClose={setOpen}>
        <Container maxWidth="xs">
          <List component="nav">
            <Offset />
            <Divider />
            <ListItemButton
              component="a"
              onClick={() => {
                setOpen();
                props.router.push("/mypage");
              }}
            >
              <ListItemText primary="My Page" />
            </ListItemButton>
            <ListItemButton
              component="a"
              onClick={() => {
                setOpen();
                props.router.push("/tracker");
              }}
            >
              <ListItemText primary="Tax Tracker" />
            </ListItemButton>
            <ListItemButton
              component="a"
              onClick={() => {
                setOpen();
                props.router.push("/faq");
              }}
            >
              <ListItemText primary="FAQ" />
            </ListItemButton>
            <ListItemButton
              component="a"
              onClick={() => {
                setOpen();
                props.router.push("/dashboard");
              }}
            >
              <ListItemText primary="Dashboard" />
            </ListItemButton>
          </List>
        </Container>
      </SwipeableDrawer>
      <SettingsMenu />
    </React.Fragment>
  );
};

export default withRouter(Header);
