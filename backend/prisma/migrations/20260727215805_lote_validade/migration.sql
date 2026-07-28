-- AlterTable
ALTER TABLE "MovimentoEstoque" ADD COLUMN     "loteId" INTEGER;

-- AlterTable
ALTER TABLE "Produto" ADD COLUMN     "controlaLote" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Lote" (
    "id" SERIAL NOT NULL,
    "produtoId" INTEGER NOT NULL,
    "numero" TEXT NOT NULL,
    "dataValidade" TIMESTAMP(3),
    "quantidade" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "empresaId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lote_empresaId_idx" ON "Lote"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "Lote_produtoId_numero_key" ON "Lote"("produtoId", "numero");

-- AddForeignKey
ALTER TABLE "MovimentoEstoque" ADD CONSTRAINT "MovimentoEstoque_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "Lote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lote" ADD CONSTRAINT "Lote_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lote" ADD CONSTRAINT "Lote_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
