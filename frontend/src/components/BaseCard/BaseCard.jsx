import { Card, CardContent } from "@mui/material";

function BaseCard({
  children,
  sx = {},
}) {
  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid rgba(148, 163, 184, 0.14)",
        borderRadius: 3,
        ...sx,
      }}
    >
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}

export default BaseCard;