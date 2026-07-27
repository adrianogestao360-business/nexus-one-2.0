const MetaVendaService = require("../services/MetaVendaService");

class MetaVendaController {
  async index(req, res) {
    const metas = await MetaVendaService.listar(req.usuario.empresaId);

    return res.json(metas);
  }

  async store(req, res) {
    const meta = await MetaVendaService.criar(
      req.body,
      req.usuario.empresaId,
    );

    return res.status(201).json(meta);
  }

  async update(req, res) {
    const meta = await MetaVendaService.atualizar(
      Number(req.params.id),
      req.body,
      req.usuario.empresaId,
    );

    return res.json(meta);
  }

  async destroy(req, res) {
    await MetaVendaService.excluir(
      Number(req.params.id),
      req.usuario.empresaId,
    );

    return res.status(204).send();
  }
}

module.exports = new MetaVendaController();
