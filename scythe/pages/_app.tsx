import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import store from "../src/state";
import ThemeProvider from "../src/theme";
import App from "../src/components/App";

const persistor = persistStore(store);

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <App>
            <Component {...pageProps} />
          </App>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}

export default MyApp;
