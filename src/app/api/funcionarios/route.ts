import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nome, cargo, custoHora } = body

    if (!nome || !cargo) {
      return NextResponse.json({ error: "O nome e o cargo são obrigatórios." }, { status: 400 })
    }

    // Injeta o novo funcionário na base de dados
    const novoFuncionario = await prisma.funcionario.create({
      data: {
        nome,
        cargo,
        custoHora: Number(custoHora) || 0 // Se vier vazio, assume 0
      }
    })

    return NextResponse.json(novoFuncionario, { status: 201 })
  } catch (error) {
    console.error("Erro ao registar funcionário:", error)
    return NextResponse.json({ error: "Erro interno do servidor HP." }, { status: 500 })
  }
}