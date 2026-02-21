import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string, horaId: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id: obraId, horaId } = resolvedParams;

    // 1. Vai buscar o registo para saber quantas horas foram e de quem
    const registo = await prisma.registoHoras.findUnique({
      where: { id: horaId },
      include: { funcionario: true }
    })

    if (!registo) {
      return NextResponse.json({ error: "Registo de horas não encontrado." }, { status: 404 })
    }

    // 2. Faz a matemática inversa (Horas * Custo do Trabalhador)
    const valorASubtrair = registo.horas * registo.funcionario.custoHora

    // 3. Transação: Apaga a linha de horas E desconta o dinheiro na Obra
    await prisma.$transaction([
      prisma.registoHoras.delete({
        where: { id: horaId }
      }),
      prisma.obra.update({
        where: { id: obraId },
        data: { custoTotal: { decrement: valorASubtrair } }
      })
    ])

    return NextResponse.json({ message: "Registo apagado e custos atualizados." }, { status: 200 })
  } catch (error) {
    console.error("Erro ao apagar horas:", error)
    return NextResponse.json({ error: "Erro interno do servidor HP." }, { status: 500 })
  }
}