const TituloService = require("../services/TituloService");

class TituloController {
  async index(req, res) {
    const titulos = await TituloService.listar(
      req.usuario.empresaId,
      req.query.tipo,
    );

    return res.json(titulos);
  }

  async show(req, res) {
    const titulo = await TituloService.buscarPorId(
      Number(req.params.id),
      req.usuario.empresaId,
    );

    return res.json(titulo);
  }

  async store(req, res) {
    const titulo = await TituloService.criar(req.body, req.usuario.empresaId);

    return res.status(201).json(titulo);
  }

  async baixar(req, res) {
    const titulo = await TituloService.baixar(
      Number(req.params.id),
      req.usuario.empresaId,
    );

    return res.json(titulo);
  }

  async destroy(req, res) {
    await TituloService.cancelar(
      Number(req.params.id),
      req.usuario.empresaId,
    );

    return res.status(204).send();
  }
}

module.exports = new TituloController();
