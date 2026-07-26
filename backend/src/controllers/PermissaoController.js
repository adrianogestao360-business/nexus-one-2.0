const PermissaoService = require("../services/PermissaoService");

class PermissaoController {
  async index(req, res) {
    const permissoes = await PermissaoService.listar();

    return res.json(permissoes);
  }
}

module.exports = new PermissaoController();
