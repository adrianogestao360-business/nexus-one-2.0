import {
  Card,
  CardContent,
  Typography,
  Box,
} from "@mui/material";

function CardStat({
  title,
  value,
  icon,
}) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid #E5E7EB",
        transition: "0.25s",
        cursor: "pointer",

        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 10px 25px rgba(0,0,0,.08)",
        },
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 3,
        }}
      >
        <Box>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {title}
          </Typography>

          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ mt: 1 }}
          >
            {value}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "#EEF4FF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#2563EB",
          }}
        >
          {icon}
        </Box>
      </CardContent>
    </Card>
  );
}

export default CardStat;