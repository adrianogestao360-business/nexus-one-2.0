const OportunidadeService = require("../services/OportunidadeService");

class OportunidadeController {
  async index(req, res) {
    const oportunidades = await OportunidadeService.listar(
      req.usuario.empresaId,
    );

    return res.json(oportunidades);
  }

  async show(req, res) {
    const oportunidade = await OportunidadeService.buscarPorId(
      Number(req.params.id),
      req.usuario.empresaId,
    );

    return res.json(oportunidade);
  }

  async store(req, res) {
    const oportunidade = await OportunidadeService.criar(
      req.body,
      req.usuario.empresaId,
    );

    return res.status(201).json(oportunidade);
  }

  async update(req, res) {
    const oportunidade = await OportunidadeService.atualizar(
      Number(req.params.id),
      req.body,
      req.usuario.empresaId,
    );

    return res.json(oportunidade);
  }

  async moverEstagio(req, res) {
    const oportunidade = await OportunidadeService.moverEstagio(
      Number(req.params.id),
      req.body.estagio,
      req.body.motivoPerda,
      req.usuario.empresaId,
    );

    return res.json(oportunidade);
  }
}

module.exports = new OportunidadeController();
