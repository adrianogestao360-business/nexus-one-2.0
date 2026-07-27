-- AlterTable
ALTER TABLE "Entrega" ADD COLUMN     "rotaId" INTEGER;

-- AlterTable
ALTER TABLE "Veiculo" ADD COLUMN     "kmMedioPorLitro" DECIMAL(6,2);

-- CreateTable
CREATE TABLE "Rota" (
    "id" SERIAL NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "veiculoId" INTEGER NOT NULL,
    "motoristaId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'em_andamento',
    "tokenRastreio" TEXT NOT NULL,
    "kmPercorrido" DECIMAL(10,2),
    "custoEstimado" DECIMAL(10,2),
    "ultimaLatitude" DOUBLE PRECISION,
    "ultimaLongitude" DOUBLE PRECISION,
    "ultimaPosicaoEm" TIMESTAMP(3),
    "iniciadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "concluidaEm" TIMESTAMP(3),

    CONSTRAINT "Rota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PosicaoMotorista" (
    "id" SERIAL NOT NULL,
    "rotaId" INTEGER NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "registradoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PosicaoMotorista_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Abastecimento" (
    "id" SERIAL NOT NULL,
    "veiculoId" INTEGER NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "valorLitro" DECIMAL(8,3) NOT NULL,
    "litros" DECIMAL(8,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Abastecimento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rota_tokenRastreio_key" ON "Rota"("tokenRastreio");

-- CreateIndex
CREATE INDEX "Rota_empresaId_idx" ON "Rota"("empresaId");

-- CreateIndex
CREATE INDEX "PosicaoMotorista_rotaId_idx" ON "PosicaoMotorista"("rotaId");

-- CreateIndex
CREATE INDEX "Abastecimento_veiculoId_idx" ON "Abastecimento"("veiculoId");

-- AddForeignKey
ALTER TABLE "Rota" ADD CONSTRAINT "Rota_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rota" ADD CONSTRAINT "Rota_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "Veiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rota" ADD CONSTRAINT "Rota_motoristaId_fkey" FOREIGN KEY ("motoristaId") REFERENCES "Motorista"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosicaoMotorista" ADD CONSTRAINT "PosicaoMotorista_rotaId_fkey" FOREIGN KEY ("rotaId") REFERENCES "Rota"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Abastecimento" ADD CONSTRAINT "Abastecimento_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "Veiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Abastecimento" ADD CONSTRAINT "Abastecimento_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entrega" ADD CONSTRAINT "Entrega_rotaId_fkey" FOREIGN KEY ("rotaId") REFERENCES "Rota"("id") ON DELETE SET NULL ON UPDATE CASCADE;
