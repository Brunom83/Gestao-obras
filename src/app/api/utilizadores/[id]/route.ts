import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const prisma = new PrismaClient()

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    const patenteAtual = (session?.user as any)?.role

    // Apenas SUPERADMIN e MASTER têm acesso à rota de edição
    if (!['SUPERADMIN', 'MASTER'].includes(patenteAtual)) {
      return NextResponse.json({ error: "Acesso Negado." }, { status: 403 })
    }

    const resolvedParams = await params;
    const targetId = resolvedParams.id;
    const body = await request.json()
    const { role: novaRole } = body

    if (!['USER', 'ADMIN', 'SUPERADMIN', 'MASTER'].includes(novaRole)) {
      return NextResponse.json({ error: "Patente inválida." }, { status: 400 })
    }

    // Procura o utilizador alvo para verificar a patente atual dele
    const targetUser = await prisma.user.findUnique({ where: { id: targetId } })
    if (!targetUser) {
      return NextResponse.json({ error: "Utilizador não encontrado." }, { status: 404 })
    }

    // A BLINDAGEM DO MASTER: 
    // 1. Um SuperAdmin não pode alterar uma conta Master
    if (targetUser.role === 'MASTER' && patenteAtual !== 'MASTER') {
      return NextResponse.json({ error: "Acesso Restrito. Contas de Sistema são imutáveis." }, { status: 403 })
    }

    // 2. Um SuperAdmin não pode promover alguém a Master
    if (novaRole === 'MASTER' && patenteAtual !== 'MASTER') {
      return NextResponse.json({ error: "Privilégios insuficientes para atribuir patente de Sistema." }, { status: 403 })
    }

    const utilizadorAtualizado = await prisma.user.update({
      where: { id: targetId },
      data: { role: novaRole }
    })

    return NextResponse.json(utilizadorAtualizado, { status: 200 })
  } catch (error) {
    console.error("Erro ao atualizar patente:", error)
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    const patenteAtual = (session?.user as any)?.role

    if (!['SUPERADMIN', 'MASTER'].includes(patenteAtual)) {
      return NextResponse.json({ error: "Acesso Negado." }, { status: 403 })
    }

    const resolvedParams = await params;
    const targetId = resolvedParams.id;

    const targetUser = await prisma.user.findUnique({ where: { id: targetId } })
    if (!targetUser) {
      return NextResponse.json({ error: "Utilizador não encontrado." }, { status: 404 })
    }

    // A BLINDAGEM DE ELIMINAÇÃO:
    // Um SuperAdmin não pode apagar a conta Master
    if (targetUser.role === 'MASTER' && patenteAtual !== 'MASTER') {
      return NextResponse.json({ error: "Acesso Restrito. Não é possível eliminar contas de Sistema." }, { status: 403 })
    }

    await prisma.user.delete({
      where: { id: targetId }
    })

    return NextResponse.json({ message: "Acesso revogado com sucesso." }, { status: 200 })
  } catch (error) {
    console.error("Erro ao eliminar utilizador:", error)
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
  }
}