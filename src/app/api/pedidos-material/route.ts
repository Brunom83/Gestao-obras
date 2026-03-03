import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    // 1. O Radar Teku: Apanhar a sessão de forma segura (pelo Email)
    const session = await getServerSession(authOptions)
    const userEmail = session?.user?.email

    if (!userEmail) {
      return NextResponse.json({ error: "Acesso Negado. Identificação falhou no portal." }, { status: 401 })
    }

    // Vai à base de dados procurar o condutor exato através do email
    const currentUser = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!currentUser) {
      return NextResponse.json({ error: "Utilizador não encontrado no sistema." }, { status: 404 })
    }

    const body = await request.json()
    const { materialId, obraId, quantidade } = body

    if (!materialId || !obraId || !quantidade || Number(quantidade) <= 0) {
      return NextResponse.json({ error: "Precisas de indicar a obra e uma quantidade válida." }, { status: 400 })
    }

    // 2. Cria o Ticket com a Nova Regra (Carimbo 'PENDENTE' em vez do antigo)
    const novoPedido = await prisma.pedidoMaterial.create({
      data: {
        quantidade: Number(quantidade),
        obraId,
        materialId,
        requisitanteId: currentUser.id,
        estado: "PENDENTE" // <-- A CORREÇÃO CIRÚRGICA ESTÁ AQUI!
      }
    })

    return NextResponse.json(novoPedido, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar pedido de material:", error)
    return NextResponse.json({ error: "Erro interno do servidor HP." }, { status: 500 })
  }
}