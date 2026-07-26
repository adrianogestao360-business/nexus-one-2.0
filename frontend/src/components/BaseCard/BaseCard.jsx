import { Card, CardContent } from "@mui/material";

function BaseCard({
  children,
  sx = {},
}) {
  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid #E5E7EB",
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