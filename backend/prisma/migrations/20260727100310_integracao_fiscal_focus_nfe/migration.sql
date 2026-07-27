-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "bairro" TEXT,
ADD COLUMN     "cep" TEXT,
ADD COLUMN     "codigoMunicipioIBGE" TEXT,
ADD COLUMN     "complemento" TEXT,
ADD COLUMN     "logradouro" TEXT,
ADD COLUMN     "municipio" TEXT,
ADD COLUMN     "numero" TEXT,
ADD COLUMN     "tipoDocumento" TEXT,
ADD COLUMN     "uf" TEXT;

-- AlterTable
ALTER TABLE "Empresa" ADD COLUMN     "bairro" TEXT,
ADD COLUMN     "cep" TEXT,
ADD COLUMN     "codigoMunicipioIBGE" TEXT,
ADD COLUMN     "complemento" TEXT,
ADD COLUMN     "inscricaoEstadual" TEXT,
ADD COLUMN     "inscricaoEstadualIsento" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "logradouro" TEXT,
ADD COLUMN     "municipio" TEXT,
ADD COLUMN     "numero" TEXT,
ADD COLUMN     "regimeTributario" TEXT,
ADD COLUMN     "uf" TEXT;

-- AlterTable
ALTER TABLE "NotaFiscal" DROP COLUMN "chave",
ADD COLUMN     "ambiente" TEXT,
ADD COLUMN     "chaveAcesso" TEXT,
ADD COLUMN     "danfeUrl" TEXT,
ADD COLUMN     "dataAutorizacao" TIMESTAMP(3),
ADD COLUMN     "motivoStatus" TEXT,
ADD COLUMN     "protocoloAutorizacao" TEXT,
ADD COLUMN     "ref" TEXT,
ADD COLUMN     "serie" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "xmlUrl" TEXT;

-- AlterTable
ALTER TABLE "Produto" ADD COLUMN     "cest" TEXT,
ADD COLUMN     "cfop" TEXT,
ADD COLUMN     "ncm" TEXT,
ADD COLUMN     "origem" INTEGER DEFAULT 0;

-- CreateTable
CREATE TABLE "IntegracaoFiscal" (
    "id" SERIAL NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "provedor" TEXT NOT NULL DEFAULT 'focus_nfe',
    "token" TEXT,
    "ambiente" TEXT NOT NULL DEFAULT 'homologacao',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegracaoFiscal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IntegracaoFiscal_empresaId_key" ON "IntegracaoFiscal"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "NotaFiscal_ref_key" ON "NotaFiscal"("ref");

-- AddForeignKey
ALTER TABLE "IntegracaoFiscal" ADD CONSTRAINT "IntegracaoFiscal_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

