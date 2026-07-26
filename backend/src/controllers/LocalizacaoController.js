const LocalizacaoService = require("../services/LocalizacaoService");

class LocalizacaoController {
  async index(req, res) {
    const localizacoes = await LocalizacaoService.listar(
      req.usuario.empresaId,
    );

    return res.json(localizacoes);
  }

  async store(req, res) {
    const localizacao = await LocalizacaoService.criar(
      req.body,
      req.usuario.empresaId,
    );

    return res.status(201).json(localizacao);
  }
}

module.exports = new LocalizacaoController();
