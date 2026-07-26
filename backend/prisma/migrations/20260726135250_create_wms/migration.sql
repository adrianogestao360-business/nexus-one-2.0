-- AlterTable
ALTER TABLE "Produto" ADD COLUMN     "endereco" TEXT,
ADD COLUMN     "zonaId" INTEGER;

-- CreateTable
CREATE TABLE "Zona" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Zona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Separacao" (
    "id" SERIAL NOT NULL,
    "vendaId" INTEGER NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "separadorId" INTEGER,
    "iniciadoEm" TIMESTAMP(3),
    "concluidoEm" TIMESTAMP(3),
    "expedidoEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Separacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeparacaoItem" (
    "id" SERIAL NOT NULL,
    "separacaoId" INTEGER NOT NULL,
    "produtoId" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "separado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SeparacaoItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Zona_empresaId_nome_key" ON "Zona"("empresaId", "nome");

-- CreateIndex
CREATE UNIQUE INDEX "Separacao_vendaId_key" ON "Separacao"("vendaId");

-- CreateIndex
CREATE INDEX "Separacao_empresaId_idx" ON "Separacao"("empresaId");

-- CreateIndex
CREATE INDEX "SeparacaoItem_separacaoId_idx" ON "SeparacaoItem"("separacaoId");

-- AddForeignKey
ALTER TABLE "Produto" ADD CONSTRAINT "Produto_zonaId_fkey" FOREIGN KEY ("zonaId") REFERENCES "Zona"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Zona" ADD CONSTRAINT "Zona_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Separacao" ADD CONSTRAINT "Separacao_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Separacao" ADD CONSTRAINT "Separacao_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "Venda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Separacao" ADD CONSTRAINT "Separacao_separadorId_fkey" FOREIGN KEY ("separadorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeparacaoItem" ADD CONSTRAINT "SeparacaoItem_separacaoId_fkey" FOREIGN KEY ("separacaoId") REFERENCES "Separacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeparacaoItem" ADD CONSTRAINT "SeparacaoItem_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
