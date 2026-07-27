import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Empresas from "../modules/empresas/pages/Empresas";
import Usuarios from "../modules/usuarios/pages/Usuarios";
import Clientes from "../modules/clientes/pages/Clientes";
import Fornecedores from "../modules/fornecedores/pages/Fornecedores";
import Produtos from "../modules/produtos/pages/Produtos";
import Vendas from "../modules/vendas/pages/Vendas";
import Compras from "../modules/compras/pages/Compras";
import Financeiro from "../modules/financeiro/pages/Financeiro";
import Estoque from "../modules/estoque/pages/Estoque";
import WMS from "../modules/wms/pages/WMS";
import Transportes from "../modules/frota/pages/Transportes";
import Configuracoes from "../modules/configuracoes/pages/Configuracoes";
import Relatorios from "../modules/relatorios/pages/Relatorios";
import CRM from "../modules/crm/pages/CRM";
import Auditoria from "../modules/auditoria/pages/Auditoria";
import Rastreio from "../pages/Rastreio/Rastreio";

import PrivateRoute from "./PrivateRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/rastreio/:token" element={<Rastreio />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/empresas"
          element={
            <PrivateRoute>
              <Empresas />
            </PrivateRoute>
          }
        />

        <Route
          path="/usuarios"
          element={
            <PrivateRoute>
              <Usuarios />
            </PrivateRoute>
          }
        />

        <Route
          path="/clientes"
          element={
            <PrivateRoute>
              <Clientes />
            </PrivateRoute>
          }
        />

        <Route
          path="/fornecedores"
          element={
            <PrivateRoute>
              <Fornecedores />
            </PrivateRoute>
          }
        />

        <Route
          path="/produtos"
          element={
            <PrivateRoute>
              <Produtos />
            </PrivateRoute>
          }
        />

        <Route
          path="/vendas"
          element={
            <PrivateRoute>
              <Vendas />
            </PrivateRoute>
          }
        />

        <Route
          path="/compras"
          element={
            <PrivateRoute>
              <Compras />
            </PrivateRoute>
          }
        />

        <Route
          path="/financeiro"
          element={
            <PrivateRoute>
              <Financeiro />
            </PrivateRoute>
          }
        />

        <Route
          path="/estoque"
          element={
            <PrivateRoute>
              <Estoque />
            </PrivateRoute>
          }
        />

        <Route
          path="/wms"
          element={
            <PrivateRoute>
              <WMS />
            </PrivateRoute>
          }
        />

        <Route
          path="/transportes"
          element={
            <PrivateRoute>
              <Transportes />
            </PrivateRoute>
          }
        />

        <Route
          path="/configuracoes"
          element={
            <PrivateRoute>
              <Configuracoes />
            </PrivateRoute>
          }
        />

        <Route
          path="/relatorios"
          element={
            <PrivateRoute>
              <Relatorios />
            </PrivateRoute>
          }
        />

        <Route
          path="/crm"
          element={
            <PrivateRoute>
              <CRM />
            </PrivateRoute>
          }
        />

        <Route
          path="/auditoria"
          element={
            <PrivateRoute>
              <Auditoria />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;