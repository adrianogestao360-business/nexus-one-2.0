const VeiculoService = require("../services/VeiculoService");

class VeiculoController {
  async index(req, res) {
    const veiculos = await VeiculoService.listar(req.usuario.empresaId);

    return res.json(veiculos);
  }

  async show(req, res) {
    const veiculo = await VeiculoService.buscarPorId(
      Number(req.params.id),
      req.usuario.empresaId,
    );

    return res.json(veiculo);
  }

  async store(req, res) {
    const veiculo = await VeiculoService.criar(
      req.body,
      req.usuario.empresaId,
    );

    return res.status(201).json(veiculo);
  }

  async update(req, res) {
    const veiculo = await VeiculoService.atualizar(
      Number(req.params.id),
      req.body,
      req.usuario.empresaId,
    );

    return res.json(veiculo);
  }

  async destroy(req, res) {
    await VeiculoService.desativar(
      Number(req.params.id),
      req.usuario.empresaId,
    );

    return res.status(204).send();
  }
}

module.exports = new VeiculoController();
