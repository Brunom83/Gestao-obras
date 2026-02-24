"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Save, X } from "lucide-react"

export default function NovoMaterialForm() {
  const router = useRouter()
  const [aberto, setAberto] = useState(false)
  const [loading, setLoading] = useState(false)

  // As nossas gavetas do formulário prontas a receber dados
  const [formData, setFormData] = useState({
    referenciaInterna: "",
    descricao: "",
    medidas: "",
    quantidade: "",
    unidade: "un"
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/materiais", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        // Limpa o painel e fecha o capô
        setFormData({ referenciaInterna: "", descricao: "", medidas: "", quantidade: "", unidade: "un" })
        setAberto(false)
        router.refresh() // Força a tabela lá atrás a atualizar na hora!
      } else {
        alert("Erro ao criar. Os Drones intercetaram a mensagem.")
      }
    } catch (error) {
      alert("Falha de comunicação com o servidor HP.")
    } finally {
      setLoading(false)
    }
  }

  // Se o capô estiver fechado, mostra só o botão azul
  if (!aberto) {
    return (
      <button 
        onClick={() => setAberto(true)}
        className="mb-6 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-bold transition-colors flex items-center gap-2 shadow-lg"
      >
        <Plus size={20} /> Adicionar Novo Material
      </button>
    )
  }

  // Se o capô estiver aberto, mostra o motor
  return (
    <div className="mb-8 bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-xl relative overflow-hidden">
      {/* Detalhe estético Teku */}
      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-100">Registar Nova Peça</h3>
        <button onClick={() => setAberto(false)} className="text-slate-400 hover:text-red-400 transition-colors">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* A NOSSA GAVETA NOVA DA HILTI */}
        <div>
          <label className="block text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Ref. Hilti / Interna</label>
          <input type="text" value={formData.referenciaInterna} onChange={e => setFormData({...formData, referenciaInterna: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-slate-200 focus:ring-blue-500 focus:border-blue-500" placeholder="Ex: BROCA-08" />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Descrição *</label>
          <input type="text" required value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-slate-200 focus:ring-blue-500 focus:border-blue-500" placeholder="Ex: Parafuso Sextavado" />
        </div>
        
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Medidas</label>
          <input type="text" value={formData.medidas} onChange={e => setFormData({...formData, medidas: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-slate-200 focus:ring-blue-500 focus:border-blue-500" placeholder="Ex: M10x30" />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Qtd Inicial</label>
            <input type="number" min="0" step="0.1" value={formData.quantidade} onChange={e => setFormData({...formData, quantidade: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-slate-200 focus:ring-blue-500 focus:border-blue-500" placeholder="0" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Unid.</label>
            <select value={formData.unidade} onChange={e => setFormData({...formData, unidade: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-slate-200 focus:ring-blue-500 focus:border-blue-500 cursor-pointer">
              <option value="un">un</option>
              <option value="Cx">Cx</option>
              <option value="Kg">Kg</option>
              <option value="mm">mm</option>
            </select>
          </div>
        </div>
        
        <div className="md:col-span-5 flex justify-end mt-4 pt-4 border-t border-slate-700">
          <button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-bold transition-colors flex items-center gap-2 disabled:opacity-50">
            <Save size={20} /> {loading ? "A injetar..." : "Gravar no Cofre"}
          </button>
        </div>
      </form>
    </div>
  )
}