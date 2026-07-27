const crypto = require("crypto");

const prisma = require("../config/prisma");

const RotaRepository = require("../repositories/RotaRepository");
const SeparacaoRepository = require("../repositories/SeparacaoRepository");
const VeiculoRepository = require("../repositories/VeiculoRepository");
const MotoristaRepository = require("../repositories/MotoristaRepository");
const PosicaoMotoristaRepository = require("../repositories/PosicaoMotoristaRepository");
const AbastecimentoRepository = require("../repositories/AbastecimentoRepository");

const RAIO_TERRA_KM = 6371;

function distanciaKm(pontoA, pontoB) {
  const dLat = ((pontoB.latitude - pontoA.latitude) * Math.PI) / 180;
  const dLon = ((pontoB.longitude - pontoA.longitude) * Math.PI) / 180;

  const lat1 = (pontoA.latitude * Math.PI) / 180;
  const lat2 = (pontoB.latitude * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return RAIO_TERRA_KM * c;
}

class RotaService {
  async listar(empresaId, status) {
    return RotaRepository.listar(empresaId, status);
  }

  async buscarPorId(id, empresaId) {
    const rota = await RotaRepository.findById(id, empresaId);

    if (!rota) {
      throw this.#naoEncontrada();
    }

    return rota;
  }

  async criar(data, empresaId) {
    const { veiculoId, motoristaId, separacaoIds } = data;

    if (
      !veiculoId ||
      !motoristaId ||
      !Array.isArray(separacaoIds) ||
      separacaoIds.length === 0
    ) {
      const error = new Error(
        "Veículo, motorista e ao menos uma separação são obrigatórios.",
      );
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

    const separacoes = await Promise.all(
      separacaoIds.map((id) => SeparacaoRepository.findById(Number(id), empresaId)),
    );

    for (const separacao of separacoes) {
      if (!separacao) {
        const error = new Error("Separação não encontrada.");
        error.status = 404;
        throw error;
      }

      if (separacao.status !== "separado") {
        const error = new Error(
          `Separação #${separacao.id} não está pronta para expedição.`,
        );
        error.status = 400;
        throw error;
      }
    }

    const rota = await prisma.$transaction(async (tx) => {
      const novaRota = await tx.rota.create({
        data: {
          empresaId,
          veiculoId: veiculo.id,
          motoristaId: motorista.id,
          tokenRastreio: crypto.randomUUID(),
        },
      });

      for (const separacao of separacoes) {
        await tx.separacao.update({
          where: { id: separacao.id },
          data: { status: "expedido", expedidoEm: new Date() },
        });

        await tx.entrega.create({
          data: {
            separacaoId: separacao.id,
            veiculoId: veiculo.id,
            motoristaId: motorista.id,
            empresaId,
            rotaId: novaRota.id,
          },
        });
      }

      return novaRota;
    });

    return this.buscarPorId(rota.id, empresaId);
  }

  async registrarPosicao(token, latitude, longitude) {
    const rota = await this.#buscarPorTokenAtiva(token);

    await PosicaoMotoristaRepository.criar({
      rotaId: rota.id,
      latitude,
      longitude,
    });

    return RotaRepository.atualizar(rota.id, {
      ultimaLatitude: latitude,
      ultimaLongitude: longitude,
      ultimaPosicaoEm: new Date(),
    });
  }

  async concluir(id, empresaId) {
    const rota = await this.buscarPorId(id, empresaId);

    if (rota.status === "concluida") {
      return rota;
    }

    const { kmPercorrido, custoEstimado } = await this.#calcularCusto(rota);

    return RotaRepository.atualizar(id, {
      status: "concluida",
      concluidaEm: new Date(),
      kmPercorrido,
      custoEstimado,
    });
  }

  async #calcularCusto(rota) {
    const posicoes = await PosicaoMotoristaRepository.listarPorRota(rota.id);

    let kmPercorrido = null;

    if (posicoes.length >= 2) {
      kmPercorrido = 0;

      for (let i = 1; i < posicoes.length; i++) {
        kmPercorrido += distanciaKm(posicoes[i - 1], posicoes[i]);
      }

      kmPercorrido = Number(kmPercorrido.toFixed(2));
    }

    const veiculo = await VeiculoRepository.findById(
      rota.veiculoId,
      rota.empresaId,
    );
    const ultimoAbastecimento = await AbastecimentoRepository.buscarMaisRecente(
      rota.veiculoId,
      rota.empresaId,
    );

    let custoEstimado = null;

    if (kmPercorrido && veiculo?.kmMedioPorLitro && ultimoAbastecimento) {
      custoEstimado = Number(
        (
          (kmPercorrido / Number(veiculo.kmMedioPorLitro)) *
          Number(ultimoAbastecimento.valorLitro)
        ).toFixed(2),
      );
    }

    return { kmPercorrido, custoEstimado };
  }

  async #buscarPorTokenAtiva(token) {
    const rota = await RotaRepository.findByToken(token);

    if (!rota || rota.status !== "em_andamento") {
      throw this.#naoEncontrada();
    }

    return rota;
  }

  // usado para ações (registrar posição, confirmar entrega): só permite em rota ainda ativa
  async obterPorToken(token) {
    return this.#buscarPorTokenAtiva(token);
  }

  // usado só pra exibir a página do motorista: mostra também rotas já concluídas
  // (em vez de "não encontrada"), pra dar um retorno de sucesso após a última confirmação
  async obterQualquerPorToken(token) {
    const rota = await RotaRepository.findByToken(token);

    if (!rota) {
      throw this.#naoEncontrada();
    }

    return rota;
  }

  #naoEncontrada() {
    const error = new Error("Rota não encontrada.");
    error.status = 404;
    return error;
  }
}

module.exports = new RotaService();
