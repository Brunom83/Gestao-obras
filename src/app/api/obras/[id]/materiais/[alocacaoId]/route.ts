import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Rota DELETE: Remove o material da obra e devolve o stock ao armazém
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string, alocacaoId: string }> }
) {
  try {
    const resolvedParams = await params;
    const { alocacaoId } = resolvedParams;

    // 1. Encontra o registo da alocação
    const alocacao = await prisma.materialObra.findUnique({
      where: { id: alocacaoId }
    })

    if (!alocacao) {
      return NextResponse.json({ error: "Registo não encontrado." }, { status: 404 })
    }

    // 2. Transação: Devolve o stock E apaga a alocação em simultâneo
    await prisma.$transaction([
      prisma.material.update({
        where: { id: alocacao.materialId },
        data: { quantidade: { increment: alocacao.quantidade } }
      }),
      prisma.materialObra.delete({
        where: { id: alocacaoId }
      })
    ])

    return NextResponse.json({ message: "Material devolvido ao armazém." }, { status: 200 })
  } catch (error) {
    console.error("Erro ao remover alocação:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// Rota PATCH: Atualiza a quantidade na obra e ajusta o stock
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string, alocacaoId: string }> }
) {
  try {
    const resolvedParams = await params;
    const { alocacaoId } = resolvedParams;
    const body = await request.json()
    const { novaQuantidade } = body

    if (novaQuantidade === undefined || isNaN(Number(novaQuantidade)) || Number(novaQuantidade) <= 0) {
      return NextResponse.json({ error: "Quantidade inválida." }, { status: 400 })
    }

    const alocacao = await prisma.materialObra.findUnique({
      where: { id: alocacaoId },
      include: { material: true }
    })

    if (!alocacao) return NextResponse.json({ error: "Registo não encontrado." }, { status: 404 })

    // Calcula a diferença entre a quantidade nova e a antiga
    const diferenca = Number(novaQuantidade) - alocacao.quantidade

    // Se precisamos de MAIS material para a obra, verifica se há stock
    if (diferenca > 0 && alocacao.material.quantidade < diferenca) {
      return NextResponse.json({ 
        error: `Stock insuficiente no armazém. Apenas tens ${alocacao.material.quantidade} disponíveis.` 
      }, { status: 400 })
    }

    // Transação: Atualiza o stock no inventário e a quantidade na obra
    await prisma.$transaction([
      prisma.material.update({
        where: { id: alocacao.materialId },
        data: { quantidade: { decrement: diferenca } } // Decrementa a diferença (se for negativa, soma)
      }),
      prisma.materialObra.update({
        where: { id: alocacaoId },
        data: { quantidade: Number(novaQuantidade) }
      })
    ])

    return NextResponse.json({ message: "Quantidade atualizada com sucesso" }, { status: 200 })
  } catch (error) {
    console.error("Erro ao atualizar alocação:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}