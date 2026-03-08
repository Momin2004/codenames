import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import App from "./src/App";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { theme } from "./src/utils/theme";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <ConvexProvider client={convex}>
        <BrowserRouter>
          <CssBaseline />
          <App />
        </BrowserRouter>
      </ConvexProvider>
    </ThemeProvider>
  </React.StrictMode>
);