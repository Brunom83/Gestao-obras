import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    
    // O Prisma apaga o funcionário. Se ele tiver horas registadas, o "Cascade" 
    // no schema apaga essas horas também para não deixar dados órfãos.
    await prisma.funcionario.delete({
      where: { id: resolvedParams.id }
    })
    
    return NextResponse.json({ message: "Funcionário eliminado com sucesso" }, { status: 200 })
  } catch (error) {
    console.error("Erro ao eliminar funcionário:", error)
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
  }
}