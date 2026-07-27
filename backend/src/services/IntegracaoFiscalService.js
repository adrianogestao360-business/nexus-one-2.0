const IntegracaoFiscalRepository = require("../repositories/IntegracaoFiscalRepository");

const AMBIENTES_VALIDOS = ["homologacao", "producao"];

class IntegracaoFiscalService {
  async buscar(empresaId) {
    const integracao =
      await IntegracaoFiscalRepository.findByEmpresaId(empresaId);

    return (
      integracao || {
        empresaId,
        provedor: "focus_nfe",
        token: null,
        ambiente: "homologacao",
      }
    );
  }

  async salvar(data, empresaId) {
    const { token, ambiente } = data;

    if (ambiente && !AMBIENTES_VALIDOS.includes(ambiente)) {
      const error = new Error(
        'Ambiente deve ser "homologacao" ou "producao".',
      );
      error.status = 400;
      throw error;
    }

    return IntegracaoFiscalRepository.upsert(empresaId, {
      token: token || null,
      ambiente: ambiente || "homologacao",
    });
  }
}

module.exports = new IntegracaoFiscalService();
