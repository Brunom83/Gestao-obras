import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log("A limpar a base de dados antiga...")
  // Apaga todos os registos antigos da tabela de materiais
  await prisma.material.deleteMany({})
  console.log("Base de dados limpa. A iniciar a nova importação...")
  
  const filePath = path.join(process.cwd(), 'Inventario_material_c.csv')
  // Agora lemos o ficheiro que já gravaste em UTF-8
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  
  const lines = fileContent.split('\n')
  let registosInseridos = 0

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const colunas = line.split(';')
    const descricao = colunas[0]?.trim()
    const medidas = colunas[1]?.trim() || null
    const quantidadeRaw = colunas[2]?.trim() || "0"

    if (!descricao) continue

    let quantidade = 0
    let unidade = "un"
    
    const match = quantidadeRaw.match(/([\d,.]+)\s*([a-zA-Z]+)?/)
    if (match) {
      quantidade = parseFloat(match[1].replace(',', '.'))
      if (match[2]) {
        unidade = match[2].toLowerCase()
      }
    }

    await prisma.material.create({
      data: {
        descricao: descricao,
        medidas: medidas,
        quantidade: isNaN(quantidade) ? 0 : quantidade,
        unidade: unidade
      }
    })
    registosInseridos++
  }

  console.log(`✅ Sucesso! ${registosInseridos} materiais importados com caracteres corretos.`)
}

main()
  .catch((e) => {
    console.error("❌ Erro:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })