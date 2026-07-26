require("dotenv").config();

const prisma = require("../src/config/prisma");

async function backfillEstoqueLocalizacao() {
  const empresas = await prisma.empresa.findMany();

  for (const empresa of empresas) {
    const geral = await prisma.localizacao.upsert({
      where: {
        empresaId_codigo: {
          empresaId: empresa.id,
          codigo: "GERAL",
        },
      },
      update: {},
      create: {
        codigo: "GERAL",
        empresaId: empresa.id,
      },
    });

    const produtos = await prisma.produto.findMany({
      where: {
        empresaId: empresa.id,
        estoque: {
          gt: 0,
        },
      },
    });

    for (const produto of produtos) {
      await prisma.estoqueLocalizacao.upsert({
        where: {
          produtoId_localizacaoId: {
            produtoId: produto.id,
            localizacaoId: geral.id,
          },
        },
        update: {
          quantidade: produto.estoque,
        },
        create: {
          produtoId: produto.id,
          localizacaoId: geral.id,
          empresaId: empresa.id,
          quantidade: produto.estoque,
        },
      });
    }

    console.log(
      `Empresa ${empresa.id} (${empresa.razaoSocial}): ${produtos.length} produto(s) migrado(s) para a localização GERAL (id ${geral.id}).`,
    );
  }
}

backfillEstoqueLocalizacao()
  .then(() => {
    console.log("Backfill concluído.");
    return prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Erro no backfill:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
