-- CreateTable
CREATE TABLE "Entrega" (
    "id" SERIAL NOT NULL,
    "separacaoId" INTEGER NOT NULL,
    "veiculoId" INTEGER NOT NULL,
    "motoristaId" INTEGER NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'em_rota',
    "dataSaida" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataEntrega" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Entrega_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Entrega_separacaoId_key" ON "Entrega"("separacaoId");

-- CreateIndex
CREATE INDEX "Entrega_empresaId_idx" ON "Entrega"("empresaId");

-- AddForeignKey
ALTER TABLE "Entrega" ADD CONSTRAINT "Entrega_separacaoId_fkey" FOREIGN KEY ("separacaoId") REFERENCES "Separacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entrega" ADD CONSTRAINT "Entrega_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "Veiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entrega" ADD CONSTRAINT "Entrega_motoristaId_fkey" FOREIGN KEY ("motoristaId") REFERENCES "Motorista"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entrega" ADD CONSTRAINT "Entrega_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
