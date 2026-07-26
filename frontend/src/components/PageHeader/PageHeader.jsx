import { Box, Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

function PageHeader({
  title,
  subtitle,
  buttonLabel,
  onButtonClick,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 3,
      }}
    >
      <Box>
        <Typography variant="h4" fontWeight={700}>
          {title}
        </Typography>

        {subtitle && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      {buttonLabel && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onButtonClick}
        >
          {buttonLabel}
        </Button>
      )}
    </Box>
  );
}

export default PageHeader;