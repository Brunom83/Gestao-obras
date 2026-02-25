"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FileText, Save, Upload, Download } from "lucide-react"

// O tipo que o radar precisa de conhecer
type Documento = {
  id: string
  nomeOriginal: string
  caminhoFicheiro: string
  valor: number | null
  dataUpload: Date
}

export default function GerirFaturasObra({ obraId, documentos }: { obraId: string, documentos: Documento[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [aberto, setAberto] = useState(false)

  const [descricao, setDescricao] = useState("")
  const [valor, setValor] = useState("")
  const [file, setFile] = useState<File | null>(null)

  const handleGravar = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Preparamos o pacote de dados para enviar com o ficheiro
    const formData = new FormData()
    formData.append("descricao", descricao)
    formData.append("valor", valor)
    if (file) {
      formData.append("file", file)
    }

    try {
      const res = await fetch(`/api/obras/${obraId}/documentos`, {
        method: "POST",
        body: formData, // Não enviamos JSON, enviamos o FormData!
      })

      if (res.ok) {
        setDescricao("")
        setValor("")
        setFile(null)
        setAberto(false)
        router.refresh() // O ecrã da obra atualiza os custos na hora!
      } else {
        alert("Erro ao gravar. Os Drones intercetaram a fatura.")
      }
    } catch (error) {
      alert("Falha de comunicação com o servidor HP.")
    } finally {
      setLoading(false)
    }
  }

  // Apenas mostra as faturas (podemos ter outros documentos no futuro)
  const faturas = documentos.filter(d => d.valor !== null && d.valor > 0)
  const formatadorMoeda = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-slate-500">Registe os custos externos para abater ao orçamento.</p>
        <button 
          onClick={() => setAberto(!aberto)}
          className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-md text-sm"
        >
          {aberto ? "Cancelar Fatura" : "+ Registar Fatura"}
        </button>
      </div>

      {/* O Motor de Injeção (Formulário) */}
      {aberto && (
        <form onSubmit={handleGravar} className="bg-slate-800 p-5 rounded-lg border border-slate-700 mb-6 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Descrição do Gasto *</label>
            <input type="text" required value={descricao} onChange={e => setDescricao(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-2.5 text-slate-200 focus:border-red-500 outline-none" placeholder="Ex: Fatura Hilti nº 2024/123" />
          </div>
          <div className="w-full md:w-32">
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Valor (€) *</label>
            <input type="number" step="0.01" min="0.01" required value={valor} onChange={e => setValor(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-2.5 text-slate-200 focus:border-red-500 outline-none" placeholder="0.00" />
          </div>
          <div className="w-full md:w-64">
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><Upload size={14}/> Anexo (PDF/Img)</label>
            <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full text-sm text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:text-xs file:font-bold file:bg-slate-700 file:text-slate-200 hover:file:bg-slate-600 cursor-pointer" />
          </div>
          <button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-500 text-white px-6 py-2.5 rounded font-bold transition-colors flex items-center gap-2 disabled:opacity-50 w-full md:w-auto justify-center">
            <Save size={18} /> {loading ? "A processar..." : "Gravar"}
          </button>
        </form>
      )}

      {/* Tabela de Faturas Registadas */}
      <ul className="space-y-2">
        {faturas.length === 0 ? (
          <li className="text-slate-500 text-sm text-center py-4 bg-slate-800/30 rounded border border-slate-800 border-dashed">Nenhuma fatura registada nesta obra.</li>
        ) : (
          faturas.map(fat => (
            <li key={fat.id} className="flex justify-between items-center text-sm bg-slate-800/50 p-3 rounded border border-slate-700 hover:bg-slate-800 transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="text-red-400" size={20} />
                <div>
                  <p className="text-slate-200 font-medium">{fat.nomeOriginal}</p>
                  <p className="text-slate-500 text-xs">{new Date(fat.dataUpload).toLocaleDateString('pt-PT')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-red-400 text-lg">{formatadorMoeda.format(fat.valor || 0)}</span>
                {fat.caminhoFicheiro !== "Sem anexo" && (
                  <a href={fat.caminhoFicheiro} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-700 hover:bg-slate-600 text-blue-400 rounded transition-colors" title="Ver Anexo">
                    <Download size={16} />
                  </a>
                )}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}