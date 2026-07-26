const AuditoriaService = require("../services/AuditoriaService");

class AuditoriaController {
  async index(req, res) {
    const logs = await AuditoriaService.listar(req.usuario.empresaId, {
      acao: req.query.acao,
      entidade: req.query.entidade,
      usuarioId: req.query.usuarioId,
      dataInicio: req.query.dataInicio,
      dataFim: req.query.dataFim,
    });

    return res.json(logs);
  }
}

module.exports = new AuditoriaController();
