import { SnackbarProvider } from "notistack";
import React from "react";
import { useDarkModeManager } from "../../state/user/hooks";
import UserUpdater from "../../state/user/updater";
import AuthUpdater from "../../state/authentication/updater";
import Footer from "../Footer";
import Header from "../Header";

function Updaters() {
  return (
    <React.Fragment>
      <UserUpdater />
      <AuthUpdater />
    </React.Fragment>
  );
}

const App = ({ children }: { children: React.ReactNode }) => {
  const [_, toggleDarkMode] = useDarkModeManager();

  return (
    <React.Fragment>
      <SnackbarProvider
        maxSnack={5}
        preventDuplicate
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Updaters />
        <React.Fragment>
          <Header toggleColorMode={toggleDarkMode} />
          {children}
          <Footer />
        </React.Fragment>
      </SnackbarProvider>
    </React.Fragment>
  );
};

export default App;
