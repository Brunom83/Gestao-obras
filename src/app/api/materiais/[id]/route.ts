import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Rota PATCH para atualizar a quantidade
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

// Rota DELETE para eliminar o material
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    
    await prisma.material.delete({
      where: { id: resolvedParams.id }
    })
    
    return NextResponse.json({ message: "Material eliminado com sucesso" }, { status: 200 })
  } catch (error) {
    console.error("Erro ao eliminar material:", error)
    return NextResponse.json({ error: "Erro interno ao eliminar (verifica se está alocado a alguma obra)" }, { status: 500 })
  }
}

// O Cérebro do Radar (Expressões Regulares - Regex)
// Ele lê textos confusos e extrai apenas a informação técnica pura
function extrairDadosTecnicos(texto: string) {
  // Passa tudo para maiúsculas para o radar não falhar se escreverem "zincado" ou "ZINCADO"
  const textoUpper = texto.toUpperCase()
  
  // 1. Radar de Norma (Procura por "EN" ou "ISO" seguido de números)
  const normaMatch = textoUpper.match(/(EN|ISO)\s*\d+/)
  const norma = normaMatch ? normaMatch[0] : null

  // 2. Radar de Classe de Resistência (Procura padrões como 8.8, 10.9)
  const classeMatch = textoUpper.match(/8\.8|10\.9|12\.9|4\.8/)
  const classe = classeMatch ? classeMatch[0] : null

  // 3. Radar de Tratamento
  let tratamento = null
  if (textoUpper.includes("ZINCADO")) tratamento = "Zincado"
  if (textoUpper.includes("GALVANIZADO")) tratamento = "Galvanizado a Quente"
  if (textoUpper.includes("INOX")) tratamento = "Inox"

  // 4. Radar de Categoria Lógica
  let categoria = "Consumível"
  if (textoUpper.includes("PARAFUSO") || textoUpper.includes("CONJUNTO") || textoUpper.includes("FIXAÇÃO")) categoria = "Parafuso"
  if (textoUpper.includes("VIGA") || textoUpper.includes("IPE") || textoUpper.includes("HEB") || textoUpper.includes("UPN")) categoria = "Viga"
  if (textoUpper.includes("BROCA")) categoria = "Ferramenta"

  // 5. Radar de Dimensões (Extrai o Diâmetro e Comprimento de coisas como "M10x30")
  let diametro = null
  let comprimento = null
  const medidasMatch = textoUpper.match(/M(\d+)\s*X\s*(\d+)/)
  if (medidasMatch) {
    diametro = "M" + medidasMatch[1] // Guarda "M10"
    comprimento = medidasMatch[2] + "mm" // Guarda "30mm"
  }

  return { norma, classe, tratamento, categoria, diametro, comprimento }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { referenciaInterna, descricao, medidas, quantidade, unidade } = body

    if (!descricao) {
      return NextResponse.json({ error: "A descrição é obrigatória." }, { status: 400 })
    }

    // Fundimos a descrição e as medidas num único texto para o nosso Radar analisar tudo de uma vez
    const textoParaAnalisar = `${descricao} ${medidas || ""}`
    
    // Dispara o Accelecharger para extrair a inteligência
    const intel = extrairDadosTecnicos(textoParaAnalisar)

    // Grava tudo no PostgreSQL do servidor HP, metendo cada coisa na sua gaveta
    const novoMaterial = await prisma.material.create({
      data: {
        referenciaInterna: referenciaInterna || null,
        descricao,
        medidas: medidas || null,
        quantidade: Number(quantidade) || 0,
        unidade: unidade || "un",
        
        // AS GAVETAS AUTOMÁTICAS PREENCHIDAS PELO RADAR:
        categoria: intel.categoria,
        norma: intel.norma,
        classe: intel.classe,
        tratamento: intel.tratamento,
        diametro: intel.diametro,
        comprimento: intel.comprimento
      }
    })

    return NextResponse.json(novoMaterial, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar material com extração automática:", error)
    return NextResponse.json({ error: "Erro interno do servidor HP." }, { status: 500 })
  }
}