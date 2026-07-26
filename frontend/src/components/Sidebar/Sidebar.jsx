import {
  Drawer,
  Toolbar,
  Typography,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
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
} from "@mui/icons-material";

import { useNavigate, useLocation } from "react-router-dom";

const drawerWidth = 260;

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menus = [
    { text: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
    { text: "Empresas", icon: <Business />, path: "/empresas" },
    { text: "Usuários", icon: <People />, path: "/usuarios" },
    { text: "Clientes", icon: <Groups />, path: "/clientes" },
    { text: "Fornecedores", icon: <LocalMall />, path: "/fornecedores" },
    { text: "Produtos", icon: <Inventory2 />, path: "/produtos" },
    { text: "Vendas", icon: <PointOfSale />, path: "/vendas" },
    { text: "Compras", icon: <ShoppingCart />, path: "/compras" },
    { text: "Financeiro", icon: <Payments />, path: "/financeiro" },
    { text: "Estoque", icon: <Inventory />, path: "/estoque" },
    { text: "WMS", icon: <Warehouse />, path: "/wms" },
    { text: "Transportes", icon: <LocalShipping />, path: "/transportes" },
    { text: "Relatórios", icon: <Assessment />, path: "/relatorios" },
    { text: "Configurações", icon: <Settings />, path: "/configuracoes" },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "#0F172A",
          color: "#FFFFFF",
        },
      }}
    >
      <Toolbar>
        <Typography variant="h6" fontWeight="bold">
          Nexus One ERP
        </Typography>
      </Toolbar>

      <Box sx={{ mt: 2 }}>
        <List>
          {menus.map((menu) => (
            <ListItemButton
              key={menu.path}
              selected={location.pathname === menu.path}
              onClick={() => navigate(menu.path)}
            >
              <ListItemIcon sx={{ color: "#FFF" }}>
                {menu.icon}
              </ListItemIcon>

              <ListItemText primary={menu.text} />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}

export default Sidebar;