import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, role } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email e palavra-passe são obrigatórios." }, { status: 400 })
    }

    const existe = await prisma.user.findUnique({ where: { email } })
    if (existe) {
      return NextResponse.json({ error: "Este email já tem acesso ao sistema." }, { status: 400 })
    }

    // Cria o novo utilizador na BD
    const novoUser = await prisma.user.create({
      data: {
        name,
        email,
        password, // Nota: Se no futuro instalares 'bcrypt', faz a encriptação aqui!
        role: role || 'USER'
      }
    })

    return NextResponse.json(novoUser, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar utilizador:", error)
    return NextResponse.json({ error: "Erro interno do servidor HP." }, { status: 500 })
  }
}