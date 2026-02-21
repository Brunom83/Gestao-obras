-- CreateTable
CREATE TABLE "obras" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "localizacao" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'EM_CURSO',
    "dataInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataFim" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "obras_pkey" PRIMARY KEY ("id")
);
