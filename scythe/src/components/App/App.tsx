import { SnackbarProvider } from "notistack";
import React from "react";
import { useDarkModeManager } from "../../state/user/hooks";
import UserUpdater from "../../state/user/updater";
import AuthUpdater from "../../state/authentication/updater";
import DiscordUpdater from "../../state/discord/updater";
import PaymentsUpdater from "../../state/payments/updater";
import Footer from "../Footer";
import Header from "../Header";
import { SnackbarUtilsConfigurator } from "../../utils/SnackbarUtils";
import { DEFAULT_DISMISS_MS } from "../../constants/misc";

function Updaters() {
  return (
    <React.Fragment>
      <UserUpdater />
      <AuthUpdater />
      <DiscordUpdater />
      <PaymentsUpdater />
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
        autoHideDuration={DEFAULT_DISMISS_MS}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <SnackbarUtilsConfigurator />
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
