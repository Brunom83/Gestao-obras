"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ShieldCheck, UserPlus, Trash2, Save, Tag } from "lucide-react"

type CargoOrganograma = {
  id: string
  departamento: string
  subDepartamento: string | null
  nome: string
  cor: string
}

type Utilizador = {
  id: string
  name: string | null
  email: string | null
  role: string
  cargoId: string | null
  cargo: CargoOrganograma | null
  createdAt: Date
}

export default function GestaoUtilizadores({ 
  utilizadores, 
  listaCargos 
}: { 
  utilizadores: Utilizador[],
  listaCargos: CargoOrganograma[] 
}) {
  const router = useRouter()
  const { data: session } = useSession()
  const myRole = (session?.user as any)?.role

  const [loading, setLoading] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "USER", cargoId: "" })

  const utilizadoresVisiveis = utilizadores.filter(user => myRole === 'MASTER' || user.role !== 'MASTER')

  // Agrupar o organograma com o estilo Teku
  const cargosAgrupados = listaCargos.reduce((acc, cargo) => {
    const grupo = cargo.subDepartamento ? `${cargo.departamento} - ${cargo.subDepartamento}` : cargo.departamento;
    if (!acc[grupo]) acc[grupo] = [];
    acc[grupo].push(cargo);
    return acc;
  }, {} as Record<string, CargoOrganograma[]>);

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
        setFormData({ name: "", email: "", password: "", role: "USER", cargoId: "" })
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

  // Agora serve tanto para mudar a Patente (Role) como a Etiqueta (CargoId)
  const handleAtualizarConta = async (id: string, campo: string, valor: string) => {
    setLoadingId(id)
    try {
      const res = await fetch(`/api/utilizadores/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [campo]: valor })
      })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error)
      }
      router.refresh()
    } finally {
      setLoadingId(null)
    }
  }

  const handleEliminar = async (id: string, email: string | null) => {
    if (!confirm(`Atenção: Pretende mesmo revogar o acesso de ${email}?`)) return
    setLoadingId(id)
    try {
      const res = await fetch(`/api/utilizadores/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error)
      }
      router.refresh()
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <form onSubmit={handleCriarUser} className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-6 sticky top-8">
          <h2 className="text-xl font-semibold text-slate-200 mb-6 flex items-center gap-2">
            <UserPlus size={20} className="text-purple-500" /> Dar Acesso
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nome</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email Profissional</label>
              <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Palavra-passe</label>
              <input type="text" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-purple-500" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Patente</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-purple-500">
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="SUPERADMIN">SUPERADMIN</option>
                  {myRole === 'MASTER' && <option value="MASTER">MASTER</option>}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Organograma</label>
                <select value={formData.cargoId} onChange={(e) => setFormData({ ...formData, cargoId: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-purple-500 text-sm">
                  <option value="">-- Sem Etiqueta --</option>
                  {Object.entries(cargosAgrupados).map(([grupo, cargos]) => (
                    <optgroup key={grupo} label={grupo} className="text-slate-400 font-bold bg-slate-800">
                      {cargos.map(c => <option key={c.id} value={c.id} className="text-white font-normal bg-slate-900">{c.nome}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full mt-4 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-600 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
              <Save size={20} />
              {loading ? "A Guardar..." : "Criar Utilizador"}
            </button>
          </div>
        </form>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-slate-200">Contas Registadas</h2>
            <span className="bg-purple-600/20 text-purple-400 py-1 px-3 rounded-full text-sm font-medium">Total: {utilizadoresVisiveis.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs text-slate-400 uppercase bg-slate-900/50">
                <tr>
                  <th className="px-6 py-4">Utilizador</th>
                  <th className="px-6 py-4">Patente</th>
                  <th className="px-6 py-4">Etiqueta do Organograma</th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {utilizadoresVisiveis.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-700/50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-200">{user.name || "Sem Nome"}</div>
                      <div className="text-slate-500 text-xs mt-1">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        disabled={loadingId === user.id || (user.role === 'MASTER' && myRole !== 'MASTER')}
                        onChange={(e) => handleAtualizarConta(user.id, 'role', e.target.value)}
                        className={`text-xs font-bold rounded p-1.5 border-none cursor-pointer outline-none focus:ring-2 focus:ring-purple-500 ${
                          user.role === 'MASTER' ? 'bg-red-600/20 text-red-400' :
                          user.role === 'SUPERADMIN' ? 'bg-purple-600/20 text-purple-400' :
                          user.role === 'ADMIN' ? 'bg-blue-600/20 text-blue-400' : 'bg-slate-600/20 text-slate-300'
                        }`}
                      >
                        <option value="USER" className="bg-slate-800 text-slate-300">USER</option>
                        <option value="ADMIN" className="bg-slate-800 text-blue-400">ADMIN</option>
                        <option value="SUPERADMIN" className="bg-slate-800 text-purple-400">SUPERADMIN</option>
                        {myRole === 'MASTER' && <option value="MASTER" className="bg-slate-800 text-red-400">MASTER</option>}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                       <select
                          value={user.cargoId || ""}
                          disabled={loadingId === user.id || (user.role === 'MASTER' && myRole !== 'MASTER')}
                          onChange={(e) => handleAtualizarConta(user.id, 'cargoId', e.target.value)}
                          className="bg-slate-900 border border-slate-600 rounded p-1.5 text-xs text-white focus:ring-purple-500 max-w-[150px]"
                        >
                          <option value="">-- Sem Etiqueta --</option>
                          {Object.entries(cargosAgrupados).map(([grupo, cargos]) => (
                            <optgroup key={grupo} label={grupo} className="text-slate-400 font-bold bg-slate-800">
                              {cargos.map(c => <option key={c.id} value={c.id} className="text-white font-normal bg-slate-900">{c.nome}</option>)}
                            </optgroup>
                          ))}
                        </select>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => handleEliminar(user.id, user.email)} disabled={loadingId === user.id || (user.role === 'MASTER' && myRole !== 'MASTER')} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded disabled:opacity-50">
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