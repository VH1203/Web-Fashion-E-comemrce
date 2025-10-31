import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./assets/styles/global.css";
import {ToastProvider} from "./components/common/ToastProvider";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import theme from "./theme";
import CssBaseline from "@mui/material/CssBaseline";

// const theme = createTheme({
//   palette: {
//     primary: {
//       light: "#a5d8ff",
//       main:  "#74c0fc",   // xanh da trời nhạt (main)
//       dark:  "#4dabf7",
//       contrastText: "#0b2b45"
//     },
//   },
// });
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ToastProvider>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            <AuthProvider>
              <App />
            </AuthProvider>
          </BrowserRouter>
        </ThemeProvider>
      </StyledEngineProvider>
    </ToastProvider>
  </React.StrictMode>
);
