const PapelService = require("../services/PapelService");
const AuditoriaService = require("../services/AuditoriaService");

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
    const id = Number(req.params.id);

    const papel = await PapelService.definirPermissoes(
      id,
      req.body.permissaoIds,
      req.usuario.empresaId,
    );

    await AuditoriaService.registrar({
      empresaId: req.usuario.empresaId,
      usuarioId: req.usuario.sub,
      acao: "papel.permissoes.alterar",
      entidade: "Papel",
      entidadeId: id,
      detalhes: { permissaoIds: req.body.permissaoIds },
      ip: req.ip,
    });

    return res.json(papel);
  }
}

module.exports = new PapelController();
