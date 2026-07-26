const FornecedorService = require("../services/FornecedorService");

class FornecedorController {
  async index(req, res) {
    const fornecedores = await FornecedorService.listar(
      req.usuario.empresaId,
    );

    return res.json(fornecedores);
  }

  async show(req, res) {
    const fornecedor = await FornecedorService.buscarPorId(
      Number(req.params.id),
      req.usuario.empresaId,
    );

    return res.json(fornecedor);
  }

  async store(req, res) {
    const fornecedor = await FornecedorService.criar(
      req.body,
      req.usuario.empresaId,
    );

    return res.status(201).json(fornecedor);
  }

  async update(req, res) {
    const fornecedor = await FornecedorService.atualizar(
      Number(req.params.id),
      req.body,
      req.usuario.empresaId,
    );

    return res.json(fornecedor);
  }

  async destroy(req, res) {
    await FornecedorService.desativar(
      Number(req.params.id),
      req.usuario.empresaId,
    );

    return res.status(204).send();
  }
}

module.exports = new FornecedorController();
