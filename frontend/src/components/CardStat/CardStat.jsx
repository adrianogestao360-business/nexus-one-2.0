import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";

const CORES = {
  primary: { bg: "rgba(59, 130, 246, 0.16)", fg: "#3B82F6" },
  secondary: { bg: "rgba(124, 58, 237, 0.16)", fg: "#A78BFA" },
  success: { bg: "rgba(34, 197, 94, 0.16)", fg: "#22C55E" },
  warning: { bg: "rgba(245, 158, 11, 0.16)", fg: "#F59E0B" },
};

function CardStat({
  title,
  value,
  icon,
  color = "primary",
  trend,
  variacao,
}) {
  const cor = CORES[color] || CORES.primary;
  const variacaoPositiva = Number(variacao) >= 0;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        transition: "0.25s",
        cursor: "default",

        "&:hover": {
          transform: "translateY(-3px)",
        },
      }}
    >
      <CardContent sx={{ py: 1.75, px: 2, "&:last-child": { pb: 1.75 } }}>
        <Stack
          direction="row"
          sx={{ justifyContent: "space-between", alignItems: "center" }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary">
              {title}
            </Typography>

            <Typography variant="h5" fontWeight={700} sx={{ mt: 0.25 }}>
              {value}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: cor.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: cor.fg,
            }}
          >
            {icon}
          </Box>
        </Stack>

        {(trend || variacao !== undefined) && (
          <Stack
            direction="row"
            sx={{ alignItems: "center", mt: 1, gap: 0.75 }}
          >
            {variacao !== undefined && (
              <Stack
                direction="row"
                sx={{
                  alignItems: "center",
                  color: variacaoPositiva ? "success.main" : "error.main",
                }}
              >
                {variacaoPositiva ? (
                  <ArrowUpwardIcon sx={{ fontSize: 14 }} />
                ) : (
                  <ArrowDownwardIcon sx={{ fontSize: 14 }} />
                )}
                <Typography variant="caption" fontWeight={600}>
                  {Math.abs(Number(variacao)).toFixed(1)}%
                </Typography>
              </Stack>
            )}

            <Typography variant="caption" color="text.secondary" noWrap>
              vs ontem
            </Typography>

            {trend && (
              <Box sx={{ flexGrow: 1, height: 24, ml: 0.5 }}>
                <SparkLineChart
                  data={trend}
                  height={24}
                  color={cor.fg}
                  showTooltip={false}
                  showHighlight={false}
                />
              </Box>
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

export default CardStat;
