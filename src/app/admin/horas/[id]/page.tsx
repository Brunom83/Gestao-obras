import { PrismaClient } from "@prisma/client"
import Link from "next/link"
import { ArrowLeft, Clock, HardHat } from "lucide-react"
import RegistoHorasForm from "@/components/RegistoHorasForm"

const prisma = new PrismaClient()

export default async function LancarHorasObra({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const obraId = resolvedParams.id

  // O servidor HP vai buscar a obra específica
  const obra = await prisma.obra.findUnique({ where: { id: obraId } })
  
  // E vai buscar todos os funcionários para o chefe poder escolher quem trabalhou
  const funcionarios = await prisma.funcionario.findMany({
    orderBy: { nome: 'asc' }
  })

  if (!obra) {
    return (
      <div className="p-8 text-center text-slate-300">
        <h1>Erro no Reino: Obra não encontrada no radar.</h1>
        <Link href="/admin/horas" className="text-blue-500 hover:underline">Voltar à base</Link>
      </div>
    )
  }

  return (
    <div className="p-8 w-full max-w-4xl mx-auto">
      {/* Botão de fuga rápido */}
      <Link href="/admin/horas" className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors mb-6">
        <ArrowLeft size={20} /> Voltar à lista de Obras
      </Link>

      <div className="bg-slate-800 rounded-xl shadow-xl border border-slate-700 p-6 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
              <HardHat className="text-blue-500" /> {obra.nome}
            </h1>
            <p className="text-slate-400 mt-2 text-sm">{obra.localizacao}</p>
          </div>
          <span className="bg-blue-600/20 text-blue-400 py-1 px-3 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-500/20">
            Registo de Ponto
          </span>
        </div>
      </div>

      {/* Aqui injetamos o formulário interativo, passando-lhe o ID da obra e a lista de malta */}
      <RegistoHorasForm obraId={obra.id} funcionarios={funcionarios} />
    </div>
  )
}