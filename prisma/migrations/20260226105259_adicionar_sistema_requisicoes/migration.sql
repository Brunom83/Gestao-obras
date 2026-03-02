-- CreateTable
CREATE TABLE "pedidos_material" (
    "id" TEXT NOT NULL,
    "quantidade" DOUBLE PRECISION NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PENDENTE',
    "dataPedido" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataResposta" TIMESTAMP(3),
    "obraId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "requisitanteId" TEXT NOT NULL,
    "aprovadorId" TEXT,

    CONSTRAINT "pedidos_material_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pedidos_material" ADD CONSTRAINT "pedidos_material_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "obras"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos_material" ADD CONSTRAINT "pedidos_material_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materiais"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos_material" ADD CONSTRAINT "pedidos_material_requisitanteId_fkey" FOREIGN KEY ("requisitanteId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos_material" ADD CONSTRAINT "pedidos_material_aprovadorId_fkey" FOREIGN KEY ("aprovadorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
