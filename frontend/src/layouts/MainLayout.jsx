import { Box, Toolbar } from "@mui/material";
import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

function MainLayout({ children }) {
  return (
    <Box sx={{ display: "flex" }}>
      <Header />

      <Sidebar />

      <Box
        component="main"
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          bgcolor: "#F8FAFC",
          minHeight: "100vh",
        }}
      >
        <Toolbar />

        <Box sx={{ flexGrow: 1, p: 3 }}>
          {children}
        </Box>

        <Footer />
      </Box>
    </Box>
  );
}

export default MainLayout;