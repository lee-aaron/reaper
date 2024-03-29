import MenuIcon from "@mui/icons-material/Menu";
import {
  Container,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  styled,
  SwipeableDrawer,
  useTheme,
} from "@mui/material";
import { useRouter } from "next/router";
import React from "react";
import {
  useShowNavMenu,
  useToggleNavMenu,
} from "../../state/application/hooks";

const NavMenu: React.FC<{}> = () => {
  const theme = useTheme();
  const router = useRouter();
  const Offset = styled("div")(({ theme }) => theme.mixins.toolbar);
  const open = useShowNavMenu();
  const toggleNavMenu = useToggleNavMenu();

  return (
    <React.Fragment>
      <IconButton
        size="large"
        edge="start"
        color="inherit"
        aria-label="menu"
        onClick={() => {
          toggleNavMenu();
        }}
      >
        <MenuIcon />
      </IconButton>
      <SwipeableDrawer
        open={open}
        onOpen={toggleNavMenu}
        onClose={toggleNavMenu}
        PaperProps={{
          sx: {
            width: 280
          }
        }}
      >
        <Container>
          <List component="nav">
            <Offset />
            <Divider />
            <ListItemButton
              component="a"
              onClick={() => {
                toggleNavMenu();
                router.push("/dashboard");
              }}
            >
              <ListItemText primary="Dashboard" />
            </ListItemButton>
            <ListItemButton
              component="a"
              onClick={() => {
                toggleNavMenu();
                router.push("/create");
              }}
            >
              <ListItemText primary="Create a Guild" />
            </ListItemButton>
            <ListItemButton
              component="a"
              onClick={() => {
                toggleNavMenu();
                router.push("/subscribe");
              }}
            >
              <ListItemText primary="Subscribe to a Guild" />
            </ListItemButton>
          </List>
        </Container>
      </SwipeableDrawer>
    </React.Fragment>
  );
};

export default NavMenu;
