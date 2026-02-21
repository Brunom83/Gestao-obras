"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Edit2, Trash2 } from "lucide-react"

type Material = {
  id: string
  descricao: string
  medidas: string | null
  quantidade: number
  unidade: string | null
}

export default function InventarioTable({ materiais }: { materiais: Material[] }) {
  const router = useRouter()
  const [pesquisa, setPesquisa] = useState("")

  const materiaisFiltrados = materiais.filter((item) => {
    const termo = pesquisa.toLowerCase()
    return (
      item.descricao.toLowerCase().includes(termo) ||
      (item.medidas?.toLowerCase().includes(termo) ?? false)
    )
  })

  // Função para editar a quantidade
  const handleEditarQuantidade = async (id: string, quantidadeAtual: number) => {
    const novaQtd = prompt(`Introduz a nova quantidade (Atual: ${quantidadeAtual}):`, quantidadeAtual.toString())
    
    if (novaQtd === null) return // Utilizador cancelou
    
    const qtdNumber = parseFloat(novaQtd.replace(',', '.'))
    if (isNaN(qtdNumber) || qtdNumber < 0) {
      alert("Por favor, introduz um número válido e positivo.")
      return
    }

    try {
      const res = await fetch(`/api/materiais/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantidade: qtdNumber })
      })

      if (res.ok) {
        router.refresh() // Atualiza a tabela com os novos dados
      } else {
        alert("Erro ao atualizar a quantidade na base de dados.")
      }
    } catch (error) {
      console.error("Erro na comunicação com o servidor:", error)
    }
  }

  // Função para eliminar o material
  const handleEliminar = async (id: string) => {
    if (!confirm("Atenção: Tens a certeza que pretendes eliminar este material definitivamente do armazém?")) return

    try {
      const res = await fetch(`/api/materiais/${id}`, { method: 'DELETE' })
      
      if (res.ok) {
        router.refresh()
      } else {
        alert("Erro ao eliminar. O material já pode estar alocado a uma obra.")
      }
    } catch (error) {
      console.error("Erro na comunicação com o servidor:", error)
    }
  }

  return (
    <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden">
      
      {/* Barra de Ferramentas */}
      <div className="p-6 border-b border-slate-700 bg-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-slate-200">Stock Atual</h2>
          <span className="bg-blue-600/20 text-blue-400 py-1 px-3 rounded-full text-sm font-medium">
            Registos: {materiaisFiltrados.length}
          </span>
        </div>

        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="bg-slate-900 border border-slate-600 text-slate-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 placeholder-slate-400"
            placeholder="Pesquisar material ou medida..."
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
          />
        </div>
      </div>

      {/* Tabela de Dados */}
      <div className="overflow-x-auto max-h-[65vh] overflow-y-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-xs text-slate-200 uppercase bg-slate-900 sticky top-0 z-10 shadow-md">
            <tr>
              <th scope="col" className="px-6 py-4 font-bold tracking-wider">Descrição do Material</th>
              <th scope="col" className="px-6 py-4 font-bold tracking-wider">Medidas</th>
              <th scope="col" className="px-6 py-4 font-bold tracking-wider text-right">Quantidade</th>
              <th scope="col" className="px-6 py-4 font-bold tracking-wider">Unidade</th>
              <th scope="col" className="px-6 py-4 font-bold tracking-wider text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {materiaisFiltrados.length > 0 ? (
              materiaisFiltrados.map((item) => (
                <tr key={item.id} className="hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-200">{item.descricao}</td>
                  <td className="px-6 py-4 text-slate-400">{item.medidas || "-"}</td>
                  <td className="px-6 py-4 text-right font-semibold text-blue-400">
                    {item.quantidade}
                  </td>
                  <td className="px-6 py-4 text-slate-400">{item.unidade}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleEditarQuantidade(item.id, item.quantidade)}
                        className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded transition-colors"
                        title="Editar Quantidade"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleEliminar(item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                        title="Eliminar Material"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                  Nenhum material encontrado com "{pesquisa}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}