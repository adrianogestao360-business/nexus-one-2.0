const crypto = require("crypto");

const NotaFiscalRepository = require("../repositories/NotaFiscalRepository");
const IntegracaoFiscalRepository = require("../repositories/IntegracaoFiscalRepository");
const FocusNfeClient = require("../integrations/focusNfe/FocusNfeClient");

class NotaFiscalService {
  async listar(empresaId, status) {
    return NotaFiscalRepository.listar(empresaId, status);
  }

  async buscarPorId(id, empresaId) {
    const notaFiscal = await NotaFiscalRepository.findById(id, empresaId);

    if (!notaFiscal) {
      throw this.#naoEncontrada();
    }

    return notaFiscal;
  }

  async emitir(id, empresaId) {
    const notaFiscal = await this.buscarPorId(id, empresaId);

    if (notaFiscal.status !== "pendente") {
      const error = new Error(
        "Só é possível emitir uma nota fiscal pendente.",
      );
      error.status = 400;
      throw error;
    }

    if (notaFiscal.tipo === "entrada") {
      return this.#emitirSimulada(notaFiscal.id);
    }

    return this.#emitirReal(notaFiscal, empresaId);
  }

  async atualizarStatus(id, empresaId) {
    const notaFiscal = await this.buscarPorId(id, empresaId);

    if (!notaFiscal.ref) {
      const error = new Error("Esta nota fiscal ainda não foi emitida.");
      error.status = 400;
      throw error;
    }

    const integracao =
      await IntegracaoFiscalRepository.findByEmpresaId(empresaId);

    let resposta;

    try {
      resposta = await FocusNfeClient.consultarNfe(notaFiscal.ref, {
        token: integracao?.token,
        ambiente: notaFiscal.ambiente,
      });
    } catch (error) {
      throw this.#erroIntegracao(error);
    }

    return NotaFiscalRepository.atualizar(
      id,
      this.#mapearRespostaFocusNfe(resposta),
    );
  }

  async cancelar(id, empresaId, justificativa) {
    const notaFiscal = await this.buscarPorId(id, empresaId);

    if (["cancelada", "cancelado"].includes(notaFiscal.status)) {
      const error = new Error("Nota fiscal já está cancelada.");
      error.status = 400;
      throw error;
    }

    if (notaFiscal.tipo === "entrada") {
      return NotaFiscalRepository.atualizar(id, { status: "cancelada" });
    }

    if (!justificativa || justificativa.trim().length < 15) {
      const error = new Error(
        "Justificativa de cancelamento deve ter ao menos 15 caracteres.",
      );
      error.status = 400;
      throw error;
    }

    if (!notaFiscal.ref) {
      return NotaFiscalRepository.atualizar(id, {
        status: "cancelado",
        motivoStatus: justificativa,
      });
    }

    const integracao =
      await IntegracaoFiscalRepository.findByEmpresaId(empresaId);

    try {
      await FocusNfeClient.cancelarNfe(notaFiscal.ref, justificativa, {
        token: integracao?.token,
        ambiente: notaFiscal.ambiente,
      });
    } catch (error) {
      throw this.#erroIntegracao(error);
    }

    return NotaFiscalRepository.atualizar(id, {
      status: "cancelado",
      motivoStatus: justificativa,
    });
  }

  async #emitirSimulada(id) {
    return NotaFiscalRepository.atualizar(id, {
      status: "emitida",
      numero: `SIM-${String(id).padStart(6, "0")}`,
      emitidaEm: new Date(),
    });
  }

  async #emitirReal(notaFiscal, empresaId) {
    const integracao =
      await IntegracaoFiscalRepository.findByEmpresaId(empresaId);

    if (!integracao?.token) {
      const error = new Error(
        "Configure o token do Focus NFe antes de emitir notas fiscais (Empresas > Integração Fiscal).",
      );
      error.status = 400;
      throw error;
    }

    const { venda } = notaFiscal;
    const { cliente } = venda;

    this.#validarDadosFiscais(cliente, venda.itens);

    const ref = crypto.randomUUID();
    const payload = this.#montarPayloadNfe(venda, cliente);

    let resposta;

    try {
      resposta = await FocusNfeClient.emitirNfe(ref, payload, {
        token: integracao.token,
        ambiente: integracao.ambiente,
      });
    } catch (error) {
      throw this.#erroIntegracao(error);
    }

    return NotaFiscalRepository.atualizar(notaFiscal.id, {
      ref,
      ambiente: integracao.ambiente,
      status: resposta.status || "processando_autorizacao",
    });
  }

  #validarDadosFiscais(cliente, itens) {
    const faltando = [];

    if (!cliente.tipoDocumento || !cliente.documento) {
      faltando.push(
        `Cliente "${cliente.nome}" sem CPF/CNPJ ou tipo de documento definido.`,
      );
    }

    if (
      !cliente.logradouro ||
      !cliente.numero ||
      !cliente.bairro ||
      !cliente.municipio ||
      !cliente.uf ||
      !cliente.cep ||
      !cliente.codigoMunicipioIBGE
    ) {
      faltando.push(`Cliente "${cliente.nome}" sem endereço fiscal completo.`);
    }

    for (const item of itens) {
      if (!item.produto.ncm || !item.produto.cfop) {
        faltando.push(
          `Produto "${item.produto.descricao}" sem NCM/CFOP definidos.`,
        );
      }
    }

    if (faltando.length > 0) {
      const error = new Error(`Dados fiscais incompletos: ${faltando.join(" ")}`);
      error.status = 400;
      throw error;
    }
  }

  #montarPayloadNfe(venda, cliente) {
    const campoDocumento =
      cliente.tipoDocumento === "juridica"
        ? "cnpj_destinatario"
        : "cpf_destinatario";

    return {
      natureza_operacao: "Venda de mercadoria",
      data_emissao: new Date().toISOString(),
      tipo_documento: 1,
      finalidade_emissao: 1,
      presenca_comprador: 9,
      modalidade_frete: 9,

      [campoDocumento]: cliente.documento,
      nome_destinatario: cliente.nome,
      logradouro_destinatario: cliente.logradouro,
      numero_destinatario: cliente.numero,
      complemento_destinatario: cliente.complemento || undefined,
      bairro_destinatario: cliente.bairro,
      municipio_destinatario: cliente.municipio,
      uf_destinatario: cliente.uf,
      cep_destinatario: cliente.cep,
      codigo_municipio_destinatario: cliente.codigoMunicipioIBGE,
      indicador_inscricao_estadual_destinatario: 9,

      items: venda.itens.map((item, index) => ({
        numero_item: index + 1,
        codigo_produto: item.produto.codigo,
        descricao: item.produto.descricao,
        cfop: item.produto.cfop,
        ncm: item.produto.ncm,
        cest: item.produto.cest || undefined,
        unidade_comercial: item.produto.unidade || "UN",
        quantidade_comercial: item.quantidade,
        valor_unitario_comercial: Number(item.precoUnitario),
        valor_bruto: Number(item.subtotal),
        unidade_tributavel: item.produto.unidade || "UN",
        quantidade_tributavel: item.quantidade,
        valor_unitario_tributavel: Number(item.precoUnitario),
        icms_origem: item.produto.origem ?? 0,
        icms_situacao_tributaria: "102",
        pis_situacao_tributaria: "07",
        cofins_situacao_tributaria: "07",
      })),
    };
  }

  #mapearRespostaFocusNfe(resposta) {
    return {
      status: resposta.status,
      numero: resposta.numero || undefined,
      chaveAcesso: resposta.chave_nfe || undefined,
      protocoloAutorizacao: resposta.protocolo_autorizacao || undefined,
      motivoStatus:
        resposta.mensagem_sefaz || resposta.erros?.[0]?.mensagem || undefined,
      xmlUrl: resposta.caminho_xml_nota_fiscal || undefined,
      danfeUrl: resposta.caminho_danfe || undefined,
      dataAutorizacao:
        resposta.status === "autorizado" ? new Date() : undefined,
    };
  }

  #erroIntegracao(error) {
    const mensagem =
      error.response?.data?.mensagem ||
      error.response?.data?.erros?.[0]?.mensagem ||
      "Erro ao comunicar com o Focus NFe.";

    const erroTratado = new Error(mensagem);
    erroTratado.status = 502;
    return erroTratado;
  }

  #naoEncontrada() {
    const error = new Error("Nota fiscal não encontrada.");
    error.status = 404;
    return error;
  }
}

module.exports = new NotaFiscalService();
