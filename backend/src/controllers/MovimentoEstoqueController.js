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

  async bloquear(req, res) {
    const movimento = await MovimentoEstoqueService.bloquear(
      req.body,
      req.usuario.empresaId,
    );

    return res.status(201).json(movimento);
  }

  async desbloquear(req, res) {
    const movimento = await MovimentoEstoqueService.desbloquear(
      req.body,
      req.usuario.empresaId,
    );

    return res.status(201).json(movimento);
  }

  async reservar(req, res) {
    const movimento = await MovimentoEstoqueService.reservar(
      req.body,
      req.usuario.empresaId,
    );

    return res.status(201).json(movimento);
  }

  async liberarReserva(req, res) {
    const movimento = await MovimentoEstoqueService.liberarReserva(
      req.body,
      req.usuario.empresaId,
    );

    return res.status(201).json(movimento);
  }
}

module.exports = new MovimentoEstoqueController();
