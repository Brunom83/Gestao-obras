import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Rota POST: Usada APENAS para alocar novo material à obra
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const obraId = resolvedParams.id;
    
    const body = await request.json()
    const { materialId, quantidade } = body

    if (!materialId || !quantidade || quantidade <= 0) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 })
    }

    const materialDB = await prisma.material.findUnique({ where: { id: materialId } })
    if (!materialDB || materialDB.quantidade < quantidade) {
      return NextResponse.json({ error: "Stock insuficiente no armazém." }, { status: 400 })
    }

    const resultado = await prisma.$transaction([
      prisma.materialObra.create({
        data: { obraId, materialId, quantidade: Number(quantidade) }
      }),
      prisma.material.update({
        where: { id: materialId },
        data: { quantidade: materialDB.quantidade - quantidade }
      })
    ])

    return NextResponse.json(resultado[0], { status: 201 })
  } catch (error) {
    console.error("Erro ao alocar material:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}