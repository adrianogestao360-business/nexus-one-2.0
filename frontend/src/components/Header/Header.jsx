import { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Select,
  MenuItem,
} from "@mui/material";

import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import NotificacaoBell from "../NotificacaoBell/NotificacaoBell";

const drawerWidth = 260;

const TITULOS_POR_ROTA = {
  "/dashboard": "Dashboard",
  "/crm": "CRM",
  "/clientes": "Clientes",
  "/vendas": "Vendas",
  "/compras": "Compras",
  "/fornecedores": "Fornecedores",
  "/produtos": "Produtos",
  "/estoque": "Estoque",
  "/wms": "WMS",
  "/transportes": "Transportes",
  "/financeiro": "Financeiro",
  "/rh": "RH",
  "/metas": "Metas",
  "/relatorios": "Relatórios",
  "/auditoria": "Auditoria",
  "/usuarios": "Usuários",
  "/empresas": "Empresas",
  "/configuracoes": "Configurações",
};

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const titulo = TITULOS_POR_ROTA[location.pathname] || "Dashboard";

  const {
    user,
    signOut,
    listarEmpresasDisponiveis,
    trocarEmpresa,
  } = useAuth();

  const [empresas, setEmpresas] = useState([]);
  const [trocando, setTrocando] = useState(false);

  useEffect(() => {
    listarEmpresasDisponiveis()
      .then(setEmpresas)
      .catch((error) =>
        console.error("Erro ao carregar empresas disponíveis:", error),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleLogout() {
    signOut();
    navigate("/", { replace: true });
  }

  async function handleTrocarEmpresa(event) {
    const novaEmpresaId = Number(event.target.value);

    setTrocando(true);

    try {
      await trocarEmpresa(novaEmpresaId);
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Erro ao trocar de empresa:", error);
      setTrocando(false);
    }
  }

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: `calc(100% - ${drawerWidth}px)`,
        ml: `${drawerWidth}px`,
        bgcolor: "#141B2D",
        color: "#F1F5F9",
        borderBottom: "1px solid rgba(148, 163, 184, 0.14)",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Typography
          variant="h6"
          fontWeight={600}
        >
          {titulo}
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 3,
          }}
        >
          {empresas.length > 1 && (
            <Select
              size="small"
              value={user?.empresaId || ""}
              onChange={handleTrocarEmpresa}
              disabled={trocando}
              sx={{ minWidth: 200 }}
            >
              {empresas.map((empresa) => (
                <MenuItem key={empresa.id} value={empresa.id}>
                  {empresa.nomeFantasia}
                </MenuItem>
              ))}
            </Select>
          )}

          <NotificacaoBell />

          <Box sx={{ textAlign: "right" }}>
            <Typography
              variant="body1"
              fontWeight={600}
            >
              {user?.nome}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
            >
              {user?.email}
            </Typography>
          </Box>

          <Button
            variant="outlined"
            onClick={handleLogout}
          >
            Sair
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;