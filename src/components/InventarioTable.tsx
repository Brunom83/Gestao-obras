"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PackagePlus, PackageMinus, Save, X, Search } from "lucide-react"

type Material = {
  id: string
  descricao: string
  medidas: string | null
  quantidade: number
  unidade: string | null
}

export default function InventarioTable({ materiaisIniciais }: { materiaisIniciais: Material[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [pesquisa, setPesquisa] = useState("")

  // Controlo duplo: saber qual material estamos a editar e qual a ação
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeAction, setActiveAction] = useState<'adicionar' | 'remover' | null>(null)
  const [quantidadeInput, setQuantidadeInput] = useState("")

  const termosPesquisa = pesquisa.toLowerCase().split(" ").filter(termo => termo.trim() !== "")
  const materiaisFiltrados = materiaisIniciais.filter(mat => {
    const textoDaPeca = `${mat.descricao} ${mat.medidas || ""} ${mat.unidade || ""}`.toLowerCase()
    return termosPesquisa.every(termo => textoDaPeca.includes(termo))
  })

  const handleStock = async (e: React.FormEvent, id: string) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`/api/materiais/${id}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantidade: Number(quantidadeInput), acao: activeAction })
      })

      if (res.ok) {
        setActiveId(null)
        setActiveAction(null)
        setQuantidadeInput("")
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || "Erro ao atualizar stock.")
      }
    } catch (error) {
      alert("Falha de comunicação com o servidor.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden">
      <div className="p-6 border-b border-slate-700 bg-slate-800/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-200">Stock Atual</h2>
          <span className="bg-blue-600/20 text-blue-400 py-1 px-3 rounded-full text-sm font-medium mt-2 inline-block">
            Mostrando: {materiaisFiltrados.length}
          </span>
        </div>

        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-500" />
          </div>
          <input
            type="text"
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            className="block w-full pl-10 bg-slate-900 border border-slate-600 rounded-lg py-2.5 text-slate-200 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
            placeholder="Procurar material ou medida..."
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-xs text-slate-400 uppercase bg-slate-900/50">
            <tr>
              <th className="px-6 py-4 font-medium">Descrição</th>
              <th className="px-6 py-4 font-medium">Medidas</th>
              <th className="px-6 py-4 font-medium text-right">Em Stock</th>
              <th className="px-6 py-4 font-medium text-center">Gestão Rápida</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {materiaisFiltrados.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  Nenhum material encontrado.
                </td>
              </tr>
            ) : (
              materiaisFiltrados.map((mat) => (
                <tr key={mat.id} className="hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-200">{mat.descricao}</td>
                  <td className="px-6 py-4 text-slate-500">{mat.medidas || "-"}</td>
                  
                  <td className={`px-6 py-4 text-right font-bold ${mat.quantidade < 10 ? 'text-yellow-500' : 'text-blue-400'}`}>
                    {mat.quantidade} <span className="text-slate-500 font-normal text-xs">{mat.unidade}</span>
                  </td>
                  
                  <td className="px-6 py-4">
                    {activeId === mat.id ? (
                      <form onSubmit={(e) => handleStock(e, mat.id)} className="flex items-center justify-center gap-2">
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          required
                          autoFocus
                          value={quantidadeInput}
                          onChange={(e) => setQuantidadeInput(e.target.value)}
                          className="w-20 bg-slate-900 border border-slate-600 rounded p-1.5 text-white text-center text-sm focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Qtd..."
                        />
                        <button 
                          type="submit" 
                          disabled={loading}
                          className={`p-1.5 text-white rounded transition-colors disabled:opacity-50 ${activeAction === 'adicionar' ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'}`}
                        >
                          <Save size={16} />
                        </button>
                        <button 
                          type="button" 
                          onClick={() => { setActiveId(null); setActiveAction(null); setQuantidadeInput(""); }}
                          className="p-1.5 bg-slate-600 hover:bg-slate-500 text-white rounded transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </form>
                    ) : (
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => { setActiveId(mat.id); setActiveAction('adicionar'); }}
                          className="flex items-center gap-1 p-1.5 px-3 text-green-400 hover:text-green-300 hover:bg-green-400/10 border border-green-400/20 rounded-lg transition-colors text-xs font-medium"
                          title="Entrada de Stock"
                        >
                          <PackagePlus size={16} /> <span className="hidden sm:inline">Injetar</span>
                        </button>
                        <button 
                          onClick={() => { setActiveId(mat.id); setActiveAction('remover'); }}
                          className="flex items-center gap-1 p-1.5 px-3 text-red-400 hover:text-red-300 hover:bg-red-400/10 border border-red-400/20 rounded-lg transition-colors text-xs font-medium"
                          title="Saída Extra (sem ser na obra)"
                        >
                          <PackageMinus size={16} /> <span className="hidden sm:inline">Retirar</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}