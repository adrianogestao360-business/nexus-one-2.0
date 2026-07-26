const UsuarioService = require("../services/UsuarioService");

class UsuarioController {
  async index(req, res) {
    const usuarios = await UsuarioService.listar(req.usuario.empresaId);

    return res.json(usuarios);
  }

  async show(req, res) {
    const usuario = await UsuarioService.buscarPorId(
      Number(req.params.id),
      req.usuario.empresaId,
    );

    return res.json(usuario);
  }

  async store(req, res) {
    const usuario = await UsuarioService.criar(
      req.body,
      req.usuario.empresaId,
    );

    return res.status(201).json(usuario);
  }

  async update(req, res) {
    const usuario = await UsuarioService.atualizar(
      Number(req.params.id),
      req.body,
      req.usuario.empresaId,
    );

    return res.json(usuario);
  }

  async destroy(req, res) {
    await UsuarioService.desativar(
      Number(req.params.id),
      req.usuario.empresaId,
    );

    return res.status(204).send();
  }

  async trocarSenha(req, res) {
    await UsuarioService.alterarSenha(
      req.usuario.sub,
      req.body.senhaAtual,
      req.body.novaSenha,
    );

    return res.status(204).send();
  }
}

module.exports = new UsuarioController();
