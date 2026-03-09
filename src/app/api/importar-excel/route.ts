import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import * as xlsx from "xlsx"

const prisma = new PrismaClient()

// O ESMAGADOR DE TEXTO (Remove tudo o que não seja letras e números para comparar)
function esmagarTexto(texto: string) {
  if (!texto) return ""
  return String(texto)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Tira acentos
    .replace(/[^a-z0-9]/g, "")       // Tira espaços, pontos, vírgulas, tudo
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) return NextResponse.json({ error: "Nenhum ficheiro detetado." }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const workbook = xlsx.read(buffer, { type: "buffer" })
    const sheetName = workbook.SheetNames[0] 
    const sheet = workbook.Sheets[sheetName]
    
    const rawData = xlsx.utils.sheet_to_json(sheet) as any[]

    const inventarioAtual = await prisma.material.findMany({
      select: { id: true, referenciaInterna: true, quantidade: true, descricao: true, unidade: true }
    })

    const produtosNovos = []
    const produtosAAtualizar = []
    const linhasComErro = []

    for (const row of rawData) {
      const rowNormalizado: Record<string, any> = {}
      for (const key in row) {
        const novaKey = esmagarTexto(key) // Limpa os nomes das colunas
        rowNormalizado[novaKey] = row[key]
      }

      const refRaw = rowNormalizado["referencia"] || rowNormalizado["referenciainterna"] || rowNormalizado["codigo"] || rowNormalizado["ref"] || ""
      const descRaw = rowNormalizado["descricao"] || rowNormalizado["designacao"] || rowNormalizado["nome"] || rowNormalizado["descredicao"] || ""
      const qtdRaw = rowNormalizado["quantidade"] || rowNormalizado["qtd"] || rowNormalizado["stock"] || 0
      
      // Captura a nova coluna separada da Unidade
      const unidRaw = rowNormalizado["un"] || rowNormalizado["unidade"] || rowNormalizado["ud"] || "un"

      const refFinal = String(refRaw).trim()
      const descFinal = String(descRaw).trim()
      const qtdExcel = Number(qtdRaw) || 0
      const unidFinal = String(unidRaw).trim()

      if (!descFinal) {
        linhasComErro.push({ linha: row, erro: "Falta Descrição" })
        continue
      }

      // 🧠 LÓGICA DE CORRESPONDÊNCIA BLINDADA
      let pecaExistente = inventarioAtual.find(p => p.referenciaInterna === refFinal && refFinal !== "")
      
      if (!pecaExistente) {
        // Usa o esmagador para comparar o texto cru (ex: "parafusom10" === "parafusom10")
        const descExcelEsmagada = esmagarTexto(descFinal)
        pecaExistente = inventarioAtual.find(p => esmagarTexto(p.descricao) === descExcelEsmagada)
      }

      if (pecaExistente) {
        // Se encontrou a peça, atualiza tudo o que for novo (Referência, Quantidade e a nova Unidade)
        produtosAAtualizar.push({
          id: pecaExistente.id, 
          referenciaNova: refFinal,
          descricao: pecaExistente.descricao,
          qtdAntiga: pecaExistente.quantidade,
          qtdNova: qtdExcel,
          unidadeNova: unidFinal // Passa a nova unidade
        })
      } else {
        produtosNovos.push({
          referencia: refFinal,
          descricao: descFinal,
          quantidade: qtdExcel,
          unidade: unidFinal
        })
      }
    }

    return NextResponse.json({
      message: "Checkup concluído com sucesso.",
      totalLido: rawData.length,
      novos: produtosNovos,
      atualizar: produtosAAtualizar,
      erros: linhasComErro
    }, { status: 200 })

  } catch (error) {
    console.error("Erro na leitura do Excel:", error)
    return NextResponse.json({ error: "Erro na leitura do ficheiro." }, { status: 500 })
  }
}