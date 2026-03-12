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

    // A TUA REGRA DE OURO MANTIDA INTACTA!
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
    if (acao === 'aprovar_producao' && ticket.estado === 'PENDENTE') {
      const atualizado = await prisma.pedidoMaterial.update({
        where: { id: ticketId },
        data: { estado: 'AGUARDA_ARMAZEM', aprovadorId: currentUser.id }
      })
      return NextResponse.json(atualizado)
    }

    // Lógica de Aprovar (Armazém) - Desconta fisicamente, regista na obra e GRAVA NA CAIXA NEGRA
    if (acao === 'aprovar_armazem' && ticket.estado === 'AGUARDA_ARMAZEM') {
      const resultado = await prisma.$transaction(async (tx) => {
        const mat = await tx.material.findUnique({ where: { id: ticket.materialId } })
        
        // Escudo anti-falha de stock
        if (!mat || mat.quantidade < ticket.quantidade) {
          throw new Error(`Stock crítico! Apenas tens ${mat?.quantidade || 0} unidades na gaveta.`)
        }

        // 1. Tira da gaveta do armazém
        const materialAtualizado = await tx.material.update({
          where: { id: ticket.materialId },
          data: { quantidade: mat.quantidade - ticket.quantidade }
        })

        // 2. Coloca na Obra (Cabo do dinheiro desligado, só entra material físico)
        await tx.materialObra.create({
          data: { quantidade: ticket.quantidade, obraId: ticket.obraId, materialId: ticket.materialId }
        })

        // 3. Carimbar o Ticket como Entregue
        const ticketEntregue = await tx.pedidoMaterial.update({
          where: { id: ticketId },
          data: { estado: 'ENTREGUE', aprovadorId: currentUser.id, dataResposta: new Date() }
        })

        // 4. O SENSOR 5 (A CAIXA NEGRA!) - Faltava esta injeção
        await tx.logInventario.create({
          data: {
            materialId: ticket.materialId,
            userId: currentUser.id,
            acao: "ENTREGUE_OBRA",
            quantidadeMov: -ticket.quantidade, // Negativo porque sai do armazém
            stockAnterior: mat.quantidade,
            stockNovo: materialAtualizado.quantidade,
            detalhes: `Material entregue fisicamente à obra. (Ticket #${ticketId.slice(-6).toUpperCase()})`
          }
        })

        return ticketEntregue
      })
      
      return NextResponse.json(resultado)
    }

    return NextResponse.json({ error: "Ação inválida ou estado do ticket incompatível." }, { status: 400 })

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro no servidor HP." }, { status: 500 })
  }
}