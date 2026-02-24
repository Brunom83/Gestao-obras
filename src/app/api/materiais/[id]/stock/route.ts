import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const materialId = resolvedParams.id;
    
    const body = await request.json()
    // Agora recebemos a quantidade e a ação ('adicionar' ou 'remover')
    const { quantidade, acao } = body 

    if (!quantidade || quantidade <= 0) {
      return NextResponse.json({ error: "Quantidade inválida." }, { status: 400 })
    }

    const material = await prisma.material.findUnique({ where: { id: materialId } })
    if (!material) return NextResponse.json({ error: "Material não encontrado." }, { status: 404 })

    let novaQuantidade = material.quantidade
    
    // O motor decide se acelera ou se trava
    if (acao === 'remover') {
        if (material.quantidade < quantidade) {
            return NextResponse.json({ error: "Stock insuficiente para remover essa quantidade." }, { status: 400 })
        }
        novaQuantidade -= Number(quantidade)
    } else {
        novaQuantidade += Number(quantidade)
    }

    const materialAtualizado = await prisma.material.update({
      where: { id: materialId },
      data: { quantidade: novaQuantidade }
    })

    return NextResponse.json(materialAtualizado, { status: 200 })
  } catch (error) {
    console.error("Erro ao gerir stock:", error)
    return NextResponse.json({ error: "Erro interno do servidor HP." }, { status: 500 })
  }
}