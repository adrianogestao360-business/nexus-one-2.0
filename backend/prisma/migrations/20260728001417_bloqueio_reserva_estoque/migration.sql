-- AlterTable
ALTER TABLE "EstoqueLocalizacao" ADD COLUMN     "quantidadeBloqueada" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "quantidadeReservada" INTEGER NOT NULL DEFAULT 0;
