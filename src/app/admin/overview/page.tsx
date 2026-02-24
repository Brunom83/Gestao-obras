import { PrismaClient } from "@prisma/client"
import Link from "next/link"
import { Building2, Package, AlertTriangle, TrendingUp, ArrowRight } from "lucide-react"

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic' // O motor atualiza sempre os dados em tempo real

export default async function OverviewPage() {
  // 1. Conta quantas obras estão atualmente em andamento
  const obrasAtivas = await prisma.obra.count({
    where: { estado: 'EM_CURSO' }
  })

  // 2. Faz a matemática global: soma todos os custos acumulados de todas as obras
  const statsCustos = await prisma.obra.aggregate({
    _sum: { custoTotal: true }
  })
  const custoTotalEmpresa = statsCustos._sum.custoTotal || 0

  // 3. Alerta de Rutura: Vai buscar os materiais com menos de 10 unidades
  const materiaisEmRutura = await prisma.material.findMany({
    where: { quantidade: { lt: 10 } },
    orderBy: { quantidade: 'asc' },
    take: 6 // Mostra os 6 mais críticos para não encher o ecrã
  })

  // Formatação de dinheiro
  const formatadorMoeda = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' })

  return (
    <div className="p-8 w-full max-w-7xl mx-auto space-y-8">
      
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Painel de Controlo</h1>
        <p className="text-slate-400 mt-2">Visão geral do negócio e alertas do sistema.</p>
      </div>

      {/* Grelha de Cartões Principais (O Nitrox do CEO) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Cartão de Obras */}
        <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400 mb-1">Obras em Andamento</p>
            <p className="text-3xl font-bold text-slate-100">{obrasAtivas}</p>
          </div>
          <div className="bg-blue-600/20 p-4 rounded-full text-blue-500">
            <Building2 size={32} />
          </div>
        </div>

        {/* Cartão Financeiro Global */}
        <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400 mb-1">Custo Global Acumulado</p>
            <p className="text-3xl font-bold text-slate-100">{formatadorMoeda.format(custoTotalEmpresa)}</p>
          </div>
          <div className="bg-red-600/20 p-4 rounded-full text-red-500">
            <TrendingUp size={32} />
          </div>
        </div>

        {/* Cartão do Armazém */}
        <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400 mb-1">Alertas de Stock</p>
            <p className="text-3xl font-bold text-yellow-400">{materiaisEmRutura.length}</p>
          </div>
          <div className="bg-yellow-600/20 p-4 rounded-full text-yellow-500">
            <AlertTriangle size={32} />
          </div>
        </div>
      </div>

      {/* Secção Inferior: Tabela de Alertas Críticos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Tabela de Rutura de Stock */}
        <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden">
          <div className="p-5 border-b border-slate-700 bg-slate-800/80 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
              <Package className="text-yellow-500" size={20} />
              Materiais a Esgotar ( menos de 10 un)
            </h2>
            <Link href="/admin/inventario" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
              Ver Inventário <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="p-2">
            {materiaisEmRutura.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p>O armazém está bem abastecido. Nenhum alerta crítico.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs text-slate-500 uppercase bg-slate-900/50">
                  <tr>
                    <th className="px-4 py-3">Material</th>
                    <th className="px-4 py-3 text-right">Stock Atual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {materiaisEmRutura.map(mat => (
                    <tr key={mat.id} className="hover:bg-slate-700/30">
                      <td className="px-4 py-3 font-medium text-slate-200">{mat.descricao}</td>
                      <td className="px-4 py-3 text-right font-bold text-yellow-500">
                        {mat.quantidade} {mat.unidade}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Espaço reservado para o futuro (Ex: Gráficos ou Atividades Recentes) */}
        <div className="bg-slate-900/50 rounded-lg border border-slate-700 border-dashed flex items-center justify-center p-8">
          <div className="text-center text-slate-500">
            <TrendingUp className="mx-auto mb-2 opacity-30" size={40} />
            <p>Espaço reservado para gráficos financeiros</p>
            <p className="text-xs mt-1">(Fase 2 do Projeto)</p>
          </div>
        </div>

      </div>
    </div>
  )
}