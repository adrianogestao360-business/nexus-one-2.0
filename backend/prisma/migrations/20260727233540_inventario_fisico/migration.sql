-- CreateTable
CREATE TABLE "Inventario" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'geral',
    "status" TEXT NOT NULL DEFAULT 'aberto',
    "empresaId" INTEGER NOT NULL,
    "localizacaoId" INTEGER,
    "produtoId" INTEGER,
    "observacao" TEXT,
    "criadoPorId" INTEGER,
    "fechadoEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventarioItem" (
    "id" SERIAL NOT NULL,
    "inventarioId" INTEGER NOT NULL,
    "produtoId" INTEGER NOT NULL,
    "localizacaoId" INTEGER NOT NULL,
    "quantidadeSistema" INTEGER NOT NULL,
    "quantidadeContada" INTEGER,
    "contadoEm" TIMESTAMP(3),

    CONSTRAINT "InventarioItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Inventario_empresaId_idx" ON "Inventario"("empresaId");

-- CreateIndex
CREATE INDEX "InventarioItem_inventarioId_idx" ON "InventarioItem"("inventarioId");

-- CreateIndex
CREATE UNIQUE INDEX "InventarioItem_inventarioId_produtoId_localizacaoId_key" ON "InventarioItem"("inventarioId", "produtoId", "localizacaoId");

-- AddForeignKey
ALTER TABLE "Inventario" ADD CONSTRAINT "Inventario_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventario" ADD CONSTRAINT "Inventario_localizacaoId_fkey" FOREIGN KEY ("localizacaoId") REFERENCES "Localizacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventario" ADD CONSTRAINT "Inventario_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventario" ADD CONSTRAINT "Inventario_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventarioItem" ADD CONSTRAINT "InventarioItem_inventarioId_fkey" FOREIGN KEY ("inventarioId") REFERENCES "Inventario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventarioItem" ADD CONSTRAINT "InventarioItem_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventarioItem" ADD CONSTRAINT "InventarioItem_localizacaoId_fkey" FOREIGN KEY ("localizacaoId") REFERENCES "Localizacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
