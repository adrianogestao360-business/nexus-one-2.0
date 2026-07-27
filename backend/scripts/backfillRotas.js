require("dotenv").config();

const crypto = require("crypto");
const prisma = require("../src/config/prisma");

async function backfillRotas() {
  const entregasSemRota = await prisma.entrega.findMany({
    where: { rotaId: null },
  });

  for (const entrega of entregasSemRota) {
    const rota = await prisma.rota.create({
      data: {
        empresaId: entrega.empresaId,
        veiculoId: entrega.veiculoId,
        motoristaId: entrega.motoristaId,
        status: entrega.status === "entregue" ? "concluida" : "em_andamento",
        tokenRastreio: crypto.randomUUID(),
        iniciadaEm: entrega.dataSaida,
        concluidaEm: entrega.status === "entregue" ? entrega.dataEntrega : null,
      },
    });

    await prisma.entrega.update({
      where: { id: entrega.id },
      data: { rotaId: rota.id },
    });
  }

  console.log(
    `${entregasSemRota.length} entrega(s) migrada(s) para rotas individuais.`,
  );
}

backfillRotas()
  .then(() => {
    console.log("Backfill concluído.");
    return prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Erro no backfill:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
