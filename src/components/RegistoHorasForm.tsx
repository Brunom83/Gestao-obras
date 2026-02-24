"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Save, Clock, Calendar, User } from "lucide-react"

type Funcionario = {
  id: string
  nome: string
}

export default function RegistoHorasForm({ obraId, funcionarios }: { obraId: string, funcionarios: Funcionario[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // O estado inicial do nosso formulário
  const [formData, setFormData] = useState({
    funcionarioId: "",
    data: new Date().toISOString().split("T")[0], // Data de hoje por defeito
    horas: ""
  })

  const handleGravarHoras = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Nota: Ainda temos de criar este túnel de API no próximo passo!
      const res = await fetch(`/api/obras/${obraId}/horas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          funcionarioId: formData.funcionarioId,
          data: formData.data,
          horas: Number(formData.horas)
        })
      })

      if (res.ok) {
        alert("Horas registadas com sucesso no servidor HP!")
        // Limpa as horas para ele poder picar o próximo trabalhador logo a seguir
        setFormData({ ...formData, horas: "", funcionarioId: "" }) 
        router.refresh()
      } else {
        alert("Erro ao gravar. Os Drones intercetaram a mensagem.")
      }
    } catch (error) {
      alert("Falha de comunicação.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
      <h2 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2">
        <Clock className="text-green-500" /> Picar o Ponto da Equipa
      </h2>

      <form onSubmit={handleGravarHoras} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Seleção do Trabalhador */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
              <User size={16} /> Quem trabalhou?
            </label>
            <select
              required
              value={formData.funcionarioId}
              onChange={(e) => setFormData({ ...formData, funcionarioId: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Selecionar Trabalhador --</option>
              {funcionarios.map(func => (
                <option key={func.id} value={func.id}>{func.nome}</option>
              ))}
            </select>
          </div>

          {/* Seleção da Data */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
              <Calendar size={16} /> Em que dia?
            </label>
            <input
              type="date"
              required
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Quantidade de Horas */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
              <Clock size={16} /> Quantas horas?
            </label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              required
              placeholder="Ex: 8"
              value={formData.horas}
              onChange={(e) => setFormData({ ...formData, horas: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

        </div>

        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={20} />
            {loading ? "A transmitir..." : "Gravar Horas"}
          </button>
        </div>
      </form>
    </div>
  )
}