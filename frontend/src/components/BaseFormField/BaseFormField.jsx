import { TextField } from "@mui/material";

function BaseFormField({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  disabled = false,
  ...props
}) {
  return (
    <TextField
      fullWidth
      label={label}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      variant="outlined"
      size="small"
      {...props}
    />
  );
}

export default BaseFormField;