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
  multiple = false,
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
      slotProps={
        multiple
          ? {
              select: {
                multiple: true,
                renderValue: (selected) =>
                  options
                    .filter((option) => selected.includes(option.value))
                    .map((option) => option.label)
                    .join(", "),
              },
            }
          : undefined
      }
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