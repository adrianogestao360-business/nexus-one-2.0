-- AlterTable
ALTER TABLE "Produto" ADD COLUMN     "peso" DECIMAL(10,3);

-- CreateTable
CREATE TABLE "Romaneio" (
    "id" SERIAL NOT NULL,
    "separacaoId" INTEGER NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "veiculoId" INTEGER NOT NULL,
    "motoristaId" INTEGER NOT NULL,
    "volumes" INTEGER NOT NULL DEFAULT 1,
    "pesoTotal" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Romaneio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Romaneio_separacaoId_key" ON "Romaneio"("separacaoId");

-- CreateIndex
CREATE INDEX "Romaneio_empresaId_idx" ON "Romaneio"("empresaId");

-- AddForeignKey
ALTER TABLE "Romaneio" ADD CONSTRAINT "Romaneio_separacaoId_fkey" FOREIGN KEY ("separacaoId") REFERENCES "Separacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Romaneio" ADD CONSTRAINT "Romaneio_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Romaneio" ADD CONSTRAINT "Romaneio_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "Veiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Romaneio" ADD CONSTRAINT "Romaneio_motoristaId_fkey" FOREIGN KEY ("motoristaId") REFERENCES "Motorista"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
