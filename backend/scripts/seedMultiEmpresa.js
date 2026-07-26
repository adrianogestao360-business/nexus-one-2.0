require("dotenv").config();

const prisma = require("../src/config/prisma");

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
  "auditoria.visualizar",
];

async function seedMultiEmpresa() {
  const email = "admin@nexusone.com";

  const admin = await prisma.usuario.findUnique({ where: { email } });

  if (!admin) {
    throw new Error(
      `Usuário ${email} não encontrado. Rode createAdmin.js primeiro.`,
    );
  }

  const filial = await prisma.empresa.upsert({
    where: { cnpj: "22.222.222/0001-22" },
    update: {},
    create: {
      razaoSocial: "Nexus One Filial SP Ltda",
      nomeFantasia: "Nexus One Filial SP",
      cnpj: "22.222.222/0001-22",
    },
  });

  const papelFilial = await prisma.papel.upsert({
    where: {
      empresaId_nome: { empresaId: filial.id, nome: "Administrador" },
    },
    update: {},
    create: {
      nome: "Administrador",
      descricao: "Acesso administrativo à Filial SP",
      empresaId: filial.id,
    },
  });

  for (const codigo of codigosPermissoes) {
    const permissao = await prisma.permissao.upsert({
      where: { codigo },
      update: {},
      create: { codigo },
    });

    await prisma.papelPermissao.upsert({
      where: {
        papelId_permissaoId: {
          papelId: papelFilial.id,
          permissaoId: permissao.id,
        },
      },
      update: {},
      create: { papelId: papelFilial.id, permissaoId: permissao.id },
    });
  }

  await prisma.usuarioPapel.upsert({
    where: {
      usuarioId_papelId: { usuarioId: admin.id, papelId: papelFilial.id },
    },
    update: {},
    create: { usuarioId: admin.id, papelId: papelFilial.id },
  });

  console.log("Empresa Filial SP criada e vinculada ao admin.");
  console.log(`Empresa ID: ${filial.id}`);
  console.log(`Papel ID: ${papelFilial.id}`);
  console.log(`Usuário ${email} agora acessa a empresa ${admin.empresaId} (home) e a ${filial.id} (Filial SP).`);
}

seedMultiEmpresa()
  .catch((error) => {
    console.error("Erro ao criar empresa filial:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
