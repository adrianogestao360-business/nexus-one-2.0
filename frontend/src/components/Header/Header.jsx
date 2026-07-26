import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const drawerWidth = 260;

function Header() {
  const navigate = useNavigate();

  const {
    user,
    signOut,
  } = useAuth();

  function handleLogout() {
    signOut();
    navigate("/", { replace: true });
  }

  return (
    <AppBar
      position="fixed"
      elevation={1}
      sx={{
        width: `calc(100% - ${drawerWidth}px)`,
        ml: `${drawerWidth}px`,
        bgcolor: "#FFFFFF",
        color: "#111827",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Typography
          variant="h6"
          fontWeight={600}
        >
          Dashboard
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 3,
          }}
        >
          <Box sx={{ textAlign: "right" }}>
            <Typography
              variant="body1"
              fontWeight={600}
            >
              {user?.name}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
            >
              {user?.email}
            </Typography>
          </Box>

          <Button
            variant="outlined"
            onClick={handleLogout}
          >
            Sair
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;