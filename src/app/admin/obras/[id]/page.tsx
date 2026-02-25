import { PrismaClient } from "@prisma/client"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Building2, Wallet, Users, Package, FileText, Clock, TrendingUp, TrendingDown } from "lucide-react"
import GerirMateriaisObra from "@/components/GerirMateriaisObra"
import GerirHorasObra from "@/components/GerirHorasObra"
import GerirFaturasObra from "@/components/GerirFaturasObra"
import MudarEstadoObra from "@/components/MudarEstadoObra"

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export default async function DetalheObraPage({ params }: { params: Promise<{ id: string }> }) {
  
  const resolvedParams = await params;
  const obraId = resolvedParams.id;

  // 1. O Servidor HP puxa tudo do PostgreSQL
  const obra = await prisma.obra.findUnique({
    where: { id: obraId },
    include: {
      materiais: { include: { material: true } },
      documentos: true, // Já a preparar o Reino das Faturas!
      registosHoras: { 
        include: { funcionario: true },
        orderBy: { data: 'desc' }
      } 
    }
  })

  if (!obra) notFound()

  // 2. Busca de dados auxiliares para os teus componentes
  const inventario = await prisma.material.findMany({ orderBy: { descricao: 'asc' } })
  const funcionarios = await prisma.funcionario.findMany({ orderBy: { nome: 'asc' } })

  // 3. MATEMÁTICA DO PLANEAMENTO (Zero salários aqui!)
  const totalHorasObra = obra.registosHoras.reduce((acc, reg) => acc + reg.horas, 0)
  
  // Radar Inteligente: Quem já trabalhou nesta obra? (Para o gestor planear equipas)
  const trabalhadoresUnicos = Array.from(new Set(obra.registosHoras.map(r => r.funcionario.nome)))

  // Matemática Financeira (Baseada nas Faturas que vão entrar no Custo Total)
  const orcamento = obra.orcamento || 0
  const saldo = orcamento - obra.custoTotal
  const formatadorMoeda = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' })

  return (
    <div className="p-8 w-full max-w-7xl mx-auto space-y-8">
      
      {/* Navegação e Título */}
      <div className="flex items-center gap-4">
        <Link href="/admin/obras" className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded-full border border-slate-700">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
            <Building2 className="text-blue-500" />
            {obra.nome}
          </h1>
          {/* AQUI ENTRA A NOSSA ALAVANCA DE MUDANÇAS */}
          <div className="flex items-center gap-3 mt-2">
            <p className="text-slate-400">{obra.localizacao || "Sem localização"} • </p>
            <MudarEstadoObra obraId={obra.id} estadoAtual={obra.estado} />
            </div>
        </div>
      </div>

      {/* DASHBOARD DE PLANEAMENTO E FATURAÇÃO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-xl border-l-4 border-l-blue-500">
          <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
            <Wallet size={16} /> Orçamento
          </p>
          <p className="text-2xl font-bold text-slate-100">
            {orcamento > 0 ? formatadorMoeda.format(orcamento) : "Não definido"}
          </p>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-xl border-l-4 border-l-red-500">
          <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
            <FileText size={16} /> Custos Faturados
          </p>
          <p className="text-2xl font-bold text-red-400">
            {formatadorMoeda.format(obra.custoTotal)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Via Faturas/Materiais</p>
        </div>

        <div className={`bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-xl border-l-4 ${saldo >= 0 ? 'border-l-green-500' : 'border-l-red-500'}`}>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
            {saldo >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />} Saldo
          </p>
          <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-green-400' : 'text-red-500'}`}>
            {formatadorMoeda.format(saldo)}
          </p>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-xl border-l-4 border-l-purple-500">
          <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
            <Clock size={16} /> Mão de Obra
          </p>
          <p className="text-2xl font-bold text-purple-400">
            {totalHorasObra} <span className="text-lg">h</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">{trabalhadoresUnicos.length} operários alocados</p>
        </div>
      </div>

      {/* BLOCO 1: GESTÃO LOGÍSTICA E EQUIPAS (Os teus componentes originais) */}
      <div className="flex flex-col gap-8">
        
        {/* Lado Esquerdo: Inventário Alocado */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800 bg-slate-800/30">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Package className="text-blue-400" /> Materiais da Obra
            </h2>
            <p className="text-sm text-slate-500 mt-1">Registo do que saiu do armazém para esta pista.</p>
          </div>
          <div className="p-6">
            <GerirMateriaisObra obraId={obra.id} materiaisAlocados={obra.materiais} inventario={inventario} />
          </div>
        </div>

        {/* Lado Direito: Histórico de Equipas */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800 bg-slate-800/30">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Users className="text-purple-400" /> Histórico de Equipas
            </h2>
            <p className="text-sm text-slate-500 mt-1">Registo de horas inseridas pelos chefes no terreno.</p>
          </div>
          <div className="p-6">
            <GerirHorasObra obraId={obra.id} funcionarios={funcionarios} registosHoras={obra.registosHoras} />
          </div>
        </div>

      </div>

      {/* BLOCO 2: ÁREA DE FATURAÇÃO (Preparação para o futuro) */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 bg-slate-800/30">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="text-red-400" /> Faturas e Custos Externos
          </h2>
        </div>
        <div className="p-6">
          <GerirFaturasObra obraId={obra.id} documentos={obra.documentos} />
        </div>
      </div>
        <div className="p-8 text-center">
          <FileText className="text-slate-700 mx-auto mb-3" size={48} />
          <p className="text-slate-500">Módulo de Upload de Faturas a ser instalado em breve...</p>
        </div>
      </div>
  )
}