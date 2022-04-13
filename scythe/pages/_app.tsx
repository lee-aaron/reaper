import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import { AuthProvider } from "../src/auth";
import App from "../src/components/App";
import store from "../src/state";
import ThemeProvider from "../src/theme";
import "../styles/globals.css";

const persistor = persistStore(store);

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <AuthProvider>
            <App>
              <Component {...pageProps} />
            </App>
          </AuthProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}

export default MyApp;
