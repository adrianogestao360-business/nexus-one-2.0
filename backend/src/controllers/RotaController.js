const RotaService = require("../services/RotaService");

class RotaController {
  async index(req, res) {
    const rotas = await RotaService.listar(req.usuario.empresaId, req.query.status);

    return res.json(rotas);
  }

  async show(req, res) {
    const rota = await RotaService.buscarPorId(
      Number(req.params.id),
      req.usuario.empresaId,
    );

    return res.json(rota);
  }

  async store(req, res) {
    const rota = await RotaService.criar(req.body, req.usuario.empresaId);

    return res.status(201).json(rota);
  }

  async concluir(req, res) {
    const rota = await RotaService.concluir(
      Number(req.params.id),
      req.usuario.empresaId,
    );

    return res.json(rota);
  }
}

module.exports = new RotaController();
