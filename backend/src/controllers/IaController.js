const IaService = require("../services/IaService");

class IaController {
  async resumo(req, res) {
    const resumo = await IaService.obterResumo(req.usuario.empresaId);

    return res.json(resumo);
  }

  async planoDeAcao(req, res) {
    const resultado = await IaService.gerarPlanoDeAcao(req.usuario.empresaId);

    return res.json(resultado);
  }
}

module.exports = new IaController();
