import {
  Drawer,
  Toolbar,
  Typography,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";

import {
  Dashboard,
  Business,
  Inventory,
  Inventory2,
  Warehouse,
  LocalShipping,
  People,
  Groups,
  Settings,
  LocalMall,
  PointOfSale,
  ShoppingCart,
  Payments,
  Assessment,
  Handshake,
  History,
  Badge,
  TrackChanges,
} from "@mui/icons-material";

import { useNavigate, useLocation } from "react-router-dom";

const drawerWidth = 260;

const grupos = [
  {
    titulo: "Operação",
    itens: [
      { text: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
      { text: "CRM", icon: <Handshake />, path: "/crm" },
      { text: "Clientes", icon: <Groups />, path: "/clientes" },
      { text: "Vendas", icon: <PointOfSale />, path: "/vendas" },
      { text: "Compras", icon: <ShoppingCart />, path: "/compras" },
      { text: "Fornecedores", icon: <LocalMall />, path: "/fornecedores" },
      { text: "Produtos", icon: <Inventory2 />, path: "/produtos" },
    ],
  },
  {
    titulo: "Logística",
    itens: [
      { text: "Estoque", icon: <Inventory />, path: "/estoque" },
      { text: "WMS", icon: <Warehouse />, path: "/wms" },
      { text: "Transportes", icon: <LocalShipping />, path: "/transportes" },
    ],
  },
  {
    titulo: "Gestão",
    itens: [
      { text: "Financeiro", icon: <Payments />, path: "/financeiro" },
      { text: "RH", icon: <Badge />, path: "/rh" },
      { text: "Metas", icon: <TrackChanges />, path: "/metas" },
      { text: "Relatórios", icon: <Assessment />, path: "/relatorios" },
      { text: "Auditoria", icon: <History />, path: "/auditoria" },
      { text: "Usuários", icon: <People />, path: "/usuarios" },
      { text: "Empresas", icon: <Business />, path: "/empresas" },
      { text: "Configurações", icon: <Settings />, path: "/configuracoes" },
    ],
  },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "#0B1220",
          borderRight: "1px solid rgba(148, 163, 184, 0.14)",
          color: "#F1F5F9",
        },
      }}
    >
      <Toolbar>
        <Typography variant="h6" fontWeight="bold">
          Nexus One ERP
        </Typography>
      </Toolbar>

      <Box sx={{ mt: 1, overflowY: "auto" }}>
        {grupos.map((grupo, index) => (
          <Box key={grupo.titulo} sx={{ mb: 1 }}>
            {index > 0 && (
              <Divider sx={{ borderColor: "rgba(148, 163, 184, 0.14)", my: 1 }} />
            )}

            <Typography
              variant="overline"
              sx={{
                px: 2,
                color: "#64748B",
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              {grupo.titulo}
            </Typography>

            <List dense>
              {grupo.itens.map((menu) => {
                const ativo = location.pathname === menu.path;

                return (
                  <ListItemButton
                    key={menu.path}
                    selected={ativo}
                    onClick={() => navigate(menu.path)}
                    sx={{
                      mx: 1,
                      borderRadius: 2,
                      color: ativo ? "#F1F5F9" : "#94A3B8",
                      "&.Mui-selected": {
                        backgroundColor: "rgba(59, 130, 246, 0.16)",
                        color: "#F1F5F9",
                      },
                      "&.Mui-selected:hover": {
                        backgroundColor: "rgba(59, 130, 246, 0.22)",
                      },
                      "&:hover": {
                        backgroundColor: "rgba(148, 163, 184, 0.08)",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{ color: ativo ? "#3B82F6" : "#64748B", minWidth: 36 }}
                    >
                      {menu.icon}
                    </ListItemIcon>

                    <ListItemText primary={menu.text} />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>
    </Drawer>
  );
}

export default Sidebar;
