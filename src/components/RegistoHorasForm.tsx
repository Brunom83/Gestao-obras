"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Save, Clock, User, Calendar } from "lucide-react"
import toast from "react-hot-toast"

// A primeira afinação: O formulário agora recebe um 'obraId' fixo e a lista de trabalhadores. 
// A lista de 'obras' desapareceu porque já não precisamos dela.
export default function RegistoHorasForm({ obraId, funcionarios }: { obraId: string, funcionarios: any[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // O estado do formulário (nota que removi a seleção da obraId, ela vem diretamente das props)
  const [formData, setFormData] = useState({
    funcionarioId: "",
    horas: "",
    data: new Date().toISOString().split('T')[0] // Data de hoje por defeito
  })

  const handleGravar = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const toastId = toast.loading("A injetar horas no servidor...")

    try {
      // Usamos a 'obraId' que veio da página pai na rota da API
      const res = await fetch(`/api/obras/${obraId}/horas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          funcionarioId: formData.funcionarioId,
          horas: Number(formData.horas),
          data: new Date(formData.data).toISOString()
        })
      })

      if (res.ok) {
        toast.success("Horas registadas com sucesso!", { id: toastId })
        setFormData({ ...formData, horas: "" }) // Limpa apenas as horas
        router.refresh()
      } else {
        const erro = await res.json()
        toast.error(erro.error || "Erro ao gravar as horas.", { id: toastId })
      }
    } catch (error) {
      toast.error("Falha de comunicação com o servidor HP.", { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleGravar} className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-4 sm:p-8">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-700 pb-4">
        <Clock className="text-blue-500" size={28} />
        <h2 className="text-2xl font-bold text-slate-100">Picar Ponto</h2>
      </div>

      <div className="space-y-5">
        
        {/* Bloco do Funcionário (A dropdown da Obra desapareceu porque já estamos na página da Obra!) */}
        <div>
          <label className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-2 uppercase tracking-wider">
            <User size={16} className="text-purple-400"/> Trabalhador
          </label>
          <select 
            required 
            value={formData.funcionarioId} 
            onChange={e => setFormData({...formData, funcionarioId: e.target.value})}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-4 text-white text-lg focus:ring-2 focus:ring-purple-500 appearance-none shadow-inner"
          >
            <option value="">-- Quem trabalhou? --</option>
            {funcionarios.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
          </select>
        </div>

        {/* Bloco de Horas e Data */}
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="flex-1">
            <label className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-2 uppercase tracking-wider">
              <Clock size={16} className="text-yellow-400"/> Horas Gastas
            </label>
            <input 
              type="number" 
              step="0.5" 
              min="0.5"
              required 
              value={formData.horas} 
              onChange={e => setFormData({...formData, horas: e.target.value})}
              placeholder="Ex: 8"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-4 text-white text-xl font-bold focus:ring-2 focus:ring-yellow-500 text-center shadow-inner placeholder:text-slate-600 placeholder:font-normal"
            />
          </div>

          <div className="flex-1">
            <label className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-2 uppercase tracking-wider">
              <Calendar size={16} className="text-green-400"/> Data
            </label>
            <input 
              type="date" 
              required 
              value={formData.data} 
              onChange={e => setFormData({...formData, data: e.target.value})}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-4 text-white text-lg focus:ring-2 focus:ring-green-500 shadow-inner"
            />
          </div>
        </div>

      </div>

      {/* Botão Gigante de Submissão */}
      <div className="mt-8 pt-6 border-t border-slate-700">
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 text-white p-5 rounded-xl font-bold text-lg uppercase tracking-widest transition-colors flex items-center justify-center gap-3 shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)]"
        >
          <Save size={24} />
          {loading ? "A Transmitir..." : "Registar Horas"}
        </button>
      </div>
    </form>
  )
}