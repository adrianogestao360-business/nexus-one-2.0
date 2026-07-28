const ConferenciaService = require("../services/ConferenciaService");

class ConferenciaController {
  async index(req, res) {
    const conferencias = await ConferenciaService.listar(
      req.usuario.empresaId,
    );

    return res.json(conferencias);
  }

  async show(req, res) {
    const conferencia = await ConferenciaService.buscarPorId(
      Number(req.params.id),
      req.usuario.empresaId,
    );

    return res.json(conferencia);
  }

  async abrir(req, res) {
    const conferencia = await ConferenciaService.abrir(
      Number(req.params.compraId),
      req.body,
      req.usuario.empresaId,
    );

    return res.status(201).json(conferencia);
  }

  async atualizarItem(req, res) {
    const item = await ConferenciaService.registrarRecebimento(
      Number(req.params.id),
      Number(req.params.itemId),
      req.body?.quantidadeRecebida,
      req.usuario.empresaId,
    );

    return res.json(item);
  }

  async concluir(req, res) {
    const conferencia = await ConferenciaService.concluir(
      Number(req.params.id),
      req.usuario.empresaId,
    );

    return res.json(conferencia);
  }
}

module.exports = new ConferenciaController();
