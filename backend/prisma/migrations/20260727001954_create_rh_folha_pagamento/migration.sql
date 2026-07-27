-- AlterTable
ALTER TABLE "Titulo" ADD COLUMN     "folhaPagamentoItemId" INTEGER;

-- CreateTable
CREATE TABLE "Cargo" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "empresaId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cargo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Funcionario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "cargoId" INTEGER,
    "salarioBase" DECIMAL(12,2) NOT NULL,
    "dataAdmissao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT,
    "telefone" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "empresaId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Funcionario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FolhaPagamento" (
    "id" SERIAL NOT NULL,
    "mes" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'aberta',
    "empresaId" INTEGER NOT NULL,
    "fechadaEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FolhaPagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FolhaPagamentoItem" (
    "id" SERIAL NOT NULL,
    "folhaId" INTEGER NOT NULL,
    "funcionarioId" INTEGER NOT NULL,
    "proventos" DECIMAL(12,2) NOT NULL,
    "descontos" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "valorLiquido" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "FolhaPagamentoItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Cargo_empresaId_idx" ON "Cargo"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "Cargo_empresaId_nome_key" ON "Cargo"("empresaId", "nome");

-- CreateIndex
CREATE INDEX "Funcionario_empresaId_idx" ON "Funcionario"("empresaId");

-- CreateIndex
CREATE INDEX "FolhaPagamento_empresaId_idx" ON "FolhaPagamento"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "FolhaPagamento_empresaId_mes_ano_key" ON "FolhaPagamento"("empresaId", "mes", "ano");

-- CreateIndex
CREATE UNIQUE INDEX "FolhaPagamentoItem_folhaId_funcionarioId_key" ON "FolhaPagamentoItem"("folhaId", "funcionarioId");

-- AddForeignKey
ALTER TABLE "Titulo" ADD CONSTRAINT "Titulo_folhaPagamentoItemId_fkey" FOREIGN KEY ("folhaPagamentoItemId") REFERENCES "FolhaPagamentoItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cargo" ADD CONSTRAINT "Cargo_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Funcionario" ADD CONSTRAINT "Funcionario_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Funcionario" ADD CONSTRAINT "Funcionario_cargoId_fkey" FOREIGN KEY ("cargoId") REFERENCES "Cargo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FolhaPagamento" ADD CONSTRAINT "FolhaPagamento_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FolhaPagamentoItem" ADD CONSTRAINT "FolhaPagamentoItem_folhaId_fkey" FOREIGN KEY ("folhaId") REFERENCES "FolhaPagamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FolhaPagamentoItem" ADD CONSTRAINT "FolhaPagamentoItem_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "Funcionario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
