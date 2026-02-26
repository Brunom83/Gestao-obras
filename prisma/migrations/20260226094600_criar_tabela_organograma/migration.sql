/*
  Warnings:

  - You are about to drop the column `cargo` on the `funcionarios` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "funcionarios" DROP COLUMN "cargo",
ADD COLUMN     "cargoId" TEXT;

-- CreateTable
CREATE TABLE "cargos_organograma" (
    "id" TEXT NOT NULL,
    "departamento" TEXT NOT NULL,
    "subDepartamento" TEXT,
    "nome" TEXT NOT NULL,
    "isChefia" BOOLEAN NOT NULL DEFAULT false,
    "cor" TEXT NOT NULL DEFAULT '#2563eb',

    CONSTRAINT "cargos_organograma_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cargos_organograma_nome_key" ON "cargos_organograma"("nome");

-- AddForeignKey
ALTER TABLE "funcionarios" ADD CONSTRAINT "funcionarios_cargoId_fkey" FOREIGN KEY ("cargoId") REFERENCES "cargos_organograma"("id") ON DELETE SET NULL ON UPDATE CASCADE;
