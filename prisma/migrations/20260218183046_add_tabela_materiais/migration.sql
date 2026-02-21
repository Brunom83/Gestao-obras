-- CreateTable
CREATE TABLE "materiais" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "medidas" TEXT,
    "quantidade" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unidade" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "materiais_pkey" PRIMARY KEY ("id")
);
