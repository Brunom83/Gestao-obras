import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const prisma = new PrismaClient()

// Rota PATCH para atualizar a quantidade (Ou outros detalhes no futuro)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const body = await request.json()
    const { quantidade } = body

    if (quantidade === undefined || isNaN(Number(quantidade)) || Number(quantidade) < 0) {
      return NextResponse.json({ error: "Quantidade inválida." }, { status: 400 })
    }

    const materialAtualizado = await prisma.material.update({
      where: { id: resolvedParams.id },
      data: { quantidade: Number(quantidade) }
    })

    return NextResponse.json(materialAtualizado, { status: 200 })
  } catch (error) {
    console.error("Erro ao atualizar material:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// Rota DELETE para eliminar o material (COM SENSOR DA CAIXA NEGRA JÁ LIGADO)
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: "Utilizador não identificado." }, { status: 401 })

    const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!currentUser) return NextResponse.json({ error: "Utilizador fantasma." }, { status: 404 })

    const resolvedParams = await params;
    const id = resolvedParams.id;

    const materialApagar = await prisma.material.findUnique({
      where: { id: id }
    })

    if (!materialApagar) return NextResponse.json({ error: "Peça já não existe na garagem." }, { status: 404 })

    await prisma.$transaction(async (tx) => {
      // Grava o log primeiro
      await tx.logInventario.create({
        data: {
          userId: currentUser.id,
          acao: "VAPORIZADO",
          quantidadeMov: materialApagar.quantidade,
          stockAnterior: materialApagar.quantidade,
          stockNovo: 0,
          detalhes: `Material vaporizado: ${materialApagar.descricao} (Ref: ${materialApagar.referenciaInterna || 'S/ Ref'})`
        }
      })

      // Vaporiza a peça de vez
      await tx.material.delete({
        where: { id: id }
      })
    })
    
    return NextResponse.json({ message: "Peça vaporizada com sucesso e registada na Caixa Negra!" }, { status: 200 })
  } catch (error: any) {
    if (error.code === 'P2003') {
      return NextResponse.json({ error: "ALERTA: Este material já foi usado numa Obra passada! O motor bloqueou a destruição." }, { status: 400 })
    }
    console.error("Erro ao apagar material:", error)
    return NextResponse.json({ error: "Os Drones intercetaram a auto-destruição." }, { status: 500 })
  }
}