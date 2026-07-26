import {
  TextField,
  MenuItem,
} from "@mui/material";

function BaseSelect({
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
  disabled = false,
}) {
  return (
    <TextField
      select
      fullWidth
      size="small"
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
    >
      {options.map((option) => (
        <MenuItem
          key={option.value}
          value={option.value}
        >
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}

export default BaseSelect;