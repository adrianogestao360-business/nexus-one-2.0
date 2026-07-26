const CompraService = require("../services/CompraService");

class CompraController {
  async index(req, res) {
    const compras = await CompraService.listar(req.usuario.empresaId);

    return res.json(compras);
  }

  async show(req, res) {
    const compra = await CompraService.buscarPorId(
      Number(req.params.id),
      req.usuario.empresaId,
    );

    return res.json(compra);
  }

  async store(req, res) {
    const compra = await CompraService.criar(req.body, req.usuario.empresaId);

    return res.status(201).json(compra);
  }

  async destroy(req, res) {
    await CompraService.cancelar(
      Number(req.params.id),
      req.usuario.empresaId,
    );

    return res.status(204).send();
  }
}

module.exports = new CompraController();
