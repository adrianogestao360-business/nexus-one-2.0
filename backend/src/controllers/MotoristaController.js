const MotoristaService = require("../services/MotoristaService");

class MotoristaController {
  async index(req, res) {
    const motoristas = await MotoristaService.listar(req.usuario.empresaId);

    return res.json(motoristas);
  }

  async show(req, res) {
    const motorista = await MotoristaService.buscarPorId(
      Number(req.params.id),
      req.usuario.empresaId,
    );

    return res.json(motorista);
  }

  async store(req, res) {
    const motorista = await MotoristaService.criar(
      req.body,
      req.usuario.empresaId,
    );

    return res.status(201).json(motorista);
  }

  async update(req, res) {
    const motorista = await MotoristaService.atualizar(
      Number(req.params.id),
      req.body,
      req.usuario.empresaId,
    );

    return res.json(motorista);
  }

  async destroy(req, res) {
    await MotoristaService.desativar(
      Number(req.params.id),
      req.usuario.empresaId,
    );

    return res.status(204).send();
  }
}

module.exports = new MotoristaController();
