const ContaBancariaService = require("../services/ContaBancariaService");

class ContaBancariaController {
  async index(req, res) {
    const contas = await ContaBancariaService.listar(req.usuario.empresaId);

    return res.json(contas);
  }

  async store(req, res) {
    const conta = await ContaBancariaService.criar(
      req.body,
      req.usuario.empresaId,
    );

    return res.status(201).json(conta);
  }

  async update(req, res) {
    const conta = await ContaBancariaService.atualizar(
      Number(req.params.id),
      req.body,
      req.usuario.empresaId,
    );

    return res.json(conta);
  }

  async destroy(req, res) {
    await ContaBancariaService.desativar(
      Number(req.params.id),
      req.usuario.empresaId,
    );

    return res.status(204).send();
  }
}

module.exports = new ContaBancariaController();
