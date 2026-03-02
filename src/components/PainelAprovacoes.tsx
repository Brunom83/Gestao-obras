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
  const [loading, setLoading] = useState<string | null>(null) // Guarda o ID do ticket que está a ser processado
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

  // Filtramos os tickets consoante a aba escolhida
  const ticketsFiltrados = ticketsIniciais.filter(t => {
    if (abaAtiva === 'PRODUCAO') return t.estado === 'AGUARDA_PRODUCAO'
    if (abaAtiva === 'ARMAZEM') return t.estado === 'AGUARDA_ARMAZEM'
    return t.estado === 'ENTREGUE' || t.estado === 'REJEITADO'
  })

  return (
    <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden">
      
      {/* Navegação das Abas */}
      <div className="flex border-b border-slate-700 bg-slate-900/50">
        <button 
          onClick={() => setAbaAtiva('PRODUCAO')}
          className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors flex justify-center items-center gap-2 ${abaAtiva === 'PRODUCAO' ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Clock size={18} /> Aprovação Produção
        </button>
        <button 
          onClick={() => setAbaAtiva('ARMAZEM')}
          className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors flex justify-center items-center gap-2 ${abaAtiva === 'ARMAZEM' ? 'bg-slate-800 text-orange-400 border-b-2 border-orange-500' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Package size={18} /> Saída de Armazém
        </button>
        <button 
          onClick={() => setAbaAtiva('HISTORICO')}
          className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors flex justify-center items-center gap-2 ${abaAtiva === 'HISTORICO' ? 'bg-slate-800 text-slate-200 border-b-2 border-slate-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Archive size={18} /> Histórico
        </button>
      </div>

      {/* Tabela de Tickets */}
      <div className="overflow-x-auto p-4 md:p-6">
        {ticketsFiltrados.length === 0 ? (
          <div className="text-center py-12 text-slate-500 flex flex-col items-center">
            <AlertCircle size={48} className="mb-4 opacity-50" />
            <p className="text-lg">Não há tickets nesta secção.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {ticketsFiltrados.map((ticket) => (
              <div key={ticket.id} className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:border-slate-500">
                
                {/* Info do Pedido */}
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2.5 py-1 rounded text-xs font-bold tracking-wider ${
                      ticket.estado === 'AGUARDA_PRODUCAO' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      ticket.estado === 'AGUARDA_ARMAZEM' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                      ticket.estado === 'ENTREGUE' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {ticket.estado.replace('_', ' ')}
                    </span>
                    <span className="text-slate-500 text-xs">
                      {new Date(ticket.dataPedido).toLocaleString('pt-PT')}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-100">
                    {ticket.quantidade}x {ticket.material.descricao} <span className="text-sm font-normal text-slate-400">({ticket.material.unidade})</span>
                  </h3>
                  
                  <div className="text-sm text-slate-400 flex flex-col sm:flex-row sm:gap-4 mt-1">
                    <p><strong className="text-slate-300">Obra:</strong> {ticket.obra.nome}</p>
                    <p><strong className="text-slate-300">Pedido por:</strong> {ticket.requisitante.name || ticket.requisitante.email}</p>
                    {abaAtiva === 'HISTORICO' && ticket.aprovador && (
                      <p><strong className="text-slate-300">Despachado por:</strong> {ticket.aprovador.name}</p>
                    )}
                  </div>
                </div>

                {/* Botões de Ação (Apenas visíveis se não for histórico) */}
                {abaAtiva !== 'HISTORICO' && (
                  <div className="flex items-center gap-2 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-700">
                    
                    {/* Botão Rejeitar (Vermelho) */}
                    <button 
                      onClick={() => handleAcao(ticket.id, 'rejeitar')}
                      disabled={loading === ticket.id}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-600 hover:border-red-500/50 rounded-lg transition-colors font-medium disabled:opacity-50"
                    >
                      <XCircle size={18} /> Rejeitar
                    </button>

                    {/* Botão Aprovar (Produção) */}
                    {abaAtiva === 'PRODUCAO' && (
                      <button 
                        onClick={() => handleAcao(ticket.id, 'aprovar_producao')}
                        disabled={loading === ticket.id}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium shadow-lg shadow-blue-500/20 disabled:opacity-50"
                      >
                        <CheckCircle size={18} /> Validar Pedido
                      </button>
                    )}

                    {/* Botão Aprovar (Armazém) - É este que desconta o stock! */}
                    {abaAtiva === 'ARMAZEM' && (
                      <button 
                        onClick={() => handleAcao(ticket.id, 'aprovar_armazem')}
                        disabled={loading === ticket.id}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors font-medium shadow-lg shadow-orange-500/20 disabled:opacity-50"
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