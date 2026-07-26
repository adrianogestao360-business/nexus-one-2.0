const ProdutoService = require("../services/ProdutoService");

class ProdutoController {
  async index(req, res) {
    const produtos = await ProdutoService.listar(req.usuario.empresaId);

    return res.json(produtos);
  }

  async show(req, res) {
    const produto = await ProdutoService.buscarPorId(
      Number(req.params.id),
      req.usuario.empresaId,
    );

    return res.json(produto);
  }

  async store(req, res) {
    const produto = await ProdutoService.criar(
      req.body,
      req.usuario.empresaId,
    );

    return res.status(201).json(produto);
  }

  async update(req, res) {
    const produto = await ProdutoService.atualizar(
      Number(req.params.id),
      req.body,
      req.usuario.empresaId,
    );

    return res.json(produto);
  }

  async destroy(req, res) {
    await ProdutoService.desativar(
      Number(req.params.id),
      req.usuario.empresaId,
    );

    return res.status(204).send();
  }
}

module.exports = new ProdutoController();
