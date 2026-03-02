import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const prisma = new PrismaClient()

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    const userEmail = session?.user?.email

    if (!userEmail) return NextResponse.json({ error: "Sessão inválida." }, { status: 401 })

    // Busca o utilizador e a etiqueta no servidor HP
    const currentUser = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { cargo: true }
    })

    if (!currentUser) return NextResponse.json({ error: "Utilizador fantasma." }, { status: 404 })

    // A MESMA REGRA DE OURO APLICADA NO MOTOR DA API
    const isBlocked = currentUser.cargo?.nome === "Coordenador Soldadura" || 
                      currentUser.cargo?.departamento === "Compras" ||
                      currentUser.role === "USER"

    if (isBlocked && currentUser.role !== "MASTER") {
      return NextResponse.json({ error: "Acesso Negado. Sem patente para aprovar." }, { status: 403 })
    }

    const resolvedParams = await params;
    const ticketId = resolvedParams.id;
    const body = await request.json()
    const { acao } = body 

    const ticket = await prisma.pedidoMaterial.findUnique({ where: { id: ticketId } })
    if (!ticket) return NextResponse.json({ error: "Ticket não encontrado." }, { status: 404 })

    // Lógica de Rejeitar
    if (acao === 'rejeitar') {
      const atualizado = await prisma.pedidoMaterial.update({
        where: { id: ticketId },
        data: { estado: 'REJEITADO', aprovadorId: currentUser.id, dataResposta: new Date() }
      })
      return NextResponse.json(atualizado)
    }

    // Lógica de Aprovar (Produção)
    if (acao === 'aprovar_producao' && ticket.estado === 'AGUARDA_PRODUCAO') {
      const atualizado = await prisma.pedidoMaterial.update({
        where: { id: ticketId },
        data: { estado: 'AGUARDA_ARMAZEM', aprovadorId: currentUser.id, dataResposta: new Date() }
      })
      return NextResponse.json(atualizado)
    }

    // Lógica de Aprovar (Armazém) - Desconta o material e regista na obra
    if (acao === 'aprovar_armazem' && ticket.estado === 'AGUARDA_ARMAZEM') {
      const resultado = await prisma.$transaction(async (tx) => {
        const mat = await tx.material.findUnique({ where: { id: ticket.materialId } })
        if (!mat || mat.quantidade < ticket.quantidade) {
          throw new Error("Não há stock suficiente no armazém!")
        }

        await tx.material.update({
          where: { id: ticket.materialId },
          data: { quantidade: mat.quantidade - ticket.quantidade }
        })

        await tx.materialObra.create({
          data: { quantidade: ticket.quantidade, obraId: ticket.obraId, materialId: ticket.materialId }
        })

        return await tx.pedidoMaterial.update({
          where: { id: ticketId },
          data: { estado: 'ENTREGUE', aprovadorId: currentUser.id, dataResposta: new Date() }
        })
      })
      return NextResponse.json(resultado)
    }

    return NextResponse.json({ error: "Ação inválida." }, { status: 400 })

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro no servidor HP." }, { status: 500 })
  }
}