const prisma = require("../config/prisma");
const EmpresaRepository = require("../repositories/EmpresaRepository");
const { CODIGOS_PERMISSOES_PADRAO } = require("../constants/permissoes");

class EmpresaService {
  async listar() {
    return EmpresaRepository.findAll();
  }

  async buscarPorId(id) {
    const empresa = await EmpresaRepository.findById(id);

    if (!empresa) {
      throw this.#naoEncontrada();
    }

    return empresa;
  }

  async criar(data) {
    const dados = this.#sanitizar(data);

    return prisma.$transaction(async (tx) => {
      const empresa = await tx.empresa.create({ data: dados });

      const papel = await tx.papel.create({
        data: {
          nome: "Administrador",
          descricao: "Acesso administrativo ao Nexus One ERP",
          empresaId: empresa.id,
        },
      });

      for (const codigo of CODIGOS_PERMISSOES_PADRAO) {
        const permissao = await tx.permissao.upsert({
          where: { codigo },
          update: {},
          create: { codigo },
        });

        await tx.papelPermissao.create({
          data: { papelId: papel.id, permissaoId: permissao.id },
        });
      }

      return empresa;
    });
  }

  async atualizar(id, data) {
    const dados = this.#sanitizar(data);

    await this.buscarPorId(id);

    return EmpresaRepository.update(id, dados);
  }

  async desativar(id) {
    await this.buscarPorId(id);

    return EmpresaRepository.desativar(id);
  }

  #sanitizar(data) {
    const {
      razaoSocial,
      nomeFantasia,
      cnpj,
      email,
      telefone,
      inscricaoEstadual,
      inscricaoEstadualIsento,
      regimeTributario,
      logradouro,
      numero,
      complemento,
      bairro,
      municipio,
      codigoMunicipioIBGE,
      uf,
      cep,
    } = data;

    if (!razaoSocial || !nomeFantasia || !cnpj) {
      const error = new Error(
        "Razão social, nome fantasia e CNPJ são obrigatórios.",
      );
      error.status = 400;
      throw error;
    }

    return {
      razaoSocial,
      nomeFantasia,
      cnpj,
      email,
      telefone,
      inscricaoEstadual: inscricaoEstadual || null,
      inscricaoEstadualIsento: Boolean(inscricaoEstadualIsento),
      regimeTributario: regimeTributario || null,
      logradouro: logradouro || null,
      numero: numero || null,
      complemento: complemento || null,
      bairro: bairro || null,
      municipio: municipio || null,
      codigoMunicipioIBGE: codigoMunicipioIBGE || null,
      uf: uf || null,
      cep: cep || null,
    };
  }

  #naoEncontrada() {
    const error = new Error("Empresa não encontrada.");
    error.status = 404;
    return error;
  }
}

module.exports = new EmpresaService();