"use client"

import { useState } from "react"
import { FileSpreadsheet, Upload, X, ShieldAlert } from "lucide-react"

export default function ImportarExcelModal() {
  const [aberto, setAberto] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const handleSimularImportacao = (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    // Na próxima fase, isto vai chamar a API para ler o Excel e mostrar as diferenças!
    alert(`O ficheiro "${file.name}" foi colocado na câmara de leitura! O motor de comparação (Checkup e Backup) será ligado no próximo passo.`)
  }

  if (!aberto) {
    return (
      <button 
        onClick={() => setAberto(true)}
        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg font-bold transition-colors shadow-md"
      >
        <FileSpreadsheet size={20} /> Importar Excel
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) setAberto(false)}}>
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 max-w-lg w-full shadow-2xl relative transition-colors">
        <button onClick={() => setAberto(false)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors">
          <X size={24} />
        </button>
        
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-2">
          <FileSpreadsheet className="text-emerald-500" /> Sincronizar Inventário
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
          Carrega o Excel antigo. O sistema fará um <strong>Checkup das diferenças</strong> e um <strong>Backup automático</strong> antes de injetar os novos materiais no servidor HP.
        </p>

        <form onSubmit={handleSimularImportacao} className="space-y-6">
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer relative">
            <input type="file" accept=".xlsx, .xls, .csv" onChange={e => setFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required />
            <Upload className="mx-auto text-slate-400 mb-3" size={32} />
            <p className="text-slate-700 dark:text-slate-300 font-medium">
              {file ? <span className="text-emerald-500 font-bold">{file.name}</span> : "Clica ou arrasta a folha de Excel para aqui"}
            </p>
            <p className="text-xs text-slate-500 mt-2">Formatos suportados: .xlsx, .csv</p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 p-4 rounded-lg flex items-start gap-3">
            <ShieldAlert className="text-amber-500 shrink-0 mt-0.5" size={20} />
            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
              Modo de Segurança Ativo: Os dados não serão substituídos de imediato. Será apresentado um ecrã com o "Checkup" do que entra de novo e do que vai ser alterado.
            </p>
          </div>

          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-500 text-white p-4 rounded-xl font-bold uppercase tracking-wider transition-colors">
            Analisar Documento
          </button>
        </form>
      </div>
    </div>
  )
}