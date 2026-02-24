import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

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

    // O Camuflador dos Silencerz: Encripta a palavra-passe em 10 rondas de segurança
    const hashedPassword = await bcrypt.hash(password, 10)

    // Cria o novo utilizador na BD com a password camuflada e irrecuperável
    const novoUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword, 
        role: role || 'USER'
      }
    })

    return NextResponse.json({ message: "Utilizador criado com sucesso." }, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar utilizador:", error)
    return NextResponse.json({ error: "Erro interno do servidor HP." }, { status: 500 })
  }
}