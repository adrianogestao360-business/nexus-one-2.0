-- CreateTable
CREATE TABLE "Conferencia" (
    "id" SERIAL NOT NULL,
    "compraId" INTEGER NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'aberta',
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "concluidaEm" TIMESTAMP(3),

    CONSTRAINT "Conferencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConferenciaItem" (
    "id" SERIAL NOT NULL,
    "conferenciaId" INTEGER NOT NULL,
    "produtoId" INTEGER NOT NULL,
    "localizacaoId" INTEGER NOT NULL,
    "quantidadePedida" INTEGER NOT NULL,
    "quantidadeRecebida" INTEGER,
    "conferidoEm" TIMESTAMP(3),

    CONSTRAINT "ConferenciaItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Conferencia_empresaId_idx" ON "Conferencia"("empresaId");

-- CreateIndex
CREATE INDEX "Conferencia_compraId_idx" ON "Conferencia"("compraId");

-- CreateIndex
CREATE INDEX "ConferenciaItem_conferenciaId_idx" ON "ConferenciaItem"("conferenciaId");

-- AddForeignKey
ALTER TABLE "Conferencia" ADD CONSTRAINT "Conferencia_compraId_fkey" FOREIGN KEY ("compraId") REFERENCES "Compra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conferencia" ADD CONSTRAINT "Conferencia_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConferenciaItem" ADD CONSTRAINT "ConferenciaItem_conferenciaId_fkey" FOREIGN KEY ("conferenciaId") REFERENCES "Conferencia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConferenciaItem" ADD CONSTRAINT "ConferenciaItem_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConferenciaItem" ADD CONSTRAINT "ConferenciaItem_localizacaoId_fkey" FOREIGN KEY ("localizacaoId") REFERENCES "Localizacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
