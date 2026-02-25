import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Rota DELETE: Apaga a obra e limpa tudo o que está associado
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const obraId = resolvedParams.id;
    
    // O Cascade na base de dados (que configurámos no schema) vai garantir 
    // que as horas, materiais e documentos desta obra também são limpos automaticamente!
    await prisma.obra.delete({
      where: { id: obraId }
    })
    
    return NextResponse.json({ message: "Obra eliminada com sucesso" }, { status: 200 })
  } catch (error) {
    console.error("Erro ao eliminar obra:", error)
    return NextResponse.json({ error: "Erro interno do servidor HP." }, { status: 500 })
  }
}

// Esta é a função que recebe o novo estado e atualiza o Cofre!
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const body = await request.json()
    const { estado } = body

    if (!estado) {
      return NextResponse.json({ error: "Estado inválido." }, { status: 400 })
    }

    // O verdadeiro Accelecharger: se a obra for "CONCLUIDA", regista a data do fim automaticamente!
    const obraAtualizada = await prisma.obra.update({
      where: { id: resolvedParams.id },
      data: { 
        estado,
        dataFim: estado === 'CONCLUIDA' ? new Date() : null
      }
    })

    return NextResponse.json(obraAtualizada, { status: 200 })
  } catch (error) {
    console.error("Erro ao alterar estado:", error)
    return NextResponse.json({ error: "Erro interno do servidor HP." }, { status: 500 })
  }
}