-- CreateTable
CREATE TABLE "Devolucao" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "vendaId" INTEGER,
    "compraId" INTEGER,
    "valorTotal" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Devolucao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DevolucaoItem" (
    "id" SERIAL NOT NULL,
    "devolucaoId" INTEGER NOT NULL,
    "produtoId" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "valorUnitario" DECIMAL(12,2) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "DevolucaoItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Devolucao_empresaId_idx" ON "Devolucao"("empresaId");

-- CreateIndex
CREATE INDEX "DevolucaoItem_devolucaoId_idx" ON "DevolucaoItem"("devolucaoId");

-- AddForeignKey
ALTER TABLE "Devolucao" ADD CONSTRAINT "Devolucao_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Devolucao" ADD CONSTRAINT "Devolucao_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "Venda"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Devolucao" ADD CONSTRAINT "Devolucao_compraId_fkey" FOREIGN KEY ("compraId") REFERENCES "Compra"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DevolucaoItem" ADD CONSTRAINT "DevolucaoItem_devolucaoId_fkey" FOREIGN KEY ("devolucaoId") REFERENCES "Devolucao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DevolucaoItem" ADD CONSTRAINT "DevolucaoItem_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
