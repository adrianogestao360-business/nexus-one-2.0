const FuncionarioService = require("../services/FuncionarioService");

class FuncionarioController {
  async index(req, res) {
    const funcionarios = await FuncionarioService.listar(
      req.usuario.empresaId,
    );

    return res.json(funcionarios);
  }

  async store(req, res) {
    const funcionario = await FuncionarioService.criar(
      req.body,
      req.usuario.empresaId,
    );

    return res.status(201).json(funcionario);
  }

  async update(req, res) {
    const funcionario = await FuncionarioService.atualizar(
      Number(req.params.id),
      req.body,
      req.usuario.empresaId,
    );

    return res.json(funcionario);
  }

  async destroy(req, res) {
    await FuncionarioService.desativar(
      Number(req.params.id),
      req.usuario.empresaId,
    );

    return res.status(204).send();
  }
}

module.exports = new FuncionarioController();
