const OportunidadeRepository = require("../repositories/OportunidadeRepository");
const ClienteRepository = require("../repositories/ClienteRepository");

const ESTAGIOS = [
  "novo",
  "qualificacao",
  "proposta",
  "negociacao",
  "ganho",
  "perdido",
];

class OportunidadeService {
  async listar(empresaId) {
    return OportunidadeRepository.listar(empresaId);
  }

  async buscarPorId(id, empresaId) {
    const oportunidade = await OportunidadeRepository.findById(id, empresaId);

    if (!oportunidade) {
      throw this.#naoEncontrada();
    }

    return oportunidade;
  }

  async criar(data, empresaId) {
    const { titulo, clienteId, valor, observacoes } = data;

    if (!titulo || !clienteId) {
      const error = new Error("Título e cliente são obrigatórios.");
      error.status = 400;
      throw error;
    }

    const cliente = await ClienteRepository.findById(
      Number(clienteId),
      empresaId,
    );

    if (!cliente) {
      const error = new Error("Cliente não encontrado.");
      error.status = 404;
      throw error;
    }

    return OportunidadeRepository.criar({
      titulo,
      clienteId: Number(clienteId),
      empresaId,
      valor: valor !== undefined && valor !== "" ? Number(valor) : 0,
      observacoes: observacoes || null,
    });
  }

  async atualizar(id, data, empresaId) {
    await this.buscarPorId(id, empresaId);

    const { titulo, clienteId, valor, observacoes } = data;

    if (!titulo || !clienteId) {
      const error = new Error("Título e cliente são obrigatórios.");
      error.status = 400;
      throw error;
    }

    const cliente = await ClienteRepository.findById(
      Number(clienteId),
      empresaId,
    );

    if (!cliente) {
      const error = new Error("Cliente não encontrado.");
      error.status = 404;
      throw error;
    }

    return OportunidadeRepository.atualizar(id, {
      titulo,
      clienteId: Number(clienteId),
      valor: valor !== undefined && valor !== "" ? Number(valor) : 0,
      observacoes: observacoes || null,
    });
  }

  async moverEstagio(id, estagio, motivoPerda, empresaId) {
    await this.buscarPorId(id, empresaId);

    if (!ESTAGIOS.includes(estagio)) {
      const error = new Error("Estágio inválido.");
      error.status = 400;
      throw error;
    }

    if (estagio === "perdido" && !motivoPerda) {
      const error = new Error(
        "Motivo da perda é obrigatório ao mover para 'perdido'.",
      );
      error.status = 400;
      throw error;
    }

    return OportunidadeRepository.atualizar(id, {
      estagio,
      motivoPerda: estagio === "perdido" ? motivoPerda : null,
    });
  }

  #naoEncontrada() {
    const error = new Error("Oportunidade não encontrada.");
    error.status = 404;
    return error;
  }
}

module.exports = new OportunidadeService();
