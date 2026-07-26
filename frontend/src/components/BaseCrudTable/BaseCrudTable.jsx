import { DataGrid } from "@mui/x-data-grid";
import { Paper, IconButton, Stack } from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

function BaseCrudTable({
  rows,
  columns,
  onEdit,
  onDelete,
}) {
  const actionColumn = {
    field: "acoes",
    headerName: "Ações",
    width: 120,
    sortable: false,
    filterable: false,

    renderCell: (params) => (
      <Stack direction="row">
        <IconButton
          size="small"
          onClick={() => onEdit(params.row)}
        >
          <EditIcon fontSize="small" />
        </IconButton>

        <IconButton
          size="small"
          color="error"
          onClick={() => onDelete(params.row.id)}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Stack>
    ),
  };

  return (
    <Paper
      elevation={0}
      sx={{
        height: 620,
        borderRadius: 3,
        border: "1px solid #E5E7EB",
        overflow: "hidden",
      }}
    >
      <DataGrid
        rows={rows}
        columns={[...columns, actionColumn]}
        disableRowSelectionOnClick
        pageSizeOptions={[10, 20, 50]}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        sx={{
          border: 0,

          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#F8FAFC",
          },

          "& .MuiDataGrid-row:hover": {
            backgroundColor: "#F8FAFC",
          },
        }}
      />
    </Paper>
  );
}

export default BaseCrudTable;