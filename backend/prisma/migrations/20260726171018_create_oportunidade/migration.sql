-- CreateTable
CREATE TABLE "Oportunidade" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "estagio" TEXT NOT NULL DEFAULT 'novo',
    "observacoes" TEXT,
    "motivoPerda" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Oportunidade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Oportunidade_empresaId_idx" ON "Oportunidade"("empresaId");

-- AddForeignKey
ALTER TABLE "Oportunidade" ADD CONSTRAINT "Oportunidade_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Oportunidade" ADD CONSTRAINT "Oportunidade_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
