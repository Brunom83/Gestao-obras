import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import * as xlsx from "xlsx"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    // 1. Receber o Ficheiro do Cockpit
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "Nenhum ficheiro detetado no radar." }, { status: 400 })
    }

    // 2. Ler o ficheiro para a memória (Sem gravar no disco do servidor HP!)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 3. Ligar o motor xlsx para extrair os dados
    const workbook = xlsx.read(buffer, { type: "buffer" })
    const sheetName = workbook.SheetNames[0] // Lê a primeira aba do Excel
    const sheet = workbook.Sheets[sheetName]
    
    // Converte o Excel para uma lista de objetos Javascript
    const rawData = xlsx.utils.sheet_to_json(sheet) as any[]

    // 4. Buscar o inventário atual para fazer a comparação (Checkup)
    const inventarioAtual = await prisma.material.findMany({
      select: { referenciaInterna: true, quantidade: true, descricao: true }
    })

    // Mapas para organizar a informação e mostrar ao chefe
    const produtosNovos = []
    const produtosAAtualizar = []
    const linhasComErro = []

    // 5. O Algoritmo Teku de Comparação
    for (const row of rawData) {
      // Ajusta estes nomes caso as colunas do teu Excel tenham nomes diferentes!
      const ref = row["Referencia"] || row["referencia"]
      const desc = row["Descricao"] || row["descricao"]
      const qtdExcel = Number(row["Quantidade"] || row["quantidade"] || 0)

      if (!ref || !desc) {
        linhasComErro.push({ linha: row, erro: "Falta Referência ou Descrição" })
        continue
      }

      // Procura se a peça já existe no nosso motor
      const pecaExistente = inventarioAtual.find(p => p.referenciaInterna === ref)

      if (pecaExistente) {
        // Se existe e a quantidade mudou, vai para a lista de Atualizações
        if (pecaExistente.quantidade !== qtdExcel) {
          produtosAAtualizar.push({
            referencia: ref,
            descricao: desc,
            qtdAntiga: pecaExistente.quantidade,
            qtdNova: qtdExcel
          })
        }
      } else {
        // Se não existe no PostgreSQL, é material novo!
        produtosNovos.push({
          referencia: ref,
          descricao: desc,
          quantidade: qtdExcel,
          // Podes extrair as outras gavetas (Norma, Classe, etc.) do Excel aqui
        })
      }
    }

    // Devolvemos o relatório do Checkup para o Frontend mostrar antes de gravar!
    return NextResponse.json({
      message: "Checkup concluído com sucesso.",
      totalLido: rawData.length,
      novos: produtosNovos,
      atualizar: produtosAAtualizar,
      erros: linhasComErro
    }, { status: 200 })

  } catch (error) {
    console.error("Erro na leitura do Excel:", error)
    return NextResponse.json({ error: "Os Drones intercetaram a leitura da folha." }, { status: 500 })
  }
}