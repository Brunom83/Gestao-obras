import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await request.json()
    const { referencia } = body

    // A MÁGICA AQUI: Se for vazio/null, limpamos o campo. Senão, pomos em Maiúsculas!
    const valorFinal = (!referencia || referencia.trim() === "") ? null : referencia.trim().toUpperCase();

    const materialAtualizado = await prisma.material.update({
      where: { id: id },
      data: { referenciaInterna: valorFinal }
    })

    return NextResponse.json(materialAtualizado, { status: 200 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Choque na pista: Esta referência já está a ser usada noutro material!" }, { status: 400 })
    }
    console.error("Erro ao atualizar referência:", error)
    return NextResponse.json({ error: "Os Drones bloquearam a gravação." }, { status: 500 })
  }
}