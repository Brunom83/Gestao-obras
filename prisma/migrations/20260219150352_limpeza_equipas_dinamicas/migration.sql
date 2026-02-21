/*
  Warnings:

  - You are about to drop the column `equipaId` on the `funcionarios` table. All the data in the column will be lost.
  - You are about to drop the column `quantidade` on the `registos_horas` table. All the data in the column will be lost.
  - You are about to drop the `equipas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `equipas_obra` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `horas` to the `registos_horas` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "equipas_obra" DROP CONSTRAINT "equipas_obra_equipaId_fkey";

-- DropForeignKey
ALTER TABLE "equipas_obra" DROP CONSTRAINT "equipas_obra_obraId_fkey";

-- DropForeignKey
ALTER TABLE "funcionarios" DROP CONSTRAINT "funcionarios_equipaId_fkey";

-- AlterTable
ALTER TABLE "funcionarios" DROP COLUMN "equipaId";

-- AlterTable
ALTER TABLE "registos_horas" DROP COLUMN "quantidade",
ADD COLUMN     "horas" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "registadoPor" TEXT;

-- DropTable
DROP TABLE "equipas";

-- DropTable
DROP TABLE "equipas_obra";
