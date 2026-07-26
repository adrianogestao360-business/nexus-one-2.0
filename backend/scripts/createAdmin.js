require("dotenv").config();

const bcrypt = require("bcrypt");
const prisma = require("../src/config/prisma");

async function createAdmin() {
  const empresa = await prisma.empresa.findFirst({
    orderBy: {
      id: "asc",
    },
  });

  if (!empresa) {
    throw new Error(
      "Nenhuma empresa cadastrada. Cadastre uma empresa antes de criar o administrador.",
    );
  }

  const papelAdministrador = await prisma.papel.upsert({
    where: {
      empresaId_nome: {
        empresaId: empresa.id,
        nome: "Administrador",
      },
    },
    update: {},
    create: {
      nome: "Administrador",
      descricao: "Acesso administrativo ao Nexus One ERP",
      empresaId: empresa.id,
    },
  });

  const codigosPermissoes = [
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
  ];

  for (const codigo of codigosPermissoes) {
    const permissao = await prisma.permissao.upsert({
      where: {
        codigo,
      },
      update: {},
      create: {
        codigo,
      },
    });

    await prisma.papelPermissao.upsert({
      where: {
        papelId_permissaoId: {
          papelId: papelAdministrador.id,
          permissaoId: permissao.id,
        },
      },
      update: {},
      create: {
        papelId: papelAdministrador.id,
        permissaoId: permissao.id,
      },
    });
  }

  console.log("Papel Administrador e permissões atualizados.");

  const email = "admin@nexusone.com";
  const senha = "Admin@123";

  const usuarioExistente = await prisma.usuario.findUnique({
    where: {
      email,
    },
  });

  if (usuarioExistente) {
    console.log("Usuário administrador já existe.");
    return;
  }

  const senhaHash = await bcrypt.hash(senha, 12);

  const usuario = await prisma.usuario.create({
    data: {
      nome: "Administrador",
      email,
      senha: senhaHash,
      empresaId: empresa.id,
      usuarioPapeis: {
        create: {
          papelId: papelAdministrador.id,
        },
      },
    },
  });

  console.log("Administrador criado com sucesso.");
  console.log(`E-mail: ${email}`);
  console.log(`Senha: ${senha}`);
  console.log(`Empresa ID: ${empresa.id}`);
  console.log(`Usuário ID: ${usuario.id}`);
}

createAdmin()
  .catch((error) => {
    console.error("Erro ao criar administrador:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });