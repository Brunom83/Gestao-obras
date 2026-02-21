"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Clock, Plus, Save, Trash2, User } from "lucide-react"

type Funcionario = { id: string; nome: string; cargo: string; custoHora: number }
type RegistoHoras = { id: string; horas: number; data: Date; descricao: string | null; funcionario: Funcionario }

export default function GerirHorasObra({ 
  obraId, 
  funcionarios, 
  registosHoras 
}: { 
  obraId: string, 
  funcionarios: Funcionario[],
  registosHoras: RegistoHoras[] 
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    funcionarioId: "",
    horas: "",
    data: new Date().toISOString().split('T')[0],
    descricao: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.funcionarioId) return alert("Seleciona um trabalhador.")

    setLoading(true)
    try {
      const res = await fetch(`/api/obras/${obraId}/horas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setFormData({ ...formData, horas: "", descricao: "" }) // Limpa as horas mas mantém a data
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || "Erro ao registar horas.")
      }
    } catch (error) {
      alert("Falha de comunicação com o servidor.")
    } finally {
      setLoading(false)
    }
  }

  //Elimina um registo de horas e atualiza os custos da obra
  const handleEliminarHora = async (horaId: string) => {
    if (!confirm("Tens a certeza que queres apagar este registo? Os custos da obra serão recalculados.")) return

    setLoading(true)
    try {
      const res = await fetch(`/api/obras/${obraId}/horas/${horaId}`, {
        method: "DELETE"
      })

      if (res.ok) {
        router.refresh()
      } else {
        alert("Erro ao apagar o registo.")
      }
    } catch (error) {
      alert("Falha na comunicação com o servidor.")
    } finally {
      setLoading(false)
    }
  }

  // Calcula o total de horas já registadas nesta obra
  const totalHoras = registosHoras.reduce((acc, reg) => acc + reg.horas, 0)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Formulário de Registo */}
      <div className="lg:col-span-1">
        <form onSubmit={handleSubmit} className="bg-slate-900/50 p-6 rounded-lg border border-slate-700 sticky top-8">
          <h3 className="text-lg font-medium text-slate-200 mb-4 flex items-center gap-2">
            <Plus size={20} className="text-blue-500" /> Registar Horas
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Trabalhador *</label>
              <select
                required
                value={formData.funcionarioId}
                onChange={(e) => setFormData({ ...formData, funcionarioId: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Selecionar Trabalhador --</option>
                {funcionarios.map(f => (
                  <option key={f.id} value={f.id}>{f.nome} ({f.cargo.replace('_', ' ')})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Data *</label>
                <input
                  type="date"
                  required
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Horas *</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  required
                  value={formData.horas}
                  onChange={(e) => setFormData({ ...formData, horas: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: 8"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Descrição (Opcional)</label>
              <input
                type="text"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Assentamento de tijolo..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Save size={18} />
              {loading ? "A Guardar..." : "Gravar Folha Diária"}
            </button>
          </div>
        </form>
      </div>

      {/* Histórico da Obra */}
      <div className="lg:col-span-2">
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700 bg-slate-800/80 flex justify-between items-center">
            <h3 className="font-medium text-slate-200">Histórico de Mão de Obra</h3>
            <span className="bg-blue-600/20 text-blue-400 py-1 px-3 rounded-full text-sm font-medium">
              Total Acumulado: {totalHoras}h
            </span>
          </div>
          
          {registosHoras.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Clock className="mx-auto mb-2 opacity-50" size={32} />
              <p>Ainda não foram registadas horas nesta obra.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs text-slate-400 bg-slate-900/50 uppercase">
                <tr>
                  <th className="px-6 py-3">Data</th>
                  <th className="px-6 py-3">Trabalhador</th>
                  <th className="px-6 py-3">Descrição</th>
                  <th className="px-6 py-3 text-right">Horas</th>
                  <th className="px-6 py-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {registosHoras.map(reg => (
                  <tr key={reg.id} className="hover:bg-slate-700/30">
                    <td className="px-6 py-4">{new Date(reg.data).toLocaleDateString('pt-PT')}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-slate-500" />
                        <span className="text-slate-200 font-medium">{reg.funcionario.nome}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400 truncate max-w-[200px]">
                      {reg.descricao || "-"}
                    </td>
                    <td className="px-6 py-4 text-right text-blue-400 font-bold">
                      {reg.horas}h
                    </td>
                    {/* NOVA COLUNA DE AÇÃO AQUI */}
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleEliminarHora(reg.id)}
                        disabled={loading}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors disabled:opacity-50"
                        title="Apagar Registo"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}