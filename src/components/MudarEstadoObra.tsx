"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast" // O novo import

export default function MudarEstadoObra({ obraId, estadoAtual }: { obraId: string, estadoAtual: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const alterarEstado = async (novoEstado: string) => {
    if (novoEstado === estadoAtual) return
    
    // Mantemos a confirmação para evitar cliques acidentais
    if (!confirm(`Atenção: Pretende alterar o estado desta obra para ${novoEstado.replace('_', ' ')}?`)) return
    
    setLoading(true)
    
    // Iniciamos um toast de carregamento
    const toastId = toast.loading("A atualizar o estado...")

    try {
      const res = await fetch(`/api/obras/${obraId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: novoEstado })
      })

      if (res.ok) {
        toast.success("Estado da obra atualizado com sucesso!", { id: toastId })
        router.refresh()
      } else {
        toast.error("Ocorreu um erro ao gravar as alterações.", { id: toastId })
      }
    } catch (error) {
      toast.error("Falha de comunicação com o servidor.", { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  return (
    <select 
      disabled={loading}
      value={estadoAtual}
      onChange={(e) => alterarEstado(e.target.value)}
      className={`bg-slate-900 border border-slate-700 rounded-lg p-1 text-xs font-bold uppercase tracking-wider outline-none cursor-pointer transition-colors shadow-sm disabled:opacity-50 ${
        estadoAtual === 'EM_CURSO' ? 'text-blue-400 focus:border-blue-400' : 
        estadoAtual === 'CONCLUIDA' ? 'text-green-400 focus:border-green-400' : 'text-yellow-400 focus:border-yellow-400'
      }`}
    >
      <option value="EM_CURSO" className="text-blue-400 font-bold">Em Curso</option>
      <option value="PAUSADA" className="text-yellow-400 font-bold">Pausada</option>
      <option value="CONCLUIDA" className="text-green-400 font-bold">Concluída</option>
    </select>
  )
}