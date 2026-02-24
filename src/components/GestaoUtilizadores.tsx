"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ShieldCheck, UserPlus, Trash2, Save } from "lucide-react"

type Utilizador = {
  id: string
  name: string | null
  email: string | null
  role: string
  createdAt: Date
}

export default function GestaoUtilizadores({ utilizadores }: { utilizadores: Utilizador[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  // Estado do novo formulário
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "USER" })

  const handleCriarUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/utilizadores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setFormData({ name: "", email: "", password: "", role: "USER" })
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || "Erro ao criar utilizador.")
      }
    } catch (error) {
      alert("Falha de comunicação.")
    } finally {
      setLoading(false)
    }
  }

  const handleMudarPatente = async (id: string, novaRole: string) => {
    setLoadingId(id)
    try {
      await fetch(`/api/utilizadores/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: novaRole })
      })
      router.refresh()
    } finally {
      setLoadingId(null)
    }
  }

  const handleEliminar = async (id: string, email: string | null) => {
    if (!confirm(`Atenção: Queres mesmo eliminar o acesso de ${email}?`)) return
    setLoadingId(id)
    try {
      await fetch(`/api/utilizadores/${id}`, { method: "DELETE" })
      router.refresh()
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Coluna da Esquerda: Novo Acesso */}
      <div className="lg:col-span-1">
        <form onSubmit={handleCriarUser} className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-6 sticky top-8">
          <h2 className="text-xl font-semibold text-slate-200 mb-6 flex items-center gap-2">
            <UserPlus size={20} className="text-purple-500" /> Dar Acesso
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nome</label>
              <input
                type="text" required value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email Profissional</label>
              <input
                type="email" required value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Palavra-passe Inicial</label>
              <input
                type="text" required value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Patente Inicial</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="USER">USER (Apenas Vê)</option>
                <option value="ADMIN">ADMIN (Alto Cargo)</option>
                <option value="SUPERADMIN">SUPERADMIN (Controlo Total)</option>
              </select>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full mt-4 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-600 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Save size={20} />
              {loading ? "A Guardar..." : "Criar Utilizador"}
            </button>
          </div>
        </form>
      </div>

      {/* Coluna da Direita: Lista de Contas */}
      <div className="lg:col-span-2">
        <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-slate-200">Contas Registadas</h2>
            <span className="bg-purple-600/20 text-purple-400 py-1 px-3 rounded-full text-sm font-medium">
              Total: {utilizadores.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs text-slate-400 uppercase bg-slate-900/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Utilizador</th>
                  <th className="px-6 py-4 font-medium">Patente (Role)</th>
                  <th className="px-6 py-4 font-medium text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {utilizadores.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-200">{user.name || "Sem Nome"}</div>
                      <div className="text-slate-500 text-xs mt-1">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        disabled={loadingId === user.id}
                        onChange={(e) => handleMudarPatente(user.id, e.target.value)}
                        className={`text-xs font-bold rounded p-1.5 border-none cursor-pointer outline-none focus:ring-2 focus:ring-purple-500 ${
                          user.role === 'SUPERADMIN' ? 'bg-purple-600/20 text-purple-400' :
                          user.role === 'ADMIN' ? 'bg-blue-600/20 text-blue-400' :
                          'bg-slate-600/20 text-slate-300'
                        }`}
                      >
                        <option value="USER" className="bg-slate-800 text-slate-300">USER</option>
                        <option value="ADMIN" className="bg-slate-800 text-blue-400">ADMIN</option>
                        <option value="SUPERADMIN" className="bg-slate-800 text-purple-400">SUPERADMIN</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleEliminar(user.id, user.email)}
                        disabled={loadingId === user.id}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors disabled:opacity-50"
                        title="Revogar Acesso"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}