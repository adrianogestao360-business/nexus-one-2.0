const CargoService = require("../services/CargoService");

class CargoController {
  async index(req, res) {
    const cargos = await CargoService.listar(req.usuario.empresaId);

    return res.json(cargos);
  }

  async store(req, res) {
    const cargo = await CargoService.criar(req.body, req.usuario.empresaId);

    return res.status(201).json(cargo);
  }

  async update(req, res) {
    const cargo = await CargoService.atualizar(
      Number(req.params.id),
      req.body,
      req.usuario.empresaId,
    );

    return res.json(cargo);
  }

  async destroy(req, res) {
    await CargoService.desativar(
      Number(req.params.id),
      req.usuario.empresaId,
    );

    return res.status(204).send();
  }
}

module.exports = new CargoController();
