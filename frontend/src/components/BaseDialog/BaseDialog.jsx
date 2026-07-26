import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

function BaseDialog({
  open,
  onClose,
  onSave,
  title,
  children,
  hideSave = false,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        {title}
      </DialogTitle>

      <DialogContent sx={{ mt: 1 }}>
        {children}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          {hideSave ? "Fechar" : "Cancelar"}
        </Button>

        {!hideSave && (
          <Button
            variant="contained"
            onClick={onSave}
          >
            Salvar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default BaseDialog;