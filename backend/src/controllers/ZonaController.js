const ZonaService = require("../services/ZonaService");

class ZonaController {
  async index(req, res) {
    const zonas = await ZonaService.listar(req.usuario.empresaId);

    return res.json(zonas);
  }

  async store(req, res) {
    const zona = await ZonaService.criar(req.body, req.usuario.empresaId);

    return res.status(201).json(zona);
  }
}

module.exports = new ZonaController();
