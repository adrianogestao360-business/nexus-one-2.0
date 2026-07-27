import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#3B82F6",
    },
    secondary: {
      main: "#7C3AED",
    },
    success: {
      main: "#22C55E",
    },
    warning: {
      main: "#F59E0B",
    },
    error: {
      main: "#EF4444",
    },
    info: {
      main: "#38BDF8",
    },
    background: {
      default: "#0B1220",
      paper: "#141B2D",
    },
    text: {
      primary: "#F1F5F9",
      secondary: "#94A3B8",
    },
    divider: "rgba(148, 163, 184, 0.14)",
  },

  typography: {
    fontFamily: "Inter, Roboto, Arial, sans-serif",
  },

  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid rgba(148, 163, 184, 0.14)",
          boxShadow: "0 10px 30px rgba(2, 6, 23, 0.45)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          boxShadow: "0 10px 30px rgba(2, 6, 23, 0.35)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});

export default theme;
