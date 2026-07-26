const VendaService = require("../services/VendaService");

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
    const venda = await VendaService.criar(req.body, req.usuario.empresaId);

    return res.status(201).json(venda);
  }

  async destroy(req, res) {
    await VendaService.cancelar(
      Number(req.params.id),
      req.usuario.empresaId,
    );

    return res.status(204).send();
  }
}

module.exports = new VendaController();
