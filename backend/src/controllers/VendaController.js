const VendaService = require("../services/VendaService");
const AuditoriaService = require("../services/AuditoriaService");

class VendaController {
  async index(req, res) {
    const vendas = await VendaService.listar(req.usuario.empresaId, {
      status: req.query.status,
      dataInicio: req.query.dataInicio,
      dataFim: req.query.dataFim,
    });

    return res.json(vendas);
  }

  async show(req, res) {
    const venda = await VendaService.buscarPorId(
      Number(req.params.id),
      req.usuario.empresaId,
    );

    return res.json(venda);
  }

  async store(req, res) {
    const venda = await VendaService.criar(
      req.body,
      req.usuario.empresaId,
      req.usuario.sub,
    );

    await AuditoriaService.registrar({
      empresaId: req.usuario.empresaId,
      usuarioId: req.usuario.sub,
      acao: "venda.criar",
      entidade: "Venda",
      entidadeId: venda.id,
      detalhes: { total: venda.total, clienteId: venda.clienteId },
      ip: req.ip,
    });

    return res.status(201).json(venda);
  }

  async destroy(req, res) {
    const id = Number(req.params.id);

    await VendaService.cancelar(id, req.usuario.empresaId);

    await AuditoriaService.registrar({
      empresaId: req.usuario.empresaId,
      usuarioId: req.usuario.sub,
      acao: "venda.cancelar",
      entidade: "Venda",
      entidadeId: id,
      ip: req.ip,
    });

    return res.status(204).send();
  }
}

module.exports = new VendaController();
