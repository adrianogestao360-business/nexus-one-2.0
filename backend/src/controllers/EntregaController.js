const EntregaService = require("../services/EntregaService");

class EntregaController {
  async index(req, res) {
    const entregas = await EntregaService.listar(
      req.usuario.empresaId,
      req.query.status,
    );

    return res.json(entregas);
  }

  async show(req, res) {
    const entrega = await EntregaService.buscarPorId(
      Number(req.params.id),
      req.usuario.empresaId,
    );

    return res.json(entrega);
  }

  async confirmar(req, res) {
    const entrega = await EntregaService.confirmar(
      Number(req.params.id),
      req.usuario.empresaId,
    );

    return res.json(entrega);
  }
}

module.exports = new EntregaController();
