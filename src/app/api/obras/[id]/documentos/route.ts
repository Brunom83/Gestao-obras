import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { writeFile } from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const obraId = resolvedParams.id;
    
    // Ao contrário de texto (JSON), ficheiros viajam em "FormData"
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

    // Se houver um ficheiro anexado, o Accelecharger de gravação entra em ação!
    if (file) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Dá um nome único ao ficheiro para não haver colisões no servidor HP
        const filename = Date.now() + '-' + file.name.replace(/\s+/g, '_');
        const filepath = path.join(process.cwd(), 'public/uploads', filename);
        
        // Grava fisicamente no disco do servidor
        await writeFile(filepath, buffer);
        
        caminhoFicheiro = `/uploads/${filename}`;
        tamanho = file.size;
        tipo = file.type;
        nomeOriginal = file.name;
    }

    // A MANOBRA TEKU (Transação): Cria o documento E atualiza o custo da obra ao mesmo tempo!
    const resultado = await prisma.$transaction([
      prisma.documento.create({
        data: {
          obraId,
          nomeOriginal,
          caminhoFicheiro,
          tamanho,
          tipo,
          categoria: "FATURA",
          valor // A nossa gaveta nova a ser preenchida!
        }
      }),
      prisma.obra.update({
        where: { id: obraId },
        data: { custoTotal: { increment: valor } }
      })
    ]);

    return NextResponse.json(resultado[0], { status: 201 })
  } catch (error) {
    console.error("Erro ao gravar fatura:", error)
    return NextResponse.json({ error: "Erro no motor do servidor HP." }, { status: 500 })
  }
}