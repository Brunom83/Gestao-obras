-- CreateTable
CREATE TABLE "equipas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funcionarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "custoHora" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "equipaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "funcionarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipas_obra" (
    "id" TEXT NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataFim" TIMESTAMP(3),
    "obraId" TEXT NOT NULL,
    "equipaId" TEXT NOT NULL,

    CONSTRAINT "equipas_obra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registos_horas" (
    "id" TEXT NOT NULL,
    "quantidade" DOUBLE PRECISION NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descricao" TEXT,
    "funcionarioId" TEXT NOT NULL,
    "obraId" TEXT NOT NULL,

    CONSTRAINT "registos_horas_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "funcionarios" ADD CONSTRAINT "funcionarios_equipaId_fkey" FOREIGN KEY ("equipaId") REFERENCES "equipas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipas_obra" ADD CONSTRAINT "equipas_obra_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "obras"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipas_obra" ADD CONSTRAINT "equipas_obra_equipaId_fkey" FOREIGN KEY ("equipaId") REFERENCES "equipas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registos_horas" ADD CONSTRAINT "registos_horas_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "funcionarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registos_horas" ADD CONSTRAINT "registos_horas_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "obras"("id") ON DELETE CASCADE ON UPDATE CASCADE;
