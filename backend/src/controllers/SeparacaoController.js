const SeparacaoService = require("../services/SeparacaoService");

class SeparacaoController {
  async index(req, res) {
    const separacoes = await SeparacaoService.listar(
      req.usuario.empresaId,
      req.query.status,
    );

    return res.json(separacoes);
  }

  async show(req, res) {
    const separacao = await SeparacaoService.buscarPorId(
      Number(req.params.id),
      req.usuario.empresaId,
    );

    return res.json(separacao);
  }

  async assumir(req, res) {
    const separacao = await SeparacaoService.assumir(
      Number(req.params.id),
      req.usuario.empresaId,
      req.usuario.sub,
    );

    return res.json(separacao);
  }

  async liberar(req, res) {
    const separacao = await SeparacaoService.liberar(
      Number(req.params.id),
      req.usuario.empresaId,
      req.usuario.sub,
    );

    return res.json(separacao);
  }

  async marcarItem(req, res) {
    const separacao = await SeparacaoService.marcarItem(
      Number(req.params.id),
      Number(req.params.itemId),
      req.body.separado,
      req.usuario.empresaId,
      req.usuario.sub,
    );

    return res.json(separacao);
  }

  async concluir(req, res) {
    const separacao = await SeparacaoService.concluir(
      Number(req.params.id),
      req.usuario.empresaId,
      req.usuario.sub,
    );

    return res.json(separacao);
  }

  async expedir(req, res) {
    const separacao = await SeparacaoService.expedir(
      Number(req.params.id),
      req.usuario.empresaId,
      req.body.veiculoId,
      req.body.motoristaId,
    );

    return res.json(separacao);
  }
}

module.exports = new SeparacaoController();
