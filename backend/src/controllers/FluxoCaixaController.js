const FluxoCaixaService = require("../services/FluxoCaixaService");

class FluxoCaixaController {
  async show(req, res) {
    const fluxo = await FluxoCaixaService.obter(req.usuario.empresaId, {
      dataInicio: req.query.dataInicio,
      dataFim: req.query.dataFim,
    });

    return res.json(fluxo);
  }
}

module.exports = new FluxoCaixaController();
