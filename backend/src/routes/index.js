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
const OportunidadeController = require("../controllers/OportunidadeController");
const AuditoriaController = require("../controllers/AuditoriaController");
const RotaController = require("../controllers/RotaController");
const RastreioController = require("../controllers/RastreioController");
const AbastecimentoController = require("../controllers/AbastecimentoController");
const CargoController = require("../controllers/CargoController");
const FuncionarioController = require("../controllers/FuncionarioController");
const FolhaPagamentoController = require("../controllers/FolhaPagamentoController");
const NotificacaoController = require("../controllers/NotificacaoController");
const MetaVendaController = require("../controllers/MetaVendaController");
const IntegracaoFiscalController = require("../controllers/IntegracaoFiscalController");
const DreController = require("../controllers/DreController");
const DevolucaoController = require("../controllers/DevolucaoController");
const IaController = require("../controllers/IaController");

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
router.get(
  "/auth/minhas-empresas",
  AuthMiddleware.handle,
  AuthController.minhasEmpresas,
);
router.post(
  "/auth/trocar-empresa",
  AuthMiddleware.handle,
  AuthController.trocarEmpresa,
);

router.get("/dashboard", AuthMiddleware.handle, DashboardController.index);

router.get(
  "/auditoria",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("auditoria.visualizar"),
  AuditoriaController.index,
);

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

router.get(
  "/empresas/:id/integracao-fiscal",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("empresas.gerenciar"),
  IntegracaoFiscalController.show,
);
router.put(
  "/empresas/:id/integracao-fiscal",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("empresas.gerenciar"),
  IntegracaoFiscalController.store,
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
router.delete(
  "/papeis/:id",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("papeis.gerenciar"),
  PapelController.destroy,
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
  "/oportunidades",
  AuthMiddleware.handle,
  OportunidadeController.index,
);
router.get(
  "/oportunidades/:id",
  AuthMiddleware.handle,
  OportunidadeController.show,
);
router.post(
  "/oportunidades",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("crm.gerenciar"),
  OportunidadeController.store,
);
router.put(
  "/oportunidades/:id",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("crm.gerenciar"),
  OportunidadeController.update,
);
router.patch(
  "/oportunidades/:id/estagio",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("crm.gerenciar"),
  OportunidadeController.moverEstagio,
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
router.post(
  "/movimentos-estoque/transferir",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("estoque.gerenciar"),
  MovimentoEstoqueController.transferir,
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

router.get(
  "/veiculos/:veiculoId/abastecimentos",
  AuthMiddleware.handle,
  AbastecimentoController.index,
);
router.post(
  "/veiculos/:veiculoId/abastecimentos",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("frota.gerenciar"),
  AbastecimentoController.store,
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

router.get("/rotas", AuthMiddleware.handle, RotaController.index);
router.get("/rotas/:id", AuthMiddleware.handle, RotaController.show);
router.post(
  "/rotas",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("frota.gerenciar"),
  RotaController.store,
);
router.post(
  "/rotas/:id/concluir",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("frota.gerenciar"),
  RotaController.concluir,
);

// Rotas públicas de rastreio — autenticadas pelo token da rota, não por JWT.
// Usadas pela página que o motorista abre no celular (sem login no sistema).
router.get("/rastreio/:token", RastreioController.show);
router.post("/rastreio/:token/posicao", RastreioController.registrarPosicao);
router.post(
  "/rastreio/:token/entregas/:entregaId/confirmar",
  RastreioController.confirmarEntrega,
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
router.post(
  "/notas-fiscais/:id/atualizar-status",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("notas-fiscais.gerenciar"),
  NotaFiscalController.atualizarStatus,
);

router.get("/cargos", AuthMiddleware.handle, CargoController.index);
router.post(
  "/cargos",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("rh.gerenciar"),
  CargoController.store,
);
router.put(
  "/cargos/:id",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("rh.gerenciar"),
  CargoController.update,
);
router.delete(
  "/cargos/:id",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("rh.gerenciar"),
  CargoController.destroy,
);

router.get(
  "/funcionarios",
  AuthMiddleware.handle,
  FuncionarioController.index,
);
router.post(
  "/funcionarios",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("rh.gerenciar"),
  FuncionarioController.store,
);
router.put(
  "/funcionarios/:id",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("rh.gerenciar"),
  FuncionarioController.update,
);
router.delete(
  "/funcionarios/:id",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("rh.gerenciar"),
  FuncionarioController.destroy,
);

router.get(
  "/folhas-pagamento",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("rh.gerenciar"),
  FolhaPagamentoController.index,
);
router.get(
  "/folhas-pagamento/:id",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("rh.gerenciar"),
  FolhaPagamentoController.show,
);
router.post(
  "/folhas-pagamento",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("rh.gerenciar"),
  FolhaPagamentoController.store,
);
router.put(
  "/folhas-pagamento/itens/:itemId",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("rh.gerenciar"),
  FolhaPagamentoController.atualizarItem,
);
router.post(
  "/folhas-pagamento/:id/fechar",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("rh.gerenciar"),
  FolhaPagamentoController.fechar,
);

router.get(
  "/notificacoes",
  AuthMiddleware.handle,
  NotificacaoController.index,
);
router.post(
  "/notificacoes/marcar-lida",
  AuthMiddleware.handle,
  NotificacaoController.marcarComoLida,
);

router.get(
  "/metas-vendas",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("metas.gerenciar"),
  MetaVendaController.index,
);
router.post(
  "/metas-vendas",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("metas.gerenciar"),
  MetaVendaController.store,
);
router.put(
  "/metas-vendas/:id",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("metas.gerenciar"),
  MetaVendaController.update,
);
router.delete(
  "/metas-vendas/:id",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("metas.gerenciar"),
  MetaVendaController.destroy,
);

router.get(
  "/relatorios/dre",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("financeiro.gerenciar"),
  DreController.show,
);

router.get(
  "/devolucoes",
  AuthMiddleware.handle,
  DevolucaoController.index,
);
router.post(
  "/vendas/:id/devolucoes",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("vendas.gerenciar"),
  DevolucaoController.storeVenda,
);
router.post(
  "/compras/:id/devolucoes",
  AuthMiddleware.handle,
  PermissionMiddleware.handle("compras.gerenciar"),
  DevolucaoController.storeCompra,
);

router.get("/ia/resumo", AuthMiddleware.handle, IaController.resumo);
router.post(
  "/ia/plano-de-acao",
  AuthMiddleware.handle,
  IaController.planoDeAcao,
);

module.exports = router;
