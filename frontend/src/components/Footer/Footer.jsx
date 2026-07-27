import { Box, Typography } from "@mui/material";

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        py: 2,
        textAlign: "center",
        borderTop: "1px solid rgba(148, 163, 184, 0.14)",
        bgcolor: "#0B1220",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        © 2026 Nexus One ERP
      </Typography>
    </Box>
  );
}

export default Footer;