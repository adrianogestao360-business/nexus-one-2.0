const InventarioService = require("../services/InventarioService");

class InventarioController {
  async index(req, res) {
    const inventarios = await InventarioService.listar(req.usuario.empresaId);

    return res.json(inventarios);
  }

  async show(req, res) {
    const inventario = await InventarioService.buscarPorId(
      Number(req.params.id),
      req.usuario.empresaId,
    );

    return res.json(inventario);
  }

  async store(req, res) {
    const inventario = await InventarioService.abrir(
      req.body,
      req.usuario.empresaId,
      req.usuario.sub,
    );

    return res.status(201).json(inventario);
  }

  async atualizarItem(req, res) {
    const item = await InventarioService.registrarContagem(
      Number(req.params.id),
      Number(req.params.itemId),
      req.body?.quantidadeContada,
      req.usuario.empresaId,
    );

    return res.json(item);
  }

  async fechar(req, res) {
    const inventario = await InventarioService.fechar(
      Number(req.params.id),
      req.usuario.empresaId,
    );

    return res.json(inventario);
  }
}

module.exports = new InventarioController();
