const DreService = require("../services/DreService");

class DreController {
  async show(req, res) {
    const dre = await DreService.gerar(req.usuario.empresaId, {
      dataInicio: req.query.dataInicio,
      dataFim: req.query.dataFim,
    });

    return res.json(dre);
  }
}

module.exports = new DreController();
