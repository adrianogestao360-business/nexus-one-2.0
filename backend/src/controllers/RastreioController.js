const RastreioService = require("../services/RastreioService");

class RastreioController {
  async show(req, res) {
    const rota = await RastreioService.obterRota(req.params.token);

    return res.json(rota);
  }

  async registrarPosicao(req, res) {
    const { latitude, longitude } = req.body;

    await RastreioService.registrarPosicao(
      req.params.token,
      Number(latitude),
      Number(longitude),
    );

    return res.status(204).send();
  }

  async confirmarEntrega(req, res) {
    const entrega = await RastreioService.confirmarEntrega(
      req.params.token,
      Number(req.params.entregaId),
    );

    return res.json(entrega);
  }
}

module.exports = new RastreioController();
