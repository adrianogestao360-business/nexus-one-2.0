const DevolucaoService = require("../services/DevolucaoService");
const AuditoriaService = require("../services/AuditoriaService");

class DevolucaoController {
  async index(req, res) {
    const devolucoes = await DevolucaoService.listar(req.usuario.empresaId);

    return res.json(devolucoes);
  }

  async storeVenda(req, res) {
    const devolucao = await DevolucaoService.criarDevolucaoVenda(
      Number(req.params.id),
      req.body,
      req.usuario.empresaId,
    );

    await AuditoriaService.registrar({
      empresaId: req.usuario.empresaId,
      usuarioId: req.usuario.sub,
      acao: "devolucao.venda.criar",
      entidade: "Devolucao",
      entidadeId: devolucao.id,
      detalhes: { vendaId: Number(req.params.id), valorTotal: devolucao.valorTotal },
      ip: req.ip,
    });

    return res.status(201).json(devolucao);
  }

  async storeCompra(req, res) {
    const devolucao = await DevolucaoService.criarDevolucaoCompra(
      Number(req.params.id),
      req.body,
      req.usuario.empresaId,
    );

    await AuditoriaService.registrar({
      empresaId: req.usuario.empresaId,
      usuarioId: req.usuario.sub,
      acao: "devolucao.compra.criar",
      entidade: "Devolucao",
      entidadeId: devolucao.id,
      detalhes: { compraId: Number(req.params.id), valorTotal: devolucao.valorTotal },
      ip: req.ip,
    });

    return res.status(201).json(devolucao);
  }
}

module.exports = new DevolucaoController();
