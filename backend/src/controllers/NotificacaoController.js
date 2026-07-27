const NotificacaoService = require("../services/NotificacaoService");

class NotificacaoController {
  async index(req, res) {
    const notificacoes = await NotificacaoService.listar(
      req.usuario.sub,
      req.usuario.empresaId,
    );

    return res.json(notificacoes);
  }

  async marcarComoLida(req, res) {
    await NotificacaoService.marcarComoLida(
      req.body.chave,
      req.usuario.sub,
      req.usuario.empresaId,
    );

    return res.status(204).send();
  }
}

module.exports = new NotificacaoController();
