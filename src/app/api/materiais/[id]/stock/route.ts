import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth" // O nosso radar de identidade

const prisma = new PrismaClient()

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 1. Radar ligado: Quem é o condutor que está a mexer no stock?
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Condutor não identificado." }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!currentUser) {
      return NextResponse.json({ error: "Utilizador fantasma." }, { status: 404 })
    }

    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await request.json()
    const { quantidade, acao } = body // acao pode ser 'adicionar' ou 'remover'

    if (!quantidade || quantidade <= 0) {
      return NextResponse.json({ error: "A quantidade tem de ser maior que zero." }, { status: 400 })
    }

    // 2. Olhar para a gaveta ANTES de mexer (para a Caixa Negra saber o passado)
    const materialAtual = await prisma.material.findUnique({
      where: { id: id }
    })

    if (!materialAtual) {
      return NextResponse.json({ error: "Material não encontrado no armazém." }, { status: 404 })
    }

    const stockAntigo = materialAtual.quantidade
    let stockNovo = stockAntigo
    let tipoAcaoLog = ""

    // 3. Fazer as contas do novo stock
    if (acao === 'adicionar') {
      stockNovo = stockAntigo + quantidade
      tipoAcaoLog = "AJUSTE_MANUAL_ENTRADA"
    } else if (acao === 'remover') {
      stockNovo = stockAntigo - quantidade
      if (stockNovo < 0) return NextResponse.json({ error: "Não podes retirar mais do que tens na gaveta!" }, { status: 400 })
      tipoAcaoLog = "AJUSTE_MANUAL_SAIDA"
    } else {
      return NextResponse.json({ error: "Ação mecânica inválida." }, { status: 400 })
    }

    // 4. TRANSAÇÃO TEKU: Atualiza o material E grava na Caixa Negra ao mesmo tempo!
    const resultado = await prisma.$transaction(async (tx) => {
      
      // Atualiza a gaveta
      const matAtualizado = await tx.material.update({
        where: { id: id },
        data: { quantidade: stockNovo }
      })

      // Injeta o sinal no Sensor da Caixa Negra
      await tx.logInventario.create({
        data: {
          materialId: id,
          userId: currentUser.id,
          acao: tipoAcaoLog,
          quantidadeMov: quantidade,
          stockAnterior: stockAntigo,
          stockNovo: stockNovo,
          detalhes: `Ajuste manual feito no painel de Inventário.`
        }
      })

      return matAtualizado
    })

    return NextResponse.json(resultado, { status: 200 })

  } catch (error) {
    console.error("Erro ao atualizar stock:", error)
    return NextResponse.json({ error: "Os Drones intercetaram a gravação no servidor HP." }, { status: 500 })
  }
}