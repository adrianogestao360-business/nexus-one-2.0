const express = require("express");

const AuthController = require("../controllers/AuthController");
const EmpresaController = require("../controllers/EmpresaController");
const UsuarioController = require("../controllers/UsuarioController");
const PapelController = require("../controllers/PapelController");
const ProdutoController = require("../controllers/ProdutoController");
const ClienteController = require("../controllers/ClienteController");
const FornecedorController = require("../controllers/FornecedorController");
const VendaController = require("../controllers/VendaController");
const CompraController = require("../controllers/CompraController");
const TituloController = require("../controllers/TituloController");
const MovimentoEstoqueController = require("../controllers/MovimentoEstoqueController");
const ZonaController = require("../controllers/ZonaController");
const LocalizacaoController = require("../controllers/LocalizacaoController");
const EstoqueLocalizacaoController = require("../controllers/EstoqueLocalizacaoController");
const SeparacaoController = require("../controllers/SeparacaoController");
const VeiculoController = require("../controllers/VeiculoController");
const MotoristaController = require("../controllers/MotoristaController");
const PermissaoController = require("../controllers/PermissaoController");
const EntregaController = require("../controllers/EntregaController");
const NotaFiscalController = require("../controllers/NotaFiscalController");
const DashboardController = require("../controllers/DashboardController");

const AuthMiddleware = require("../middlewares/AuthMiddleware");
const PermissionMiddleware = require("../middlewares/PermissionMiddleware");

const router = express.Router();

router.get("/", (req, res) => {
  return res.json({
    sistema: "Nexus One ERP API",
    status: "online",
    versao: "1.0.0",
  });
});

router.post("/auth/login", AuthController.login);
router.post("/auth/refresh", AuthController.refresh);
router.post("/auth/logout", AuthController.logout);

router.get("/dashboard", AuthMiddleware.handle, DashboardController.index);

router.get("/empresas", AuthMiddleware.handle, EmpresaController.index);
router.get("/empresas/:id", AuthMiddleware.handle, EmpresaController.show);
router.post(
  "/empresas",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("empresas.gerenciar"),
  EmpresaController.store,
);
router.put(
  "/empresas/:id",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("empresas.gerenciar"),
  EmpresaController.update,
);
router.delete(
  "/empresas/:id",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("empresas.gerenciar"),
  EmpresaController.destroy,
);

router.get("/usuarios", AuthMiddleware.handle, UsuarioController.index);
router.get("/usuarios/:id", AuthMiddleware.handle, UsuarioController.show);
router.post(
  "/usuarios",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("usuarios.gerenciar"),
  UsuarioController.store,
);
router.put(
  "/usuarios/:id",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("usuarios.gerenciar"),
  UsuarioController.update,
);
router.delete(
  "/usuarios/:id",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("usuarios.gerenciar"),
  UsuarioController.destroy,
);

router.put(
  "/minha-conta/senha",
  AuthMiddleware.handle,
  UsuarioController.trocarSenha,
);

router.get("/papeis", AuthMiddleware.handle, PapelController.index);
router.get("/papeis/:id", AuthMiddleware.handle, PapelController.show);
router.post(
  "/papeis",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("papeis.gerenciar"),
  PapelController.store,
);
router.put(
  "/papeis/:id",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("papeis.gerenciar"),
  PapelController.update,
);
router.put(
  "/papeis/:id/permissoes",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("papeis.gerenciar"),
  PapelController.definirPermissoes,
);

router.get("/permissoes", AuthMiddleware.handle, PermissaoController.index);

router.get("/produtos", AuthMiddleware.handle, ProdutoController.index);
router.get("/produtos/:id", AuthMiddleware.handle, ProdutoController.show);
router.post(
  "/produtos",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("produtos.gerenciar"),
  ProdutoController.store,
);
router.put(
  "/produtos/:id",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("produtos.gerenciar"),
  ProdutoController.update,
);
router.delete(
  "/produtos/:id",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("produtos.gerenciar"),
  ProdutoController.destroy,
);

router.get("/clientes", AuthMiddleware.handle, ClienteController.index);
router.get("/clientes/:id", AuthMiddleware.handle, ClienteController.show);
router.post(
  "/clientes",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("clientes.gerenciar"),
  ClienteController.store,
);
router.put(
  "/clientes/:id",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("clientes.gerenciar"),
  ClienteController.update,
);
router.delete(
  "/clientes/:id",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("clientes.gerenciar"),
  ClienteController.destroy,
);

router.get(
  "/fornecedores",
  AuthMiddleware.handle,
  FornecedorController.index,
);
router.get(
  "/fornecedores/:id",
  AuthMiddleware.handle,
  FornecedorController.show,
);
router.post(
  "/fornecedores",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("fornecedores.gerenciar"),
  FornecedorController.store,
);
router.put(
  "/fornecedores/:id",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("fornecedores.gerenciar"),
  FornecedorController.update,
);
router.delete(
  "/fornecedores/:id",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("fornecedores.gerenciar"),
  FornecedorController.destroy,
);

router.get("/vendas", AuthMiddleware.handle, VendaController.index);
router.get("/vendas/:id", AuthMiddleware.handle, VendaController.show);
router.post(
  "/vendas",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("vendas.gerenciar"),
  VendaController.store,
);
router.delete(
  "/vendas/:id",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("vendas.gerenciar"),
  VendaController.destroy,
);

router.get("/compras", AuthMiddleware.handle, CompraController.index);
router.get("/compras/:id", AuthMiddleware.handle, CompraController.show);
router.post(
  "/compras",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("compras.gerenciar"),
  CompraController.store,
);
router.delete(
  "/compras/:id",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("compras.gerenciar"),
  CompraController.destroy,
);

router.get("/titulos", AuthMiddleware.handle, TituloController.index);
router.get("/titulos/:id", AuthMiddleware.handle, TituloController.show);
router.post(
  "/titulos",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("financeiro.gerenciar"),
  TituloController.store,
);
router.patch(
  "/titulos/:id/baixar",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("financeiro.gerenciar"),
  TituloController.baixar,
);
router.delete(
  "/titulos/:id",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("financeiro.gerenciar"),
  TituloController.destroy,
);

router.get(
  "/movimentos-estoque",
  AuthMiddleware.handle,
  MovimentoEstoqueController.index,
);
router.post(
  "/movimentos-estoque",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("estoque.gerenciar"),
  MovimentoEstoqueController.store,
);

router.get("/zonas", AuthMiddleware.handle, ZonaController.index);
router.post(
  "/zonas",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("wms.gerenciar"),
  ZonaController.store,
);

router.get(
  "/localizacoes",
  AuthMiddleware.handle,
  LocalizacaoController.index,
);
router.post(
  "/localizacoes",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("wms.gerenciar"),
  LocalizacaoController.store,
);

router.get(
  "/estoque-localizacoes",
  AuthMiddleware.handle,
  EstoqueLocalizacaoController.index,
);

router.get("/separacoes", AuthMiddleware.handle, SeparacaoController.index);
router.get(
  "/separacoes/:id",
  AuthMiddleware.handle,
  SeparacaoController.show,
);
router.post(
  "/separacoes/:id/assumir",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("wms.gerenciar"),
  SeparacaoController.assumir,
);
router.post(
  "/separacoes/:id/liberar",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("wms.gerenciar"),
  SeparacaoController.liberar,
);
router.patch(
  "/separacoes/:id/itens/:itemId",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("wms.gerenciar"),
  SeparacaoController.marcarItem,
);
router.post(
  "/separacoes/:id/concluir",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("wms.gerenciar"),
  SeparacaoController.concluir,
);
router.post(
  "/separacoes/:id/expedir",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("wms.gerenciar"),
  SeparacaoController.expedir,
);

router.get("/veiculos", AuthMiddleware.handle, VeiculoController.index);
router.get("/veiculos/:id", AuthMiddleware.handle, VeiculoController.show);
router.post(
  "/veiculos",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("frota.gerenciar"),
  VeiculoController.store,
);
router.put(
  "/veiculos/:id",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("frota.gerenciar"),
  VeiculoController.update,
);
router.delete(
  "/veiculos/:id",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("frota.gerenciar"),
  VeiculoController.destroy,
);

router.get("/motoristas", AuthMiddleware.handle, MotoristaController.index);
router.get(
  "/motoristas/:id",
  AuthMiddleware.handle,
  MotoristaController.show,
);
router.post(
  "/motoristas",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("frota.gerenciar"),
  MotoristaController.store,
);
router.put(
  "/motoristas/:id",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("frota.gerenciar"),
  MotoristaController.update,
);
router.delete(
  "/motoristas/:id",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("frota.gerenciar"),
  MotoristaController.destroy,
);

router.get("/entregas", AuthMiddleware.handle, EntregaController.index);
router.get("/entregas/:id", AuthMiddleware.handle, EntregaController.show);
router.post(
  "/entregas/:id/confirmar",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("frota.gerenciar"),
  EntregaController.confirmar,
);

router.get(
  "/notas-fiscais",
  AuthMiddleware.handle,
  NotaFiscalController.index,
);
router.get(
  "/notas-fiscais/:id",
  AuthMiddleware.handle,
  NotaFiscalController.show,
);
router.post(
  "/notas-fiscais/:id/emitir",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("notas-fiscais.gerenciar"),
  NotaFiscalController.emitir,
);
router.post(
  "/notas-fiscais/:id/cancelar",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("notas-fiscais.gerenciar"),
  NotaFiscalController.cancelar,
);

module.exports = router;
