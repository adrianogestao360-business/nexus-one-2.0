const MovimentoEstoqueService = require("../services/MovimentoEstoqueService");

class MovimentoEstoqueController {
  async index(req, res) {
    const movimentos = await MovimentoEstoqueService.listar(
      req.usuario.empresaId,
      req.query.produtoId,
    );

    return res.json(movimentos);
  }

  async store(req, res) {
    const movimento = await MovimentoEstoqueService.criar(
      req.body,
      req.usuario.empresaId,
    );

    return res.status(201).json(movimento);
  }

  async transferir(req, res) {
    const resultado = await MovimentoEstoqueService.transferir(
      req.body,
      req.usuario.empresaId,
    );

    return res.status(201).json(resultado);
  }
}

module.exports = new MovimentoEstoqueController();
