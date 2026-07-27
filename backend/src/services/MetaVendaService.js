const MetaVendaRepository = require("../repositories/MetaVendaRepository");
const UsuarioRepository = require("../repositories/UsuarioRepository");

class MetaVendaService {
  async listar(empresaId) {
    const metas = await MetaVendaRepository.listar(empresaId);

    return Promise.all(
      metas.map((meta) => this.#comResultado(meta, empresaId)),
    );
  }

  async buscarPorId(id, empresaId) {
    const meta = await MetaVendaRepository.findById(id, empresaId);

    if (!meta) {
      throw this.#naoEncontrada();
    }

    return meta;
  }

  async criar(data, empresaId) {
    const dados = await this.#sanitizar(data, empresaId);

    const existente = await MetaVendaRepository.findByUsuarioMesAno(
      dados.usuarioId,
      dados.mes,
      dados.ano,
    );

    if (existente) {
      const error = new Error(
        "Já existe uma meta para este vendedor neste mês/ano.",
      );
      error.status = 400;
      throw error;
    }

    const meta = await MetaVendaRepository.criar({ ...dados, empresaId });

    return this.#comResultado(meta, empresaId);
  }

  async atualizar(id, data, empresaId) {
    await this.buscarPorId(id, empresaId);

    const dados = await this.#sanitizar(data, empresaId);

    const meta = await MetaVendaRepository.atualizar(id, dados);

    return this.#comResultado(meta, empresaId);
  }

  async excluir(id, empresaId) {
    await this.buscarPorId(id, empresaId);

    return MetaVendaRepository.excluir(id);
  }

  async #sanitizar(data, empresaId) {
    const { usuarioId, mes, ano, valorMeta, percentualComissao } = data;

    if (!usuarioId) {
      const error = new Error("Vendedor é obrigatório.");
      error.status = 400;
      throw error;
    }

    const usuario = await UsuarioRepository.findById(
      Number(usuarioId),
      empresaId,
    );

    if (!usuario) {
      const error = new Error("Vendedor não encontrado.");
      error.status = 404;
      throw error;
    }

    if (!mes || mes < 1 || mes > 12 || !ano) {
      const error = new Error("Mês (1-12) e ano são obrigatórios.");
      error.status = 400;
      throw error;
    }

    if (!valorMeta || Number(valorMeta) <= 0) {
      const error = new Error("Valor da meta deve ser maior que zero.");
      error.status = 400;
      throw error;
    }

    const percentual =
      percentualComissao !== undefined && percentualComissao !== ""
        ? Number(percentualComissao)
        : 0;

    if (percentual < 0 || percentual > 100) {
      const error = new Error(
        "Percentual de comissão deve estar entre 0 e 100.",
      );
      error.status = 400;
      throw error;
    }

    return {
      usuarioId: Number(usuarioId),
      mes: Number(mes),
      ano: Number(ano),
      valorMeta: Number(valorMeta),
      percentualComissao: percentual,
    };
  }

  async #comResultado(meta, empresaId) {
    const inicio = new Date(meta.ano, meta.mes - 1, 1);
    const fim = new Date(meta.ano, meta.mes, 1);

    const realizado = await MetaVendaRepository.somarVendasConfirmadas(
      meta.usuarioId,
      empresaId,
      inicio,
      fim,
    );

    const comissao = realizado * (Number(meta.percentualComissao) / 100);
    const percentualAtingido =
      Number(meta.valorMeta) > 0
        ? (realizado / Number(meta.valorMeta)) * 100
        : 0;

    return {
      ...meta,
      realizado,
      comissao,
      percentualAtingido,
    };
  }

  #naoEncontrada() {
    const error = new Error("Meta de venda não encontrada.");
    error.status = 404;
    return error;
  }
}

module.exports = new MetaVendaService();
