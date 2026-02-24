-- AlterTable
ALTER TABLE "materiais" ADD COLUMN     "categoria" TEXT,
ADD COLUMN     "classe" TEXT,
ADD COLUMN     "comprimento" TEXT,
ADD COLUMN     "diametro" TEXT,
ADD COLUMN     "fichaUrl" TEXT,
ADD COLUMN     "fotoUrl" TEXT,
ADD COLUMN     "norma" TEXT,
ADD COLUMN     "referenciaInterna" TEXT,
ADD COLUMN     "tratamento" TEXT,
ALTER COLUMN "unidade" SET DEFAULT 'un';
