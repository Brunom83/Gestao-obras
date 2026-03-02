/*
  Warnings:

  - You are about to drop the column `custoHora` on the `funcionarios` table. All the data in the column will be lost.
  - You are about to drop the `registos_horas` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "pedidos_material" DROP CONSTRAINT "pedidos_material_requisitanteId_fkey";

-- DropForeignKey
ALTER TABLE "registos_horas" DROP CONSTRAINT "registos_horas_funcionarioId_fkey";

-- DropForeignKey
ALTER TABLE "registos_horas" DROP CONSTRAINT "registos_horas_obraId_fkey";

-- AlterTable
ALTER TABLE "funcionarios" DROP COLUMN "custoHora";

-- DropTable
DROP TABLE "registos_horas";

-- AddForeignKey
ALTER TABLE "pedidos_material" ADD CONSTRAINT "pedidos_material_requisitanteId_fkey" FOREIGN KEY ("requisitanteId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
