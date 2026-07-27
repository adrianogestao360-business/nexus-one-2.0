-- AlterTable
ALTER TABLE "Venda" ADD COLUMN     "vendedorId" INTEGER;

-- CreateTable
CREATE TABLE "MetaVenda" (
    "id" SERIAL NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "valorMeta" DECIMAL(12,2) NOT NULL,
    "percentualComissao" DECIMAL(5,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MetaVenda_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MetaVenda_empresaId_idx" ON "MetaVenda"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "MetaVenda_usuarioId_mes_ano_key" ON "MetaVenda"("usuarioId", "mes", "ano");

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetaVenda" ADD CONSTRAINT "MetaVenda_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetaVenda" ADD CONSTRAINT "MetaVenda_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
