const RomaneioService = require("../services/RomaneioService");

class RomaneioController {
  async index(req, res) {
    const romaneios = await RomaneioService.listar(req.usuario.empresaId);

    return res.json(romaneios);
  }

  async show(req, res) {
    const romaneio = await RomaneioService.buscarPorId(
      Number(req.params.id),
      req.usuario.empresaId,
    );

    return res.json(romaneio);
  }
}

module.exports = new RomaneioController();
