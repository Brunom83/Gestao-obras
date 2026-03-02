import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { writeFile } from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()

// O TEU CÓDIGO ORIGINAL DO POST (INTACTO)
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const obraId = resolvedParams.id;
    
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const descricao = formData.get('descricao') as string;
    const valor = Number(formData.get('valor'));

    if (!descricao || !valor || valor <= 0) {
      return NextResponse.json({ error: "A descrição e o valor são obrigatórios." }, { status: 400 })
    }

    let caminhoFicheiro = "Sem anexo";
    let tamanho = 0;
    let tipo = "Desconhecido";
    let nomeOriginal = descricao;

    if (file) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        const filename = Date.now() + '-' + file.name.replace(/\s+/g, '_');
        const filepath = path.join(process.cwd(), 'public/uploads', filename);
        
        await writeFile(filepath, buffer);
        
        caminhoFicheiro = `/uploads/${filename}`;
        tamanho = file.size;
        tipo = file.type;
        nomeOriginal = file.name;
    }

    const resultado = await prisma.$transaction([
      prisma.documento.create({
        data: {
          obraId,
          nomeOriginal,
          caminhoFicheiro,
          tamanho,
          tipo,
          categoria: "FATURA",
          valor
        }
      }),
      prisma.obra.update({
        where: { id: obraId },
        data: { custoTotal: { increment: valor } } // SOMA O VALOR
      })
    ]);

    return NextResponse.json(resultado[0], { status: 201 })
  } catch (error) {
    console.error("Erro ao gravar fatura:", error)
    return NextResponse.json({ error: "Erro no motor do servidor HP." }, { status: 500 })
  }
}

// O NOVO CÓDIGO DO DELETE (PARA REMOVER A FATURA)
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const obraId = resolvedParams.id;
    
    const { searchParams } = new URL(request.url)
    const docId = searchParams.get("docId")

    if (!docId) return NextResponse.json({ error: "ID em falta." }, { status: 400 })

    // 1. Encontrar o documento para saber qual era o valor dele
    const fatura = await prisma.documento.findUnique({ where: { id: docId } })
    if (!fatura) return NextResponse.json({ error: "Fatura fantasma." }, { status: 404 })

    const valorDescontar = fatura.valor || 0

    // 2. Apagar a fatura E subtrair o valor à obra ao mesmo tempo!
    await prisma.$transaction([
      prisma.documento.delete({ where: { id: docId } }),
      prisma.obra.update({
        where: { id: obraId },
        data: { custoTotal: { decrement: valorDescontar } } // SUBTRAI O VALOR
      })
    ])

    return NextResponse.json({ message: "Eliminado." }, { status: 200 })
  } catch (error) {
    console.error("Erro ao eliminar fatura:", error)
    return NextResponse.json({ error: "Erro interno no servidor HP." }, { status: 500 })
  }
}