import { Button } from "@mui/material";

function BaseButton({
  children,
  variant = "contained",
  color = "primary",
  startIcon,
  endIcon,
  onClick,
  type = "button",
  disabled = false,
  fullWidth = false,
}) {
  return (
    <Button
      variant={variant}
      color={color}
      startIcon={startIcon}
      endIcon={endIcon}
      onClick={onClick}
      type={type}
      disabled={disabled}
      fullWidth={fullWidth}
      sx={{
        borderRadius: 2,
        textTransform: "none",
        fontWeight: 600,
        height: 40,
      }}
    >
      {children}
    </Button>
  );
}

export default BaseButton;