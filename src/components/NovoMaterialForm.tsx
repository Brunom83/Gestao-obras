"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Save, X, PackagePlus, Info, Wrench } from "lucide-react"

export default function NovoMaterialForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [aberto, setAberto] = useState(false)

  // O estado de todas as gavetas do nosso motor
  const [formData, setFormData] = useState({
    descricao: "",
    referenciaInterna: "",
    categoria: "",
    quantidade: "0",
    unidade: "UN",
    norma: "",
    classe: "",
    diametro: "",
    comprimento: "",
    tratamento: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleGravar = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/materiais", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Convert a quantidade de texto para número antes de enviar
        body: JSON.stringify({ ...formData, quantidade: Number(formData.quantidade) }),
      })

      if (res.ok) {
        setFormData({
          descricao: "", referenciaInterna: "", categoria: "", quantidade: "0", unidade: "UN",
          norma: "", classe: "", diametro: "", comprimento: "", tratamento: ""
        })
        setAberto(false)
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || "Erro ao gravar. A referência já existe?")
      }
    } catch (error) {
      alert("Falha de comunicação com o servidor HP.")
    } finally {
      setLoading(false)
    }
  }

  if (!aberto) {
    return (
      <button 
        onClick={() => setAberto(true)}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-bold transition-colors shadow-md"
      >
        <PackagePlus size={20} /> Registar Novo Material
      </button>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl mb-8 transition-colors">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <PackagePlus className="text-blue-600 dark:text-blue-500" /> Ficha de Registo de Material
        </h2>
        <button onClick={() => setAberto(false)} className="text-slate-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 dark:hover:bg-red-500/10 rounded">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleGravar} className="space-y-6">
        
        {/* BLOCO 1: Informação Principal (Obrigatória) */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700/50">
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Info size={16} /> Identificação Principal
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Descrição / Nome da Peça *</label>
              <input type="text" name="descricao" required value={formData.descricao} onChange={handleChange} className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded p-2.5 text-slate-900 dark:text-slate-200 focus:border-blue-500 outline-none" placeholder="Ex: Parafuso Sextavado Hilti" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Referência (SKU) *</label>
              <input type="text" name="referenciaInterna" required value={formData.referenciaInterna} onChange={handleChange} className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded p-2.5 text-slate-900 dark:text-slate-200 focus:border-blue-500 outline-none uppercase" placeholder="Ex: PAR-HIL-001" title="Esta é a etiqueta que o QR Code vai ler!" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Categoria</label>
              <input type="text" name="categoria" value={formData.categoria} onChange={handleChange} className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded p-2.5 text-slate-900 dark:text-slate-200 focus:border-blue-500 outline-none" placeholder="Ex: Fixação" />
            </div>
          </div>
        </div>

        {/* BLOCO 2: Especificações Técnicas (Para os Chefes e Engenheiros) */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700/50">
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Wrench size={16} /> Especificações Técnicas (Opcional)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Norma</label>
              <input type="text" name="norma" value={formData.norma} onChange={handleChange} className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded p-2.5 text-slate-900 dark:text-slate-200 focus:border-blue-500 outline-none" placeholder="Ex: EN 15048" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Classe</label>
              <input type="text" name="classe" value={formData.classe} onChange={handleChange} className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded p-2.5 text-slate-900 dark:text-slate-200 focus:border-blue-500 outline-none" placeholder="Ex: 8.8" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Diâmetro</label>
              <input type="text" name="diametro" value={formData.diametro} onChange={handleChange} className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded p-2.5 text-slate-900 dark:text-slate-200 focus:border-blue-500 outline-none" placeholder="Ex: M16" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Comprimento</label>
              <input type="text" name="comprimento" value={formData.comprimento} onChange={handleChange} className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded p-2.5 text-slate-900 dark:text-slate-200 focus:border-blue-500 outline-none" placeholder="Ex: 60mm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Tratamento</label>
              <input type="text" name="tratamento" value={formData.tratamento} onChange={handleChange} className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded p-2.5 text-slate-900 dark:text-slate-200 focus:border-blue-500 outline-none" placeholder="Ex: Zincado" />
            </div>
          </div>
        </div>

        {/* BLOCO 3: Stock Inicial */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-end border-t border-slate-100 dark:border-slate-800 pt-6">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Qtd Inicial</label>
              <input type="number" min="0" step="0.01" name="quantidade" value={formData.quantidade} onChange={handleChange} className="w-24 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded p-2.5 text-slate-900 dark:text-slate-200 focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Unidade</label>
              <select name="unidade" value={formData.unidade} onChange={handleChange} className="w-24 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded p-2.5 text-slate-900 dark:text-slate-200 focus:border-blue-500 outline-none cursor-pointer">
                <option value="UN">UN</option>
                <option value="KIT">KIT</option>
                <option value="CX">Caixa</option>
                <option value="KG">KG</option>
                <option value="M">Metros</option>
              </select>
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 dark:hover:bg-green-500 text-white px-8 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
            <Save size={20} />
            {loading ? "A injetar no motor..." : "Gravar Material"}
          </button>
        </div>
      </form>
    </div>
  )
}