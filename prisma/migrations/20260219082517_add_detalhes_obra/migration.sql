-- AlterTable
ALTER TABLE "obras" ADD COLUMN     "custoTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "orcamento" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "materiais_obra" (
    "id" TEXT NOT NULL,
    "quantidade" DOUBLE PRECISION NOT NULL,
    "dataRegisto" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "obraId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,

    CONSTRAINT "materiais_obra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos" (
    "id" TEXT NOT NULL,
    "nomeOriginal" TEXT NOT NULL,
    "caminhoFicheiro" TEXT NOT NULL,
    "tamanho" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "dataUpload" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "obraId" TEXT NOT NULL,

    CONSTRAINT "documentos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "materiais_obra" ADD CONSTRAINT "materiais_obra_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "obras"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materiais_obra" ADD CONSTRAINT "materiais_obra_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materiais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "obras"("id") ON DELETE CASCADE ON UPDATE CASCADE;
