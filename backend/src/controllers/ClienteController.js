const ClienteService = require("../services/ClienteService");

class ClienteController {
  async index(req, res) {
    const clientes = await ClienteService.listar(req.usuario.empresaId);

    return res.json(clientes);
  }

  async show(req, res) {
    const cliente = await ClienteService.buscarPorId(
      Number(req.params.id),
      req.usuario.empresaId,
    );

    return res.json(cliente);
  }

  async store(req, res) {
    const cliente = await ClienteService.criar(
      req.body,
      req.usuario.empresaId,
    );

    return res.status(201).json(cliente);
  }

  async update(req, res) {
    const cliente = await ClienteService.atualizar(
      Number(req.params.id),
      req.body,
      req.usuario.empresaId,
    );

    return res.json(cliente);
  }

  async destroy(req, res) {
    await ClienteService.desativar(
      Number(req.params.id),
      req.usuario.empresaId,
    );

    return res.status(204).send();
  }
}

module.exports = new ClienteController();
