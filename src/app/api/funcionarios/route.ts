import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nome, cargoId, custoHora } = body

    if (!nome || !cargoId) {
      return NextResponse.json({ error: "O nome e a posição no organograma são obrigatórios." }, { status: 400 })
    }

    // Injeta o novo funcionário e liga-o diretamente à caixa do organograma
    const novoFuncionario = await prisma.funcionario.create({
      data: {
        nome,
        cargoId,
        custoHora: Number(custoHora) || 0
      }
    })

    return NextResponse.json(novoFuncionario, { status: 201 })
  } catch (error) {
    console.error("Erro ao registar funcionário:", error)
    return NextResponse.json({ error: "Erro interno do servidor HP." }, { status: 500 })
  }
}