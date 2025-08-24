import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AppProvider } from "./context/AppContext.tsx";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { WEB_APP_URL } from "./constants/index.ts";

const Ton_Manifest_Url = `${WEB_APP_URL}/tonconnect-manifest.json`;
// alert(Ton_Manifest_Url);
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <TonConnectUIProvider manifestUrl={Ton_Manifest_Url}>
      <AppProvider>
        <App />
      </AppProvider>
    </TonConnectUIProvider>
  </React.StrictMode>
);
