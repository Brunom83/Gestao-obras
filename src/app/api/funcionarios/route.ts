import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    // 1. Já não pedimos o custoHora
    const { nome, cargoId } = body

    if (!nome || !cargoId) {
      return NextResponse.json({ error: "O nome e a posição no organograma são obrigatórios." }, { status: 400 })
    }

    // 2. Injeta na BD apenas com as peças que sobraram da redução de peso
    const novoFuncionario = await prisma.funcionario.create({
      data: {
        nome,
        cargoId
      }
    })

    return NextResponse.json(novoFuncionario, { status: 201 })
  } catch (error) {
    console.error("Erro ao registar funcionário:", error)
    return NextResponse.json({ error: "Erro interno do servidor HP." }, { status: 500 })
  }
}