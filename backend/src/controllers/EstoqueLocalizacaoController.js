const EstoqueLocalizacaoService = require("../services/EstoqueLocalizacaoService");

class EstoqueLocalizacaoController {
  async index(req, res) {
    const estoques = await EstoqueLocalizacaoService.listarPorProduto(
      req.query.produtoId,
      req.usuario.empresaId,
    );

    return res.json(estoques);
  }
}

module.exports = new EstoqueLocalizacaoController();
