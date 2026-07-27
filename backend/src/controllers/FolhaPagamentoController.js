const FolhaPagamentoService = require("../services/FolhaPagamentoService");

class FolhaPagamentoController {
  async index(req, res) {
    const folhas = await FolhaPagamentoService.listar(req.usuario.empresaId);

    return res.json(folhas);
  }

  async show(req, res) {
    const folha = await FolhaPagamentoService.buscarPorId(
      Number(req.params.id),
      req.usuario.empresaId,
    );

    return res.json(folha);
  }

  async store(req, res) {
    const folha = await FolhaPagamentoService.criar(
      req.body,
      req.usuario.empresaId,
    );

    return res.status(201).json(folha);
  }

  async atualizarItem(req, res) {
    const item = await FolhaPagamentoService.atualizarItem(
      Number(req.params.itemId),
      req.body,
      req.usuario.empresaId,
    );

    return res.json(item);
  }

  async fechar(req, res) {
    const folha = await FolhaPagamentoService.fechar(
      Number(req.params.id),
      req.usuario.empresaId,
    );

    return res.json(folha);
  }
}

module.exports = new FolhaPagamentoController();
