import { PrismaClient } from "@prisma/client"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Building2, Wallet, Package, FileText, TrendingUp, TrendingDown } from "lucide-react"
import GerirMateriaisObra from "@/components/GerirMateriaisObra"
import GerirFaturasObra from "@/components/GerirFaturasObra"
import MudarEstadoObra from "@/components/MudarEstadoObra"
import EliminarObraBotao from "@/components/EliminarObraBotao"

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export default async function DetalheObraPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const obraId = resolvedParams.id;

  const obra = await prisma.obra.findUnique({
    where: { id: obraId },
    include: {
      materiais: { include: { material: true } },
      documentos: true
    }
  })

  if (!obra) notFound()

  const inventario = await prisma.material.findMany({ orderBy: { descricao: 'asc' } })

  const orcamento = obra.orcamento || 0
  const saldo = orcamento - obra.custoTotal
  const formatadorMoeda = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' })

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto space-y-8">
      
      {/* NAVEGAÇÃO, TÍTULO E BOTÃO DE ELIMINAR (Com Pintura Dupla!) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/obras" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors bg-white dark:bg-slate-800 p-2.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
              <Building2 className="text-blue-600 dark:text-blue-500" />
              {obra.nome}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-2">
              <p className="text-sm text-slate-600 dark:text-slate-400">{obra.localizacao || "Sem localização"} • </p>
              <MudarEstadoObra obraId={obra.id} estadoAtual={obra.estado} />
            </div>
          </div>
        </div>
        
        {/* O botão de Eliminar que me tinhas pedido */}
        <EliminarObraBotao obraId={obra.id} nomeObra={obra.nome} />
      </div>

      {/* DASHBOARD FINANCEIRO (Cores adaptáveis à luz) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm dark:shadow-xl border-l-4 border-l-blue-500 transition-colors">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
            <Wallet size={16} /> Orçamento
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {orcamento > 0 ? formatadorMoeda.format(orcamento) : "Não definido"}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm dark:shadow-xl border-l-4 border-l-red-500 transition-colors">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
            <FileText size={16} /> Custos Faturados
          </p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatadorMoeda.format(obra.custoTotal)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Via Faturas/Materiais</p>
        </div>

        <div className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm dark:shadow-xl border-l-4 transition-colors ${saldo >= 0 ? 'border-l-green-500' : 'border-l-red-500'}`}>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
            {saldo >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />} Saldo
          </p>
          <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-500'}`}>
            {formatadorMoeda.format(saldo)}
          </p>
        </div>
      </div>

      {/* ÁREA DE GESTÃO (Tabelas adaptáveis) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm dark:shadow-xl transition-colors">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/30">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Package className="text-blue-600 dark:text-blue-400" /> Materiais da Obra
            </h2>
            <p className="text-sm text-slate-500 mt-1">Registo do que saiu do armazém para esta pista.</p>
          </div>
          <div className="p-6">
            <GerirMateriaisObra obraId={obra.id} materiaisAlocados={obra.materiais} inventario={inventario} />
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm dark:shadow-xl transition-colors">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/30">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileText className="text-red-600 dark:text-red-400" /> Faturas e Custos
            </h2>
            <p className="text-sm text-slate-500 mt-1">Anexos e faturas submetidas.</p>
          </div>
          <div className="p-6">
            <GerirFaturasObra obraId={obra.id} documentos={obra.documentos} />
          </div>
        </div>
      </div>

    </div>
  )
}