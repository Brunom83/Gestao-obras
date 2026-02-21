import { PrismaClient } from "@prisma/client"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Building2, Wallet, Users, Package, FileText, Clock } from "lucide-react"
import GerirMateriaisObra from "@/components/GerirMateriaisObra"
import GerirHorasObra from "@/components/GerirHorasObra"

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export default async function DetalheObraPage({ params }: { params: Promise<{ id: string }> }) {
  
  // 1. Resolve os parâmetros da rota
  const resolvedParams = await params;
  const obraId = resolvedParams.id;

  // 2. Vai buscar a obra com TODAS as relações
  const obra = await prisma.obra.findUnique({
    where: { id: obraId },
    include: {
      materiais: { include: { material: true } },
      documentos: true,
      registosHoras: { 
        include: { funcionario: true },
        orderBy: { data: 'desc' }
      } 
    }
  })

  // Se o utilizador tentar aceder a um ID que não existe, mostra a página 404
  if (!obra) {
    notFound()
  }

  // 3. RECUPERADO: Vai buscar o inventário ao armazém central
  const inventario = await prisma.material.findMany({
    orderBy: { descricao: 'asc' }
  })

  // 4. Vai buscar a lista de trabalhadores para o dropdown das horas
  const funcionarios = await prisma.funcionario.findMany({
    orderBy: { nome: 'asc' }
  })

  // Matemática para o novo cartão: Soma todas as horas registadas nesta obra
  const totalHorasObra = obra.registosHoras.reduce((acc, reg) => acc + reg.horas, 0)

  // Formatação de moeda para os orçamentos
  const formatadorMoeda = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' })

  return (
    <div className="p-8 w-full max-w-7xl mx-auto">
      {/* Navegação e Título */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/obras" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
            <Building2 className="text-blue-500" />
            {obra.nome}
          </h1>
          <p className="text-slate-400 mt-1">{obra.localizacao || "Localização não especificada"}</p>
        </div>
      </div>

      {/* Cartões de Resumo Financeiro / Estado (AGORA SÃO 4 COLUNAS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 shadow-md">
          <p className="text-slate-400 text-sm font-medium mb-1">Estado do Projeto</p>
          <p className="text-xl font-bold text-slate-200">{obra.estado.replace('_', ' ')}</p>
        </div>
        
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 shadow-md">
          <p className="text-slate-400 text-sm font-medium mb-1">Orçamento Previsto</p>
          <p className="text-xl font-bold text-slate-200">
            {obra.orcamento ? formatadorMoeda.format(obra.orcamento) : "Não definido"}
          </p>
        </div>

        {/* NOVO CARTÃO: Total de Horas */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 shadow-md">
          <p className="text-slate-400 text-sm font-medium mb-1 flex items-center gap-2">
            <Clock size={16} className="text-blue-400" /> Total de Horas
          </p>
          <p className="text-xl font-bold text-blue-400">
            {totalHorasObra} h
          </p>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 shadow-md">
          <p className="text-slate-400 text-sm font-medium mb-1">Custos Acumulados</p>
          <p className={`text-xl font-bold ${obra.orcamento && obra.custoTotal > obra.orcamento ? 'text-red-400' : 'text-slate-200'}`}>
            {formatadorMoeda.format(obra.custoTotal)}
          </p>
        </div>
      </div>

      {/* Sistema de Abas (Navegação Interna da Obra) */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden shadow-xl">
        <div className="flex border-b border-slate-700 overflow-x-auto">
          <button className="flex items-center gap-2 px-6 py-4 text-sm font-medium text-blue-400 border-b-2 border-blue-400 bg-slate-800/50">
            <Package size={18} /> Materiais Alocados
          </button>
          <button className="flex items-center gap-2 px-6 py-4 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors">
            <Users size={18} /> Equipas e Horas
          </button>
          <button className="flex items-center gap-2 px-6 py-4 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors">
            <FileText size={18} /> Documentos
          </button>
          <button className="flex items-center gap-2 px-6 py-4 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors">
            <Wallet size={18} /> Balanço Financeiro
          </button>
        </div>

        {/* Conteúdo da Aba Ativa (Materiais) */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-100 mb-6 flex items-center gap-2">
            <Package className="text-slate-400" /> Materiais Alocados
          </h2>
          <GerirMateriaisObra 
            obraId={obra.id} 
            materiaisAlocados={obra.materiais} 
            inventario={inventario} 
          />
        </div>

        {/* Conteúdo da Aba de Horas */}
        <div className="p-6 border-t border-slate-700 bg-slate-800/30">
          <h2 className="text-2xl font-bold text-slate-100 mb-6 flex items-center gap-2">
            <Users className="text-slate-400" /> Equipas e Horas
          </h2>
          <GerirHorasObra 
            obraId={obra.id}
            funcionarios={funcionarios}
            registosHoras={obra.registosHoras}
          />
        </div>
      </div>
    </div>
  )
}