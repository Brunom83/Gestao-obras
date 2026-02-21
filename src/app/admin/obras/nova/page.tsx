"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { HardHat, ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

export default function NovaObraPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState("")

  // Estado que guarda a informação enquanto o utilizador escreve
  const [formData, setFormData] = useState({
    nome: "",
    localizacao: "",
    estado: "EM_CURSO",
    dataInicio: new Date().toISOString().split('T')[0], // Preenche a data de hoje por defeito
    dataFim: ""
  })

  // Atualiza o estado sempre que uma tecla é pressionada num input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Função disparada ao clicar em "Guardar Obra"
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErro("")

    try {
      const res = await fetch("/api/obras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        throw new Error("Falha ao guardar a obra. Verifica a ligação.")
      }

      // Se for sucesso, volta para a lista de obras e atualiza a página
      router.push("/admin/obras")
      router.refresh()
    } catch (err: any) {
      setErro(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 w-full max-w-4xl mx-auto">
      {/* Cabeçalho e Botão de Voltar */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/obras" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div className="flex items-center gap-3">
          <HardHat className="text-blue-500" size={32} />
          <h1 className="text-3xl font-bold text-slate-100">Registar Nova Obra</h1>
        </div>
      </div>

      

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-8">
        {erro && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded mb-6">
            {erro}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Nome da Obra ocupa 2 colunas */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">Nome da Obra *</label>
            <input
              type="text"
              name="nome"
              required
              value={formData.nome}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Reabilitação Edifício Baixa"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">Localização</label>
            <input
              type="text"
              name="localizacao"
              value={formData.localizacao}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Rua do Ouro, 123"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Estado</label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="EM_CURSO">Em Curso</option>
              <option value="PAUSADA">Pausada</option>
              <option value="CONCLUIDA">Concluída</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Data de Início *</label>
            <input
              type="date"
              name="dataInicio"
              required
              value={formData.dataInicio}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Data de Fim (Prevista)</label>
            <input
              type="date"
              name="dataFim"
              value={formData.dataFim}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-700">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={20} />
            {loading ? "A Guardar..." : "Guardar Obra"}
          </button>
        </div>
      </form>
    </div>
  )
}