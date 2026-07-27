const IntegracaoFiscalService = require("../services/IntegracaoFiscalService");

class IntegracaoFiscalController {
  async show(req, res) {
    const integracao = await IntegracaoFiscalService.buscar(
      Number(req.params.id),
    );

    return res.json(integracao);
  }

  async store(req, res) {
    const integracao = await IntegracaoFiscalService.salvar(
      req.body,
      Number(req.params.id),
    );

    return res.json(integracao);
  }
}

module.exports = new IntegracaoFiscalController();
