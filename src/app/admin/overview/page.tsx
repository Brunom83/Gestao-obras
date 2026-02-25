import { PrismaClient } from "@prisma/client"
import Link from "next/link"
import { LayoutDashboard, TrendingUp, AlertTriangle, Hammer, Wallet, Users } from "lucide-react"

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export default async function OverviewPage() {
  // 1. Puxar Obras Ativas para a matemática Global
  const obrasAtivas = await prisma.obra.findMany({
    where: { estado: 'EM_CURSO' },
    orderBy: { dataInicio: 'desc' }
  })

  // 2. O Radar de Problemas: Puxar Materiais na "Reserva" (Stock abaixo de 10)
  const alertasStock = await prisma.material.findMany({
    where: { quantidade: { lt: 10 } }, 
    orderBy: { quantidade: 'asc' },
    take: 5 // Mostra só as 5 emergências maiores para não entupir o ecrã
  })

  // 3. Contagem de malta no terreno
  const totalFuncionarios = await prisma.funcionario.count()

  // MATEMÁTICA GLOBAL DO CEO
  const orcamentoTotal = obrasAtivas.reduce((acc, obra) => acc + (obra.orcamento || 0), 0)
  const custoTotal = obrasAtivas.reduce((acc, obra) => acc + obra.custoTotal, 0)
  const saldoGlobal = orcamentoTotal - custoTotal

  const formatadorMoeda = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' })

  return (
    <div className="p-8 w-full max-w-7xl mx-auto space-y-8">
      
      {/* Cabeçalho */}
      <div className="flex items-center gap-3">
        <LayoutDashboard className="text-blue-500" size={32} />
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Quartel General</h1>
          <p className="text-slate-400">Telemetria Global da Empresa</p>
        </div>
      </div>

      {/* DASHBOARD PRINCIPAL (Métricas Globais) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-xl border-t-4 border-t-blue-500">
          <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
            <Hammer size={16} /> Obras Ativas
          </p>
          <p className="text-3xl font-bold text-slate-100">{obrasAtivas.length}</p>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-xl border-t-4 border-t-purple-500">
          <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
            <Wallet size={16} /> Orçamento Global
          </p>
          <p className="text-3xl font-bold text-purple-400">{formatadorMoeda.format(orcamentoTotal)}</p>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-xl border-t-4 border-t-red-500">
          <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
            <TrendingUp size={16} /> Custos Totais
          </p>
          <p className="text-3xl font-bold text-red-400">{formatadorMoeda.format(custoTotal)}</p>
        </div>

        <div className={`bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-xl border-t-4 ${saldoGlobal >= 0 ? 'border-t-green-500' : 'border-t-red-500'}`}>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
            <Wallet size={16} /> Saldo Empresarial
          </p>
          <p className={`text-3xl font-bold ${saldoGlobal >= 0 ? 'text-green-400' : 'text-red-500'}`}>
            {formatadorMoeda.format(saldoGlobal)}
          </p>
        </div>
      </div>

      {/* GRELHA SECUNDÁRIA: Alertas e Monitor de Corridas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Lado Esquerdo: Alertas de Stock (O Radar de Problemas) */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl lg:col-span-1">
          <div className="p-5 border-b border-slate-800 bg-red-900/20">
            <h2 className="text-lg font-bold text-red-400 flex items-center gap-2">
              <AlertTriangle size={20} /> Alertas de Stock
            </h2>
            <p className="text-xs text-slate-400 mt-1">Materiais na reserva (&lt; 10 unidades)</p>
          </div>
          <ul className="p-4 space-y-3">
            {alertasStock.length === 0 ? (
              <li className="text-sm text-green-400 text-center py-4 bg-slate-800 rounded border border-slate-700">Stock saudável. Tudo a rolar!</li>
            ) : (
              alertasStock.map(mat => (
                <li key={mat.id} className="flex justify-between items-center bg-slate-800 p-3 rounded-lg border border-red-900/50 hover:bg-slate-700 transition-colors">
                  <span className="text-slate-200 text-sm truncate max-w-[65%]">{mat.descricao}</span>
                  <span className="text-red-400 font-bold font-mono text-sm bg-red-900/30 px-2 py-1 rounded">{mat.quantidade} {mat.unidade}</span>
                </li>
              ))
            )}
          </ul>
          <div className="p-4 border-t border-slate-800 bg-slate-800/30 text-center">
            <Link href="/admin/inventario" className="text-sm text-blue-400 hover:text-blue-300 font-bold transition-colors">Gerir Armazém &rarr;</Link>
          </div>
        </div>

        {/* Lado Direito: Saúde das Obras (Monitor Principal) */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl lg:col-span-2">
          <div className="p-5 border-b border-slate-800 bg-blue-900/20 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-blue-400 flex items-center gap-2">
                <LayoutDashboard size={20} /> Monitor de Obras
              </h2>
              <p className="text-xs text-slate-400 mt-1">Ponto de situação dos projetos em curso</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
              <Users size={16} /> {totalFuncionarios} Operários Ativos
            </div>
          </div>
          
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-500 uppercase text-xs border-b border-slate-700">
                <tr>
                  <th className="pb-3 font-medium">Obra</th>
                  <th className="pb-3 font-medium text-right hidden sm:table-cell">Orçamento</th>
                  <th className="pb-3 font-medium text-right">Custos</th>
                  <th className="pb-3 font-medium text-right">Margem</th>
                  <th className="pb-3 font-medium text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {obrasAtivas.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">Nenhuma obra em curso. A pista está limpa.</td>
                  </tr>
                ) : (
                  obrasAtivas.map(obra => {
                    const orcamento = obra.orcamento || 0
                    const saldo = orcamento - obra.custoTotal
                    // O Alerta de Perigo acende se tiveres orçamento definido e já o ultrapassaste!
                    const isPerigo = orcamento > 0 && saldo < 0

                    return (
                      <tr key={obra.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-4 font-bold text-slate-200">{obra.nome}</td>
                        <td className="py-4 text-right text-slate-400 hidden sm:table-cell">{formatadorMoeda.format(orcamento)}</td>
                        <td className="py-4 text-right text-red-400">{formatadorMoeda.format(obra.custoTotal)}</td>
                        <td className={`py-4 text-right font-bold ${isPerigo ? 'text-red-500' : 'text-green-400'}`}>
                          {formatadorMoeda.format(saldo)}
                        </td>
                        <td className="py-4 text-center">
                          <Link href={`/admin/obras/${obra.id}`} className="inline-block bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded text-xs font-bold transition-colors">
                            Ver Detalhe
                          </Link>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}