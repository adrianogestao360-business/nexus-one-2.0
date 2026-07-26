class UsuarioDTO {
  static toResponse(usuario) {
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      ativo: usuario.ativo,
      empresaId: usuario.empresaId,

      empresa: usuario.empresa
        ? {
            id: usuario.empresa.id,
            razaoSocial: usuario.empresa.razaoSocial,
            nomeFantasia: usuario.empresa.nomeFantasia,
          }
        : null,

      papeis:
        usuario.usuarioPapeis?.map((item) => ({
          id: item.papel.id,
          nome: item.papel.nome,
        })) || [],
    };
  }

  static toCollection(usuarios) {
    return usuarios.map(this.toResponse);
  }
}

module.exports = UsuarioDTO;