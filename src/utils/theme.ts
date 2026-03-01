import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#44A194",
    },
    secondary: {
      main: "#9db8b5",
    },
    background: {
      default: "#121212",
      paper: "#1E1E1E",
    },
    success: {
      main: "#22C55E",
    },
    error: {
      main: "#efb4b3",
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: `"Roboto", "Helvetica", "Arial", sans-serif`,
    h4: {
      fontWeight: 700,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
});