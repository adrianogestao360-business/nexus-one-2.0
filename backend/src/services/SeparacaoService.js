const prisma = require("../config/prisma");

const SeparacaoRepository = require("../repositories/SeparacaoRepository");
const VeiculoRepository = require("../repositories/VeiculoRepository");
const MotoristaRepository = require("../repositories/MotoristaRepository");

class SeparacaoService {
  async listar(empresaId, status) {
    return SeparacaoRepository.listar(empresaId, status);
  }

  async buscarPorId(id, empresaId) {
    const separacao = await SeparacaoRepository.findById(id, empresaId);

    if (!separacao) {
      throw this.#naoEncontrada();
    }

    return separacao;
  }

  async assumir(id, empresaId, usuarioId) {
    const separacao = await this.buscarPorId(id, empresaId);

    if (separacao.status !== "pendente") {
      const error = new Error(
        "Separação já foi assumida ou não está pendente.",
      );
      error.status = 409;
      throw error;
    }

    return SeparacaoRepository.atualizar(id, {
      status: "em_separacao",
      separadorId: usuarioId,
      iniciadoEm: new Date(),
    });
  }

  async liberar(id, empresaId, usuarioId) {
    const separacao = await this.buscarPorId(id, empresaId);

    this.#exigirPosse(separacao, usuarioId);

    return SeparacaoRepository.atualizar(id, {
      status: "pendente",
      separadorId: null,
      iniciadoEm: null,
    });
  }

  async marcarItem(id, itemId, separado, empresaId, usuarioId) {
    const separacao = await this.buscarPorId(id, empresaId);

    this.#exigirPosse(separacao, usuarioId);

    if (separacao.status !== "em_separacao") {
      const error = new Error("Separação não está em andamento.");
      error.status = 400;
      throw error;
    }

    const item = separacao.itens.find((item) => item.id === itemId);

    if (!item) {
      const error = new Error("Item não encontrado nesta separação.");
      error.status = 404;
      throw error;
    }

    await SeparacaoRepository.atualizarItem(itemId, {
      separado: Boolean(separado),
    });

    return this.buscarPorId(id, empresaId);
  }

  async concluir(id, empresaId, usuarioId) {
    const separacao = await this.buscarPorId(id, empresaId);

    this.#exigirPosse(separacao, usuarioId);

    if (separacao.itens.some((item) => !item.separado)) {
      const error = new Error("Ainda há itens não separados.");
      error.status = 400;
      throw error;
    }

    return SeparacaoRepository.atualizar(id, {
      status: "separado",
      concluidoEm: new Date(),
    });
  }

  async expedir(id, empresaId, veiculoId, motoristaId) {
    const separacao = await this.buscarPorId(id, empresaId);

    if (separacao.status !== "separado") {
      const error = new Error(
        "Só é possível expedir uma separação já separada.",
      );
      error.status = 400;
      throw error;
    }

    if (!veiculoId || !motoristaId) {
      const error = new Error("Veículo e motorista são obrigatórios.");
      error.status = 400;
      throw error;
    }

    const veiculo = await VeiculoRepository.findById(
      Number(veiculoId),
      empresaId,
    );

    if (!veiculo) {
      const error = new Error("Veículo não encontrado.");
      error.status = 404;
      throw error;
    }

    const motorista = await MotoristaRepository.findById(
      Number(motoristaId),
      empresaId,
    );

    if (!motorista) {
      const error = new Error("Motorista não encontrado.");
      error.status = 404;
      throw error;
    }

    const [separacaoAtualizada] = await prisma.$transaction([
      prisma.separacao.update({
        where: {
          id,
        },
        data: {
          status: "expedido",
          expedidoEm: new Date(),
        },
      }),
      prisma.entrega.create({
        data: {
          separacaoId: id,
          veiculoId: veiculo.id,
          motoristaId: motorista.id,
          empresaId,
        },
      }),
    ]);

    return SeparacaoRepository.findById(separacaoAtualizada.id, empresaId);
  }

  #exigirPosse(separacao, usuarioId) {
    if (separacao.separadorId !== usuarioId) {
      const error = new Error(
        "Só quem assumiu esta separação pode executar esta ação.",
      );
      error.status = 403;
      throw error;
    }
  }

  #naoEncontrada() {
    const error = new Error("Separação não encontrada.");
    error.status = 404;
    return error;
  }
}

module.exports = new SeparacaoService();
