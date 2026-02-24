import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const prisma = new PrismaClient()

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 1. O Radar de Segurança: Lê quem está a fazer o pedido
    const session = await getServerSession(authOptions)
    const patenteAtual = (session?.user as any)?.role

    // Se não for o SUPERADMIN a dar a ordem, corta o motor na hora!
    if (patenteAtual !== 'SUPERADMIN') {
      return NextResponse.json({ error: "Acesso Negado. Apenas o SuperAdmin pode alterar patentes." }, { status: 403 })
    }

    const resolvedParams = await params;
    const body = await request.json()
    const { role } = body

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

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 1. Radar de Segurança para Eliminar
    const session = await getServerSession(authOptions)
    if ((session?.user as any)?.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: "Acesso Negado. Apenas o SuperAdmin pode eliminar contas." }, { status: 403 })
    }

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