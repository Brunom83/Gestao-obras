import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import * as xlsx from "xlsx"

const prisma = new PrismaClient()

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
      select: { referenciaInterna: true, quantidade: true, descricao: true }
    })

    const produtosNovos = []
    const produtosAAtualizar = []
    const linhasComErro = []

    for (const row of rawData) {
      const ref = row["Referencia"] || row["referencia"] || row["Referência"]
      const desc = row["Descricao"] || row["descricao"] || row["Descrição"]
      const qtdExcel = Number(row["Quantidade"] || row["quantidade"] || 0)

      if (!ref || !desc) {
        linhasComErro.push({ linha: row, erro: "Falta Referência ou Descrição" })
        continue
      }

      const pecaExistente = inventarioAtual.find(p => p.referenciaInterna === ref)

      if (pecaExistente) {
        if (pecaExistente.quantidade !== qtdExcel) {
          produtosAAtualizar.push({
            referencia: ref,
            descricao: desc,
            qtdAntiga: pecaExistente.quantidade,
            qtdNova: qtdExcel
          })
        }
      } else {
        produtosNovos.push({
          referencia: ref,
          descricao: desc,
          quantidade: qtdExcel
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
    return NextResponse.json({ error: "Os Drones intercetaram a leitura." }, { status: 500 })
  }
}