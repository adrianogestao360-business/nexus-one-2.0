const LoteService = require("../services/LoteService");

class LoteController {
  async index(req, res) {
    const lotes = await LoteService.listar(req.usuario.empresaId, {
      produtoId: req.query.produtoId,
    });

    return res.json(lotes);
  }
}

module.exports = new LoteController();
