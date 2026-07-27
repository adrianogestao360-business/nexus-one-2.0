const AbastecimentoService = require("../services/AbastecimentoService");

class AbastecimentoController {
  async index(req, res) {
    const abastecimentos = await AbastecimentoService.listar(
      Number(req.params.veiculoId),
      req.usuario.empresaId,
    );

    return res.json(abastecimentos);
  }

  async store(req, res) {
    const abastecimento = await AbastecimentoService.criar(
      Number(req.params.veiculoId),
      req.body,
      req.usuario.empresaId,
    );

    return res.status(201).json(abastecimento);
  }
}

module.exports = new AbastecimentoController();
