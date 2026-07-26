const EmpresaService = require("../services/EmpresaService");

class EmpresaController {
  async index(req, res) {
    const empresas = await EmpresaService.listar();

    return res.json(empresas);
  }

  async show(req, res) {
    const empresa = await EmpresaService.buscarPorId(
      Number(req.params.id),
    );

    return res.json(empresa);
  }

  async store(req, res) {
    const empresa = await EmpresaService.criar(req.body);

    return res.status(201).json(empresa);
  }

  async update(req, res) {
    const empresa = await EmpresaService.atualizar(
      Number(req.params.id),
      req.body,
    );

    return res.json(empresa);
  }

  async destroy(req, res) {
    await EmpresaService.desativar(Number(req.params.id));

    return res.status(204).send();
  }
}

module.exports = new EmpresaController();