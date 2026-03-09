import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const prisma = new PrismaClient()

// O Cérebro do Radar (Expressões Regulares - Regex)
function extrairDadosTecnicos(texto: string) {
  const textoUpper = texto.toUpperCase()
  
  const normaMatch = textoUpper.match(/(EN|ISO)\s*\d+/)
  const norma = normaMatch ? normaMatch[0] : null

  const classeMatch = textoUpper.match(/8\.8|10\.9|12\.9|4\.8/)
  const classe = classeMatch ? classeMatch[0] : null

  let tratamento = null
  if (textoUpper.includes("ZINCADO")) tratamento = "Zincado"
  if (textoUpper.includes("GALVANIZADO")) tratamento = "Galvanizado a Quente"
  if (textoUpper.includes("INOX")) tratamento = "Inox"

  let categoria = "Consumível"
  if (textoUpper.includes("PARAFUSO") || textoUpper.includes("CONJUNTO") || textoUpper.includes("FIXAÇÃO")) categoria = "Parafuso"
  if (textoUpper.includes("VIGA") || textoUpper.includes("IPE") || textoUpper.includes("HEB") || textoUpper.includes("UPN")) categoria = "Viga"
  if (textoUpper.includes("BROCA")) categoria = "Ferramenta"

  let diametro = null
  let comprimento = null
  const medidasMatch = textoUpper.match(/M(\d+)\s*X\s*(\d+)/)
  if (medidasMatch) {
    diametro = "M" + medidasMatch[1] 
    comprimento = medidasMatch[2] + "mm" 
  }

  return { norma, classe, tratamento, categoria, diametro, comprimento }
}

export async function POST(request: Request) {
  try {
    // 1. Identificar o Condutor
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: "Acesso Negado." }, { status: 401 })

    const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!currentUser) return NextResponse.json({ error: "Utilizador fantasma." }, { status: 404 })

    const body = await request.json()
    const { referenciaInterna, descricao, medidas, quantidade, unidade } = body

    if (!descricao) {
      return NextResponse.json({ error: "A descrição é obrigatória." }, { status: 400 })
    }

    const textoParaAnalisar = `${descricao} ${medidas || ""}`
    const intel = extrairDadosTecnicos(textoParaAnalisar)
    const qtdInicial = Number(quantidade) || 0

    // 2. TRANSAÇÃO TEKU: Cria o material E regista na Caixa Negra!
    const novoMaterial = await prisma.$transaction(async (tx) => {
      
      const materialCriado = await tx.material.create({
        data: {
          referenciaInterna: referenciaInterna || null,
          descricao,
          medidas: medidas || null,
          quantidade: qtdInicial,
          unidade: unidade || "un",
          categoria: intel.categoria,
          norma: intel.norma,
          classe: intel.classe,
          tratamento: intel.tratamento,
          diametro: intel.diametro,
          comprimento: intel.comprimento
        }
      })

      // Registo Automático no Histórico
      await tx.logInventario.create({
        data: {
          materialId: materialCriado.id,
          userId: currentUser.id,
          acao: "CRIADO_MANUALMENTE",
          quantidadeMov: qtdInicial,
          stockAnterior: 0,
          stockNovo: qtdInicial,
          detalhes: `Material registado no painel: ${descricao}`
        }
      })

      return materialCriado
    })

    return NextResponse.json(novoMaterial, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar material:", error)
    return NextResponse.json({ error: "Erro interno do servidor HP." }, { status: 500 })
  }
}