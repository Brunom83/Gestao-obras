import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    // Apanhamos o novo cargoId vindo do formulário
    const { name, email, password, role, cargoId } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email e palavra-passe são obrigatórios." }, { status: 400 })
    }

    const existe = await prisma.user.findUnique({ where: { email } })
    if (existe) {
      return NextResponse.json({ error: "Este email já tem acesso ao sistema." }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // O Accelecharger injeta o cargoId direto no cofre
    const novoUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword, 
        role: role || 'USER',
        cargoId: cargoId || null // Se não escolher, fica nulo sem dar erro
      }
    })

    return NextResponse.json({ message: "Utilizador criado com sucesso." }, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar utilizador:", error)
    return NextResponse.json({ error: "Erro interno do servidor HP." }, { status: 500 })
  }
}