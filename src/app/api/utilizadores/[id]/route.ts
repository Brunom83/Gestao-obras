import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Atualizar a Patente (Role) do Utilizador
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const body = await request.json()
    const { role } = body

    // Impede que alguém envie uma patente inventada
    if (!['USER', 'ADMIN', 'SUPERADMIN'].includes(role)) {
      return NextResponse.json({ error: "Patente inválida." }, { status: 400 })
    }

    const utilizadorAtualizado = await prisma.user.update({
      where: { id: resolvedParams.id },
      data: { role }
    })

    return NextResponse.json(utilizadorAtualizado, { status: 200 })
  } catch (error) {
    console.error("Erro ao atualizar patente:", error)
    return NextResponse.json({ error: "Erro interno do servidor HP." }, { status: 500 })
  }
}

// Eliminar o Utilizador (Revogar Acesso Total)
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    
    await prisma.user.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({ message: "Acesso revogado com sucesso." }, { status: 200 })
  } catch (error) {
    console.error("Erro ao eliminar utilizador:", error)
    return NextResponse.json({ error: "Erro interno do servidor HP." }, { status: 500 })
  }
}