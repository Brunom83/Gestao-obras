import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nome, localizacao, estado, dataInicio, dataFim } = body

    // Validação de segurança básica
    if (!nome) {
      return NextResponse.json({ error: "O nome da obra é obrigatório." }, { status: 400 })
    }

    // Injeção na base de dados
    const novaObra = await prisma.obra.create({
      data: {
        nome,
        localizacao,
        estado: estado || "EM_CURSO",
        // Converte as datas enviadas pelo browser para o formato do PostgreSQL
        dataInicio: dataInicio ? new Date(dataInicio) : new Date(),
        dataFim: dataFim ? new Date(dataFim) : null,
      }
    })

    return NextResponse.json(novaObra, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar obra:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}