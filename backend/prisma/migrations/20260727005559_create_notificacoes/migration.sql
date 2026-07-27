-- AlterTable
ALTER TABLE "Produto" ADD COLUMN     "estoqueMinimo" INTEGER NOT NULL DEFAULT 5;

-- CreateTable
CREATE TABLE "NotificacaoLida" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "chave" TEXT NOT NULL,
    "lidaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificacaoLida_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NotificacaoLida_empresaId_idx" ON "NotificacaoLida"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificacaoLida_usuarioId_chave_key" ON "NotificacaoLida"("usuarioId", "chave");

-- AddForeignKey
ALTER TABLE "NotificacaoLida" ADD CONSTRAINT "NotificacaoLida_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificacaoLida" ADD CONSTRAINT "NotificacaoLida_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
