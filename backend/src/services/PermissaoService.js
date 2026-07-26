const PermissaoRepository = require("../repositories/PermissaoRepository");

class PermissaoService {
  async listar() {
    return PermissaoRepository.listar();
  }
}

module.exports = new PermissaoService();
