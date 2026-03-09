-- CreateTable
CREATE TABLE "LogInventario" (
    "id" TEXT NOT NULL,
    "materialId" TEXT,
    "userId" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "quantidadeMov" DOUBLE PRECISION NOT NULL,
    "stockAnterior" DOUBLE PRECISION,
    "stockNovo" DOUBLE PRECISION,
    "detalhes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogInventario_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LogInventario" ADD CONSTRAINT "LogInventario_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materiais"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogInventario" ADD CONSTRAINT "LogInventario_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
