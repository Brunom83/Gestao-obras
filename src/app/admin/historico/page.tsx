import { PrismaClient } from "@prisma/client"
import { Activity, ArrowDownRight, ArrowUpRight, Search } from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

const prisma = new PrismaClient()
export const dynamic = 'force-dynamic'

export default async function HistoricoPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect("/login")

  // 1. Bloqueio de Segurança: Só a Gerência/Master deve ver a Caixa Negra
  const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } })
  const userRole = currentUser?.role || "USER"
  
  if (userRole !== "MASTER" && userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
    redirect("/admin/overview") // Chuta os curiosos para a página inicial
  }

  // 2. Extrair os dados todos da Caixa Negra do servidor HP
  const logs = await prisma.logInventario.findMany({
    include: {
      material: true,
      user: true
    },
    orderBy: { createdAt: 'desc' },
    take: 100 // Mostramos os últimos 100 movimentos para o ecrã carregar rápido
  })

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Activity className="text-slate-800 dark:text-slate-200" size={32} />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Auditoria (Caixa Negra)</h1>
        </div>
        <p className="text-sm font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 py-2 px-4 rounded-lg">
          Últimos {logs.length} movimentos registados
        </p>
      </div>

      {/* A Tabela de Raio-X */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="p-4 font-semibold">Data / Hora</th>
                <th className="p-4 font-semibold">Operador</th>
                <th className="p-4 font-semibold">Ação</th>
                <th className="p-4 font-semibold">Material</th>
                <th className="p-4 font-semibold text-right">Movimento</th>
                <th className="p-4 font-semibold text-right">Stock Final</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Nenhum movimento registado ainda.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isEntrada = log.quantidadeMov > 0
                  
                  return (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      {/* Data */}
                      <td className="p-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('pt-PT', { 
                          day: '2-digit', month: '2-digit', year: 'numeric', 
                          hour: '2-digit', minute: '2-digit' 
                        })}
                      </td>
                      
                      {/* Operador */}
                      <td className="p-4 font-medium text-slate-900 dark:text-slate-200">
                        {log.user.name || log.user.email}
                      </td>
                      
                      {/* Ação (Com a justificação em baixo) */}
                      <td className="p-4 max-w-xs">
                        <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          {log.acao.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-slate-500 line-clamp-2" title={log.detalhes || ""}>
                          {log.detalhes}
                        </span>
                      </td>

                      {/* Material (Com escudo para peças apagadas) */}
                      <td className="p-4 text-slate-800 dark:text-slate-200 font-medium">
                        {log.material?.descricao ? (
                          log.material.descricao
                        ) : (
                          <span className="text-red-500 text-xs font-bold uppercase tracking-wider bg-red-100 dark:bg-red-500/10 px-2 py-1 rounded">
                            Peça Eliminada
                          </span>
                        )}
                      </td>

                      {/* Movimento Visual (Verde a subir, Vermelho a descer) */}
                      <td className="p-4 text-right font-bold">
                        <div className={`flex items-center justify-end gap-1 ${isEntrada ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {isEntrada ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                          {isEntrada ? '+' : ''}{log.quantidadeMov}
                        </div>
                      </td>

                      {/* Stock Final (Também protegido contra nulls na unidade) */}
                      <td className="p-4 text-right font-mono text-slate-600 dark:text-slate-400">
                        {log.stockNovo} <span className="text-xs">{log.material?.unidade || "un"}</span>
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
  )
}