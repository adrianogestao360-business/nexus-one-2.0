const NotaFiscalService = require("../services/NotaFiscalService");

class NotaFiscalController {
  async index(req, res) {
    const notasFiscais = await NotaFiscalService.listar(
      req.usuario.empresaId,
      req.query.status,
    );

    return res.json(notasFiscais);
  }

  async show(req, res) {
    const notaFiscal = await NotaFiscalService.buscarPorId(
      Number(req.params.id),
      req.usuario.empresaId,
    );

    return res.json(notaFiscal);
  }

  async emitir(req, res) {
    const notaFiscal = await NotaFiscalService.emitir(
      Number(req.params.id),
      req.usuario.empresaId,
    );

    return res.status(202).json(notaFiscal);
  }

  async atualizarStatus(req, res) {
    const notaFiscal = await NotaFiscalService.atualizarStatus(
      Number(req.params.id),
      req.usuario.empresaId,
    );

    return res.json(notaFiscal);
  }

  async cancelar(req, res) {
    const notaFiscal = await NotaFiscalService.cancelar(
      Number(req.params.id),
      req.usuario.empresaId,
      req.body?.justificativa,
    );

    return res.json(notaFiscal);
  }
}

module.exports = new NotaFiscalController();
