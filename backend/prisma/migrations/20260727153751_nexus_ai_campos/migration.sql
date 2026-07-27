-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "limiteCredito" DECIMAL(12,2);

-- AlterTable
ALTER TABLE "Veiculo" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'disponivel';
