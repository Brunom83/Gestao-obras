"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Package, Plus, Search, Edit2, Trash2 } from "lucide-react"

type Material = { id: string; descricao: string; quantidade: number; unidade: string | null }
type MaterialAlocado = { id: string; quantidade: number; dataRegisto: Date; material: Material }

export default function GerirMateriaisObra({ 
  obraId, 
  materiaisAlocados, 
  inventario 
}: { 
  obraId: string, 
  materiaisAlocados: MaterialAlocado[],
  inventario: Material[] 
}) {
  const router = useRouter()
  const [pesquisa, setPesquisa] = useState("")
  const [loading, setLoading] = useState(false)

  const resultadosPesquisa = pesquisa.length > 2 
    ? inventario.filter(m => m.descricao.toLowerCase().includes(pesquisa.toLowerCase())).slice(0, 5)
    : []

  // 1. Função para Alocar Novo Material (Versão Blindada)
  const alocarMaterial = async (materialId: string, maxStock: number) => {
    const qtdStr = prompt(`Quantas unidades queres enviar para a obra? (Stock no Armazém: ${maxStock})`)
    if (!qtdStr) return
    
    const quantidade = parseFloat(qtdStr.replace(',', '.'))
    if (isNaN(quantidade) || quantidade <= 0 || quantidade > maxStock) {
      alert("Quantidade inválida ou superior ao stock existente.")
      return
    }

    setLoading(true) // Tranca o botão
    try {
      const res = await fetch(`/api/obras/${obraId}/materiais`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialId, quantidade })
      })

      if (res.ok) {
        setPesquisa("")
        router.refresh()
      } else {
        // Verifica se o servidor devolveu JSON ou se "explodiu" com HTML
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json()
          alert(data.error || "Erro ao alocar material.")
        } else {
          alert("O servidor HP crashou ao processar o pedido. Verifica o terminal do VS Code.")
        }
      }
    } catch (error) {
      console.error("Falha na rede:", error)
      alert("Falha de comunicação com o servidor HP.")
    } finally {
      setLoading(false) // Garante que o botão destranca SEMPRE, aconteça o que acontecer
    }
  }

  // 2. Função para Editar a Quantidade (Atualiza o Armazém)
  const editarAlocacao = async (alocacaoId: string, qtdAtual: number) => {
    const novaQtdStr = prompt(`Nova quantidade necessária nesta obra (Atual: ${qtdAtual}):`, qtdAtual.toString())
    if (!novaQtdStr) return

    const novaQtd = parseFloat(novaQtdStr.replace(',', '.'))
    if (isNaN(novaQtd) || novaQtd <= 0) {
      alert("Por favor insere uma quantidade válida.")
      return
    }

    if (novaQtd === qtdAtual) return

    setLoading(true)
    const res = await fetch(`/api/obras/${obraId}/materiais/${alocacaoId}`, {
      method: 'PATCH',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ novaQuantidade: novaQtd })
    })

    if (res.ok) {
      router.refresh()
    } else {
      const data = await res.json()
      alert(data.error || "Erro ao atualizar alocação.")
    }
    setLoading(false)
  }

  // 3. Função para Remover Material (Devolve ao Armazém)
  const removerAlocacao = async (alocacaoId: string) => {
    if (!confirm("Remover este material da obra? A quantidade será totalmente devolvida ao armazém central.")) return

    setLoading(true)
    const res = await fetch(`/api/obras/${obraId}/materiais/${alocacaoId}`, {
      method: 'DELETE'
    })

    if (res.ok) {
      router.refresh()
    } else {
      alert("Erro ao remover material da obra.")
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Secção de Pesquisa e Adição */}
      <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700">
        <h3 className="text-lg font-medium text-slate-200 mb-4 flex items-center gap-2">
          <Plus size={20} className="text-blue-500" /> Nova Saída de Armazém
        </h3>
        
        <div className="relative">
          <Search className="absolute left-3 top-3 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Escreve para procurar no inventário (ex: Porca)..."
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg pl-10 p-3 text-white focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {resultadosPesquisa.length > 0 && (
          <div className="mt-2 bg-slate-800 border border-slate-600 rounded-lg overflow-hidden shadow-xl">
            {resultadosPesquisa.map(mat => (
              <div key={mat.id} className="flex justify-between items-center p-3 border-b border-slate-700 hover:bg-slate-700/50">
                <div>
                  <p className="font-medium text-slate-200">{mat.descricao}</p>
                  <p className="text-sm text-slate-400">Armazém: {mat.quantidade} {mat.unidade}</p>
                </div>
                <button 
                  onClick={() => alocarMaterial(mat.id, mat.quantidade)}
                  disabled={loading || mat.quantidade <= 0}
                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 text-white px-3 py-1.5 rounded text-sm transition-colors"
                >
                  Alocar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lista de Materiais Já Alocados */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700 bg-slate-800/80">
          <h3 className="font-medium text-slate-200">Material Alocado a Esta Obra</h3>
        </div>
        
        {materiaisAlocados.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Package className="mx-auto mb-2 opacity-50" size={32} />
            <p>Nenhum material registado nesta obra.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs text-slate-400 bg-slate-900/50 uppercase">
              <tr>
                <th className="px-6 py-3">Material</th>
                <th className="px-6 py-3">Data Saída</th>
                <th className="px-6 py-3 text-right">Qtd na Obra</th>
                <th className="px-6 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {materiaisAlocados.map(registo => (
                <tr key={registo.id} className="hover:bg-slate-700/30">
                  <td className="px-6 py-4 text-slate-200 font-medium">{registo.material.descricao}</td>
                  <td className="px-6 py-4">{new Date(registo.dataRegisto).toLocaleDateString('pt-PT')}</td>
                  <td className="px-6 py-4 text-right text-blue-400 font-bold">
                    {registo.quantidade} {registo.material.unidade}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => editarAlocacao(registo.id, registo.quantidade)}
                        disabled={loading}
                        className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded transition-colors disabled:opacity-50"
                        title="Corrigir Quantidade"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => removerAlocacao(registo.id)}
                        disabled={loading}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors disabled:opacity-50"
                        title="Devolver ao Armazém"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}