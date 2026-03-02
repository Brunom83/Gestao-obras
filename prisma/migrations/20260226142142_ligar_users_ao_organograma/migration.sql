-- AlterTable
ALTER TABLE "User" ADD COLUMN     "cargoId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_cargoId_fkey" FOREIGN KEY ("cargoId") REFERENCES "cargos_organograma"("id") ON DELETE SET NULL ON UPDATE CASCADE;
