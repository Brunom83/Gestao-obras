import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 })

    const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!currentUser) return NextResponse.json({ error: "Utilizador fantasma." }, { status: 404 })

    const body = await request.json()
    const { novos, atualizar } = body

    if ((!novos || novos.length === 0) && (!atualizar || atualizar.length === 0)) {
      return NextResponse.json({ error: "Não há dados para injetar." }, { status: 400 })
    }

    // 🚨 NOVO SISTEMA DE SEGURANÇA: Procurar referências repetidas no próprio Excel antes de gravar!
    const todasRefs = [
      ...(novos || []).map((n: any) => n.referencia),
      ...(atualizar || []).map((a: any) => a.referenciaNova)
    ].filter(r => r && r.trim() !== "")

    // Filtra para encontrar as que aparecem mais do que uma vez
    const refsDuplicadas = todasRefs.filter((item, index) => todasRefs.indexOf(item) !== index)

    if (refsDuplicadas.length > 0) {
      // Se houver repetidas, aborta logo e avisa-te qual é!
      return NextResponse.json({ 
        error: `Erro no Excel: Tens referências repetidas na folha! Exemplo: "${refsDuplicadas[0]}". Corrige o Excel e tenta de novo.` 
      }, { status: 400 })
    }

    // Se estiver tudo limpo, arranca a gravação no PostgreSQL do servidor HP
    await prisma.$transaction(async (tx) => {
      
      if (novos && novos.length > 0) {
        for (const item of novos) {
          const novaPeca = await tx.material.create({
            data: {
              referenciaInterna: item.referencia ? item.referencia : null,
              descricao: item.descricao,
              quantidade: item.quantidade,
              unidade: item.unidade || "un" 
            }
          })

          await tx.logInventario.create({
            data: {
              materialId: novaPeca.id,
              userId: currentUser.id,
              acao: "EXCEL_CRIADO",
              quantidadeMov: item.quantidade,
              stockAnterior: 0,
              stockNovo: item.quantidade,
              detalhes: `Produto novo importado via Excel. Ref: ${item.referencia || 'S/Ref'}`
            }
          })
        }
      }

      if (atualizar && atualizar.length > 0) {
        for (const item of atualizar) {
          await tx.material.update({
            where: { id: item.id }, 
            data: { 
              quantidade: item.qtdNova,
              referenciaInterna: item.referenciaNova ? item.referenciaNova : null,
              unidade: item.unidadeNova || "un"
            }
          })

          await tx.logInventario.create({
            data: {
              materialId: item.id,
              userId: currentUser.id,
              acao: "EXCEL_ATUALIZADO",
              quantidadeMov: item.qtdNova - item.qtdAntiga, 
              stockAnterior: item.qtdAntiga,
              stockNovo: item.qtdNova,
              detalhes: `Atualizado via Excel. Ref colada: ${item.referenciaNova || 'S/Ref'} | Un: ${item.unidadeNova || "un"}`
            }
          })
        }
      }
      
    })

    return NextResponse.json({ message: "Inventário importado e registado na Caixa Negra com sucesso!" }, { status: 200 })
  } catch (error: any) {
    console.error("Erro na injeção definitiva:", error)
    
    // Se o erro vier da base de dados (já existir a referência lá guardada)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "O PostgreSQL bloqueou a operação: Há uma referência no Excel que já está a ser usada por OUTRA peça antiga no sistema. Não podes ter referências duplicadas." }, { status: 400 })
    }

    return NextResponse.json({ error: "Falha na gravação: " + (error.message || "Erro desconhecido") }, { status: 500 })
  }
}