"use client"

import { useState, useRef, useEffect } from "react"
import { Undo2, X, Save, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

type Props = {
  materiais: any[]
  obras: any[]
}

export default function RegistarSobrasModal({ materiais, obras }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Estados para a nossa barra de pesquisa mágica
  const [searchTerm, setSearchTerm] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const [formData, setFormData] = useState({
    materialId: "",
    obraOrigemId: "",
    quantidadeDevolvida: "",
    motivo: ""
  })

  // Motor de busca em tempo real (Filtra por nome ou referência)
  const materiaisFiltrados = materiais.filter(m => 
    m.descricao.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (m.referenciaInterna && m.referenciaInterna.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Proteção: Garantir que o gajo clicou num material válido da lista e não escreveu apenas texto
    if (!formData.materialId) {
      toast.error("Tens de selecionar uma peça da lista suspensa!")
      return
    }

    setLoading(true)
    const toastId = toast.loading("A processar devolução no servidor...")

    try {
      const res = await fetch("/api/devolucoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materialId: formData.materialId,
          obraOrigemId: formData.obraOrigemId,
          quantidadeDevolvida: Number(formData.quantidadeDevolvida),
          motivo: formData.motivo
        })
      })

      if (res.ok) {
        toast.success("Sobras recebidas! Dinheiro poupado.", { id: toastId })
        setIsOpen(false)
        setFormData({ materialId: "", obraOrigemId: "", quantidadeDevolvida: "", motivo: "" })
        setSearchTerm("") // Limpa a barra de pesquisa
        router.refresh()
      } else {
        const error = await res.json()
        toast.error(error.error || "Erro ao processar devolução.", { id: toastId })
      }
    } catch (error) {
      toast.error("Falha de comunicação com o servidor HP.", { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  // Se o modal fechar, damos reset a tudo para a próxima vez
  const handleClose = () => {
    setIsOpen(false)
    setFormData({ materialId: "", obraOrigemId: "", quantidadeDevolvida: "", motivo: "" })
    setSearchTerm("")
    setIsSearchOpen(false)
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors font-semibold shadow-sm h-10 w-full sm:w-auto"
      >
        <Undo2 size={18} />
        Registar Sobras
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg overflow-visible border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-lg">
                  <Undo2 size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Retorno de Material</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Devolve sobras de obra para o armazém</p>
                </div>
              </div>
              <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              {/* O NOVO MOTOR DE PESQUISA (Autocomplete) */}
              <div className="space-y-2 relative">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Material a Devolver *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Escreve o nome ou referência da peça..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setIsSearchOpen(true) // Abre a lista mal começas a escrever
                      setFormData({...formData, materialId: ""}) // Limpa o ID se o gajo apagar o texto
                    }}
                    onFocus={() => setIsSearchOpen(true)}
                    className="w-full pl-10 p-3 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                  />

                  {/* A Lista Suspensa (Dropdown) */}
                  {isSearchOpen && (
                    <ul className="absolute z-50 w-full mt-1 max-h-48 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl">
                      {materiaisFiltrados.length === 0 ? (
                        <li className="p-3 text-slate-500 dark:text-slate-400 text-sm text-center">Nenhuma peça encontrada.</li>
                      ) : (
                        materiaisFiltrados.map(mat => (
                          <li 
                            key={mat.id}
                            className="p-3 hover:bg-green-50 dark:hover:bg-slate-700 cursor-pointer text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700/50 last:border-0 transition-colors"
                            onClick={() => {
                              setFormData({...formData, materialId: mat.id}) // Grava a chave secreta
                              setSearchTerm(`${mat.descricao} (Ref: ${mat.referenciaInterna || 'S/Ref'})`) // Pinta o ecrã de forma bonita
                              setIsSearchOpen(false) // Fecha a lista
                            }}
                          >
                            <span className="font-semibold">{mat.descricao}</span>
                            <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">Ref: {mat.referenciaInterna || "S/Ref"}</span>
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Obra de Origem *</label>
                  <select 
                    required
                    value={formData.obraOrigemId}
                    onChange={(e) => setFormData({...formData, obraOrigemId: e.target.value})}
                    className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-green-500 outline-none"
                  >
                    <option value="">De onde veio?</option>
                    {obras.map(obra => (
                      <option key={obra.id} value={obra.id}>{obra.nome}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Quantidade *</label>
                  <input 
                    type="number"
                    required
                    min="0.1"
                    step="0.1"
                    value={formData.quantidadeDevolvida}
                    onChange={(e) => setFormData({...formData, quantidadeDevolvida: e.target.value})}
                    placeholder="Ex: 40"
                    className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Motivo / Notas (Opcional)</label>
                <input 
                  type="text"
                  value={formData.motivo}
                  onChange={(e) => setFormData({...formData, motivo: e.target.value})}
                  placeholder="Ex: Fim da montagem do pavilhão"
                  className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={handleClose}
                  className="px-5 py-2.5 text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 shadow-md shadow-green-600/20"
                >
                  <Save size={18} />
                  Confirmar Entrada
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  )
}