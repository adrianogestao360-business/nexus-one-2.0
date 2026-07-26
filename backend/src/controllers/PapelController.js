const PapelService = require("../services/PapelService");

class PapelController {
  async index(req, res) {
    const papeis = await PapelService.listar(req.usuario.empresaId);

    return res.json(papeis);
  }

  async show(req, res) {
    const papel = await PapelService.buscarPorId(
      Number(req.params.id),
      req.usuario.empresaId,
    );

    return res.json(papel);
  }

  async store(req, res) {
    const papel = await PapelService.criar(req.body, req.usuario.empresaId);

    return res.status(201).json(papel);
  }

  async update(req, res) {
    const papel = await PapelService.atualizar(
      Number(req.params.id),
      req.body,
      req.usuario.empresaId,
    );

    return res.json(papel);
  }

  async definirPermissoes(req, res) {
    const papel = await PapelService.definirPermissoes(
      Number(req.params.id),
      req.body.permissaoIds,
      req.usuario.empresaId,
    );

    return res.json(papel);
  }
}

module.exports = new PapelController();
