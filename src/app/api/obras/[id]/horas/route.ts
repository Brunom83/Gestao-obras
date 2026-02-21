import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const obraId = resolvedParams.id;
    
    const body = await request.json()
    const { funcionarioId, horas, data, descricao } = body

    if (!funcionarioId || !horas || horas <= 0) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 })
    }

    // 1. Vai buscar o trabalhador para saber qual é o seu custo por hora
    const funcionario = await prisma.funcionario.findUnique({ where: { id: funcionarioId } })
    if (!funcionario) {
      return NextResponse.json({ error: "Trabalhador não encontrado." }, { status: 404 })
    }

    // A Matemática: Custo = Horas trabalhadas * Custo por hora do funcionário
    const custoAdicional = Number(horas) * funcionario.custoHora

    // 2. Transação (Atomic Operation): Grava as horas e soma o custo à obra ao mesmo tempo
    const resultado = await prisma.$transaction([
      prisma.registoHoras.create({
        data: {
          obraId,
          funcionarioId,
          horas: Number(horas),
          data: data ? new Date(data) : new Date(),
          descricao
        }
      }),
      prisma.obra.update({
        where: { id: obraId },
        data: { custoTotal: { increment: custoAdicional } }
      })
    ])

    return NextResponse.json(resultado[0], { status: 201 })
  } catch (error) {
    console.error("Erro ao registar horas:", error)
    return NextResponse.json({ error: "Erro interno do servidor HP" }, { status: 500 })
  }
}

// Rota DELETE: Apaga a obra inteira
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    
    // O Cascade na base de dados (que metemos no schema) vai garantir 
    // que as horas, materiais e documentos desta obra também são limpos automaticamente!
    await prisma.obra.delete({
      where: { id: resolvedParams.id }
    })
    
    return NextResponse.json({ message: "Obra eliminada com sucesso" }, { status: 200 })
  } catch (error) {
    console.error("Erro ao eliminar obra:", error)
    return NextResponse.json({ error: "Erro interno do servidor HP." }, { status: 500 })
  }
}