import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { novos, atualizar } = body

    if ((!novos || novos.length === 0) && (!atualizar || atualizar.length === 0)) {
      return NextResponse.json({ error: "Não há dados para injetar." }, { status: 400 })
    }

    // TRANSAÇÃO TEKU: Executa tudo num bloco selado!
    await prisma.$transaction(async (tx) => {
      
      // 1. Injetar Peças Novas
      if (novos && novos.length > 0) {
        await tx.material.createMany({
          data: novos.map((item: any) => ({
            referenciaInterna: item.referencia,
            descricao: item.descricao,
            quantidade: item.quantidade,
            unidade: "UN" // Unidade padrão. O Chefe depois edita se for Caixa ou Kit.
          })),
          skipDuplicates: true, // Escudo extra contra Drones
        })
      }

      // 2. Atualizar o Stock das Peças Existentes
      if (atualizar && atualizar.length > 0) {
        for (const item of atualizar) {
          await tx.material.update({
            where: { referenciaInterna: item.referencia },
            data: { quantidade: item.qtdNova }
          })
        }
      }
      
    })

    return NextResponse.json({ message: "Inventário atualizado com sucesso!" }, { status: 200 })
  } catch (error) {
    console.error("Erro na injeção definitiva:", error)
    return NextResponse.json({ error: "Falha catastrófica no motor de injeção. Revertido." }, { status: 500 })
  }
}