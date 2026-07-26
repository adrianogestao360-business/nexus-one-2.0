const CompraService = require("../services/CompraService");
const AuditoriaService = require("../services/AuditoriaService");

class CompraController {
  async index(req, res) {
    const compras = await CompraService.listar(req.usuario.empresaId);

    return res.json(compras);
  }

  async show(req, res) {
    const compra = await CompraService.buscarPorId(
      Number(req.params.id),
      req.usuario.empresaId,
    );

    return res.json(compra);
  }

  async store(req, res) {
    const compra = await CompraService.criar(req.body, req.usuario.empresaId);

    await AuditoriaService.registrar({
      empresaId: req.usuario.empresaId,
      usuarioId: req.usuario.sub,
      acao: "compra.criar",
      entidade: "Compra",
      entidadeId: compra.id,
      detalhes: { total: compra.total, fornecedorId: compra.fornecedorId },
      ip: req.ip,
    });

    return res.status(201).json(compra);
  }

  async destroy(req, res) {
    const id = Number(req.params.id);

    await CompraService.cancelar(id, req.usuario.empresaId);

    await AuditoriaService.registrar({
      empresaId: req.usuario.empresaId,
      usuarioId: req.usuario.sub,
      acao: "compra.cancelar",
      entidade: "Compra",
      entidadeId: id,
      ip: req.ip,
    });

    return res.status(204).send();
  }
}

module.exports = new CompraController();
