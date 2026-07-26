const prisma = require("../config/prisma");

const AuditoriaRepository = require("../repositories/AuditoriaRepository");

class AuditoriaService {
  async listar(empresaId, filtros) {
    return AuditoriaRepository.listar(empresaId, filtros);
  }

  async registrar({
    empresaId,
    usuarioId,
    acao,
    entidade,
    entidadeId,
    detalhes,
    ip,
  }) {
    try {
      await AuditoriaRepository.criar({
        empresaId: empresaId || null,
        usuarioId: usuarioId || null,
        acao,
        entidade,
        entidadeId: entidadeId || null,
        detalhes: detalhes || undefined,
        ip: ip || null,
      });
    } catch (error) {
      console.error("Erro ao registrar log de auditoria:", error);
    }
  }

  async registrarLoginFalho(email, ip) {
    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (!usuario) {
      return;
    }

    await this.registrar({
      empresaId: usuario.empresaId,
      usuarioId: usuario.id,
      acao: "login_falhou",
      entidade: "Usuario",
      entidadeId: usuario.id,
      ip,
    });
  }
}

module.exports = new AuditoriaService();
