import { Box, Typography } from "@mui/material";

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        py: 2,
        textAlign: "center",
        borderTop: "1px solid #E5E7EB",
        bgcolor: "#FFFFFF",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        © 2026 Nexus One ERP
      </Typography>
    </Box>
  );
}

export default Footer;