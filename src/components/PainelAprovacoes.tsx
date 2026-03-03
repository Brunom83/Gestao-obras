"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, XCircle, Clock, Archive, Package, AlertCircle } from "lucide-react"
import toast from "react-hot-toast"

type Ticket = {
  id: string
  quantidade: number
  estado: string
  dataPedido: Date
  dataResposta: Date | null
  obra: { nome: string }
  material: { descricao: string; unidade: string | null }
  requisitante: { name: string | null; email: string | null }
  aprovador: { name: string | null } | null
}

export default function PainelAprovacoes({ ticketsIniciais }: { ticketsIniciais: Ticket[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [abaAtiva, setAbaAtiva] = useState<'PRODUCAO' | 'ARMAZEM' | 'HISTORICO'>('PRODUCAO')

  const handleAcao = async (id: string, acao: 'aprovar_producao' | 'aprovar_armazem' | 'rejeitar') => {
    setLoading(id)
    const toastId = toast.loading("A processar no servidor HP...")

    try {
      const res = await fetch(`/api/pedidos-material/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao })
      })

      if (res.ok) {
        toast.success("Mudança de caixa concluída!", { id: toastId })
        router.refresh()
      } else {
        const error = await res.json()
        toast.error(error.error || "Erro ao processar o ticket.", { id: toastId })
      }
    } catch (error) {
      toast.error("Falha de comunicação com o servidor.", { id: toastId })
    } finally {
      setLoading(null)
    }
  }

  // O RADAR AFINADO: 'PENDENTE' em vez de 'AGUARDA_PRODUCAO'
  const ticketsFiltrados = ticketsIniciais.filter(t => {
    if (abaAtiva === 'PRODUCAO') return t.estado === 'PENDENTE' 
    if (abaAtiva === 'ARMAZEM') return t.estado === 'AGUARDA_ARMAZEM'
    return t.estado === 'ENTREGUE' || t.estado === 'REJEITADO'
  })

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
      
      {/* Navegação das Abas */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
        <button 
          onClick={() => setAbaAtiva('PRODUCAO')}
          className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors flex justify-center items-center gap-2 ${abaAtiva === 'PRODUCAO' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-500 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <Clock size={18} /> Aprovação Produção
        </button>
        <button 
          onClick={() => setAbaAtiva('ARMAZEM')}
          className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors flex justify-center items-center gap-2 ${abaAtiva === 'ARMAZEM' ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 border-b-2 border-amber-600 dark:border-amber-500 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <Package size={18} /> Saída de Armazém
        </button>
        <button 
          onClick={() => setAbaAtiva('HISTORICO')}
          className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors flex justify-center items-center gap-2 ${abaAtiva === 'HISTORICO' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 border-b-2 border-slate-900 dark:border-slate-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <Archive size={18} /> Histórico
        </button>
      </div>

      {/* Tabela de Tickets */}
      <div className="overflow-x-auto p-4 md:p-6 min-h-[400px]">
        {ticketsFiltrados.length === 0 ? (
          <div className="text-center py-20 text-slate-400 dark:text-slate-500 flex flex-col items-center">
            <AlertCircle size={48} className="mb-4 opacity-50" />
            <p className="text-lg">Radar limpo. Não há tickets nesta secção.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {ticketsFiltrados.map((ticket) => (
              <div key={ticket.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:border-blue-400 dark:hover:border-slate-500">
                
                {/* Info do Pedido */}
                <div className="space-y-1 flex-1 w-full">
                  <div className="flex items-center justify-between md:justify-start gap-3 mb-2">
                    <span className={`px-2.5 py-1 rounded text-xs font-bold tracking-wider ${
                      ticket.estado === 'PENDENTE' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30' :
                      ticket.estado === 'AGUARDA_ARMAZEM' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30' :
                      ticket.estado === 'ENTREGUE' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/30' :
                      'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30'
                    }`}>
                      {ticket.estado.replace('_', ' ')}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-xs">
                      {new Date(ticket.dataPedido).toLocaleString('pt-PT')}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {ticket.quantidade}x {ticket.material.descricao} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">({ticket.material.unidade})</span>
                  </h3>
                  
                  <div className="text-sm text-slate-600 dark:text-slate-400 flex flex-col sm:flex-row sm:gap-4 mt-2 bg-white dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-700/50">
                    <p><strong className="text-slate-900 dark:text-slate-300">Obra:</strong> {ticket.obra.nome}</p>
                    <p><strong className="text-slate-900 dark:text-slate-300">Pedido por:</strong> {ticket.requisitante.name || ticket.requisitante.email}</p>
                    {abaAtiva === 'HISTORICO' && ticket.aprovador && (
                      <p><strong className="text-slate-900 dark:text-slate-300">Despachado por:</strong> {ticket.aprovador.name}</p>
                    )}
                  </div>
                </div>

                {/* Botões de Ação */}
                {abaAtiva !== 'HISTORICO' && (
                  <div className="flex items-center gap-2 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-200 dark:border-slate-700 shrink-0">
                    
                    <button 
                      onClick={() => handleAcao(ticket.id, 'rejeitar')}
                      disabled={loading === ticket.id}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-500/20 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 border border-slate-300 dark:border-slate-600 hover:border-red-400 dark:hover:border-red-500/50 rounded-lg transition-colors font-bold disabled:opacity-50"
                    >
                      <XCircle size={18} /> Rejeitar
                    </button>

                    {abaAtiva === 'PRODUCAO' && (
                      <button 
                        onClick={() => handleAcao(ticket.id, 'aprovar_producao')}
                        disabled={loading === ticket.id}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-bold shadow-lg shadow-blue-500/30 disabled:opacity-50"
                      >
                        <CheckCircle size={18} /> Validar Pedido
                      </button>
                    )}

                    {abaAtiva === 'ARMAZEM' && (
                      <button 
                        onClick={() => handleAcao(ticket.id, 'aprovar_armazem')}
                        disabled={loading === ticket.id}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500 text-white rounded-lg transition-colors font-bold shadow-lg shadow-amber-500/30 disabled:opacity-50"
                      >
                        <Package size={18} /> Entregar e Abater
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}