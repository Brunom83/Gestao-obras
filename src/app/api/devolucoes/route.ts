import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 })

    const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!currentUser) return NextResponse.json({ error: "Utilizador não encontrado." }, { status: 404 })

    // O que esperamos receber do frontend quando o gajo bipar a sobra
    const body = await request.json()
    const { materialId, quantidadeDevolvida, obraOrigemId, motivo } = body

    if (!materialId || !quantidadeDevolvida || quantidadeDevolvida <= 0) {
      return NextResponse.json({ error: "Dados inválidos. A quantidade tem de ser maior que zero." }, { status: 400 })
    }

    // Transação Blindada: Soma ao armazém e Regista na Auditoria
    const resultado = await prisma.$transaction(async (tx) => {
      
      // 1. Vai buscar a peça para sabermos quanto tínhamos antes
      const materialAntigo = await tx.material.findUnique({ where: { id: materialId } })
      if (!materialAntigo) throw new Error("Material não existe no sistema.")

      // 2. Soma as sobras de volta à prateleira do armazém
      const materialAtualizado = await tx.material.update({
        where: { id: materialId },
        data: { quantidade: materialAntigo.quantidade + Number(quantidadeDevolvida) }
      })

      // 3. Se enviaram a Obra de onde veio, vamos buscar o nome para o histórico ficar bonito
      let nomeObra = "Obra Desconhecida"
      if (obraOrigemId) {
        const obra = await tx.obra.findUnique({ where: { id: obraOrigemId } })
        if (obra) nomeObra = obra.nome
      }

      // 4. Grava na Caixa Negra como DEVOLUÇÃO (Valor Positivo)
      const log = await tx.logInventario.create({
        data: {
          materialId: materialId,
          userId: currentUser.id,
          acao: "DEVOLUCAO_OBRA", // Ação nova!
          quantidadeMov: Number(quantidadeDevolvida), // Positivo porque está a ENTRAR
          stockAnterior: materialAntigo.quantidade,
          stockNovo: materialAtualizado.quantidade,
          detalhes: `Retorno de sobras provenientes da obra: ${nomeObra}. Motivo: ${motivo || "Fecho de obra/Excedente"}`
        }
      })

      return { materialAtualizado, log }
    })

    return NextResponse.json({ message: "Sobras recebidas e stock atualizado com sucesso!", data: resultado }, { status: 200 })

  } catch (error: any) {
    console.error("Erro ao processar devolução:", error)
    return NextResponse.json({ error: error.message || "Erro interno no servidor HP." }, { status: 500 })
  }
}