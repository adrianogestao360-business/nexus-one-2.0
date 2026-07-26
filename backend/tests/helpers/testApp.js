const bcrypt = require("bcrypt");
const request = require("supertest");

const app = require("../../src/app");
const prisma = require("../../src/config/prisma");

const TODAS_PERMISSOES = [
  "empresas.gerenciar",
  "usuarios.gerenciar",
  "produtos.gerenciar",
  "clientes.gerenciar",
  "fornecedores.gerenciar",
  "vendas.gerenciar",
  "compras.gerenciar",
  "financeiro.gerenciar",
  "estoque.gerenciar",
  "wms.gerenciar",
  "frota.gerenciar",
  "papeis.gerenciar",
  "notas-fiscais.gerenciar",
  "crm.gerenciar",
  "auditoria.visualizar",
];

let contador = 0;

function sufixoUnico() {
  contador += 1;
  return `${Date.now()}-${contador}`;
}

async function criarEmpresaComAdmin(permissoes = TODAS_PERMISSOES) {
  const sufixo = sufixoUnico();

  const empresa = await prisma.empresa.create({
    data: {
      razaoSocial: `Empresa Teste ${sufixo}`,
      nomeFantasia: `Teste ${sufixo}`,
      cnpj: `TEST-${sufixo}`,
    },
  });

  const papel = await prisma.papel.create({
    data: {
      nome: "Administrador",
      empresaId: empresa.id,
    },
  });

  for (const codigo of permissoes) {
    const permissao = await prisma.permissao.upsert({
      where: { codigo },
      update: {},
      create: { codigo },
    });

    await prisma.papelPermissao.create({
      data: { papelId: papel.id, permissaoId: permissao.id },
    });
  }

  const senha = "Senha@123";
  const senhaHash = await bcrypt.hash(senha, 4);

  const usuario = await prisma.usuario.create({
    data: {
      nome: `Admin ${sufixo}`,
      email: `admin-${sufixo}@teste.com`,
      senha: senhaHash,
      empresaId: empresa.id,
      usuarioPapeis: {
        create: { papelId: papel.id },
      },
    },
  });

  const loginResponse = await request(app)
    .post("/auth/login")
    .send({ email: usuario.email, senha });

  return {
    empresa,
    papel,
    usuario,
    senha,
    token: loginResponse.body.accessToken,
  };
}

async function adicionarUsuario(empresa, papel) {
  const sufixo = sufixoUnico();
  const senha = "Senha@123";
  const senhaHash = await bcrypt.hash(senha, 4);

  const usuario = await prisma.usuario.create({
    data: {
      nome: `Usuario ${sufixo}`,
      email: `usuario-${sufixo}@teste.com`,
      senha: senhaHash,
      empresaId: empresa.id,
      usuarioPapeis: {
        create: { papelId: papel.id },
      },
    },
  });

  const loginResponse = await request(app)
    .post("/auth/login")
    .send({ email: usuario.email, senha });

  return { usuario, senha, token: loginResponse.body.accessToken };
}

module.exports = {
  app,
  prisma,
  criarEmpresaComAdmin,
  adicionarUsuario,
  sufixoUnico,
};
