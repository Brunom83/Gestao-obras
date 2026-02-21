"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Save, HardHat, Trash2 } from "lucide-react"

type Funcionario = {
  id: string
  nome: string
  cargo: string
  custoHora: number
}

export default function GestaoFuncionarios({ funcionariosIniciais }: { funcionariosIniciais: Funcionario[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    nome: "",
    cargo: "OPERARIO",
    custoHora: ""
  })

  const formatadorMoeda = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' })

  // Função para Guardar
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/funcionarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setFormData({ nome: "", cargo: "OPERARIO", custoHora: "" })
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || "Erro ao registar funcionário.")
      }
    } catch (error) {
      console.error("Erro de rede:", error)
      alert("Falha de comunicação com o servidor.")
    } finally {
      setLoading(false)
    }
  }

  // NOVA Função para Eliminar
  const handleEliminar = async (id: string, nome: string) => {
    if (!confirm(`Atenção: Tens a certeza que pretendes eliminar o trabalhador "${nome}"? Todo o seu registo de horas nas obras também será apagado.`)) return

    try {
      const res = await fetch(`/api/funcionarios/${id}`, { method: 'DELETE' })
      
      if (res.ok) {
        router.refresh()
      } else {
        alert("Erro ao eliminar o funcionário no servidor.")
      }
    } catch (error) {
      alert("Falha na comunicação com o servidor HP.")
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Coluna da Esquerda: Formulário de Inserção */}
      <div className="lg:col-span-1">
        <form onSubmit={handleSubmit} className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-6 sticky top-8">
          <h2 className="text-xl font-semibold text-slate-200 mb-6 flex items-center gap-2">
            <Plus size={20} className="text-blue-500" /> Novo Registo
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nome Completo *</label>
              <input
                type="text"
                required
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: João Silva"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Cargo *</label>
              <select
                value={formData.cargo}
                onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="OPERARIO">Operário</option>
                <option value="CHEFE_EQUIPA">Chefe de Equipa</option>
                <option value="COORDENADOR">Coordenador</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Custo por Hora (€) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.custoHora}
                onChange={(e) => setFormData({ ...formData, custoHora: e.target.value })}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: 12.50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Save size={20} />
              {loading ? "A Guardar..." : "Guardar Funcionário"}
            </button>
          </div>
        </form>
      </div>

      {/* Coluna da Direita: Lista de Pessoal */}
      <div className="lg:col-span-2">
        <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-slate-200">Equipa Registada</h2>
            <span className="bg-blue-600/20 text-blue-400 py-1 px-3 rounded-full text-sm font-medium">
              Total: {funcionariosIniciais.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            {funcionariosIniciais.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <HardHat className="mx-auto mb-3 text-slate-500" size={40} />
                <p>Ainda não registaste nenhum trabalhador.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs text-slate-400 uppercase bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-4 font-medium">Nome</th>
                    <th className="px-6 py-4 font-medium">Cargo</th>
                    <th className="px-6 py-4 font-medium text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {funcionariosIniciais.map((func) => (
                    <tr key={func.id} className="hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-200">{func.nome}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          func.cargo === 'COORDENADOR' ? 'bg-purple-600/20 text-purple-400' :
                          func.cargo === 'CHEFE_EQUIPA' ? 'bg-yellow-600/20 text-yellow-400' :
                          'bg-slate-600/20 text-slate-300'
                        }`}>
                          {func.cargo.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => handleEliminar(func.id, func.nome)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                          title="Eliminar Funcionário"
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
    </div>
  )
}