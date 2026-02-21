import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Rota PATCH para atualizar a quantidade
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const body = await request.json()
    const { quantidade } = body

    if (quantidade === undefined || isNaN(Number(quantidade)) || Number(quantidade) < 0) {
      return NextResponse.json({ error: "Quantidade inválida." }, { status: 400 })
    }

    const materialAtualizado = await prisma.material.update({
      where: { id: resolvedParams.id },
      data: { quantidade: Number(quantidade) }
    })

    return NextResponse.json(materialAtualizado, { status: 200 })
  } catch (error) {
    console.error("Erro ao atualizar material:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// Rota DELETE para eliminar o material
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    
    await prisma.material.delete({
      where: { id: resolvedParams.id }
    })
    
    return NextResponse.json({ message: "Material eliminado com sucesso" }, { status: 200 })
  } catch (error) {
    console.error("Erro ao eliminar material:", error)
    return NextResponse.json({ error: "Erro interno ao eliminar (verifica se está alocado a alguma obra)" }, { status: 500 })
  }
}