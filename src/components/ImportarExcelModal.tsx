"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
// O ÍCONE PACKAGEPLUS JÁ ESTÁ AQUI LIGADO NA CENTRALINA VISUAL!
import { FileSpreadsheet, Upload, X, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, PackagePlus } from "lucide-react"

type CheckupData = {
  totalLido: number
  novos: any[]
  atualizar: any[]
  erros: any[]
}

export default function ImportarExcelModal() {
  const router = useRouter()
  const [aberto, setAberto] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  
  const [loading, setLoading] = useState(false)
  const [checkup, setCheckup] = useState<CheckupData | null>(null)

  const handleSimularImportacao = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      // A NOVA ROTA SEGURA (Sem cruzar com o [id] dos materiais)
      const res = await fetch("/api/importar-excel", {
        method: "POST",
        body: formData
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setCheckup(data) 
      } else {
        alert(data.error || "Erro ao ler o ficheiro Excel.")
      }
    } catch (error) {
      alert("Falha de comunicação com a Centralina do Excel.")
    } finally {
      setLoading(false)
    }
  }

  // 2. Fase de Injeção (A gravar a sério!)
  const handleConfirmarInjecao = async () => {
    if (!checkup) return
    
    // Aproveitamos o mesmo loading para bloquear o botão enquanto grava
    setLoading(true)

    try {
      const res = await fetch("/api/importar-excel/confirmar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Mandamos o pacote exato que o Raio-X preparou!
        body: JSON.stringify({
          novos: checkup.novos,
          atualizar: checkup.atualizar
        })
      })
      
      if (res.ok) {
        alert("✅ Motor Injetado com Sucesso! O teu armazém está atualizado.")
        fecharModal()
        router.refresh() // Recarrega a tabela de trás para veres a magia acontecer
      } else {
        const data = await res.json()
        alert(data.error || "Erro ao gravar na centralina.")
      }
    } catch (error) {
      alert("Os Drones cortaram a comunicação durante a gravação.")
    } finally {
      setLoading(false)
    }
  }

  const fecharModal = () => {
    setAberto(false)
    setFile(null)
    setCheckup(null)
  }

  if (!aberto) {
    return (
      <button onClick={() => setAberto(true)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg font-bold transition-colors shadow-md">
        <FileSpreadsheet size={20} /> Importar Excel
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) fecharModal()}}>
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 max-w-3xl w-full shadow-2xl relative transition-colors max-h-[90vh] overflow-y-auto">
        <button onClick={fecharModal} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors">
          <X size={24} />
        </button>
        
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-2">
          <FileSpreadsheet className="text-emerald-500" /> Sincronizar Inventário
        </h3>
        
        {!checkup ? (
          <>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
              Carrega o Excel antigo. O sistema fará um <strong>Checkup das diferenças</strong> antes de injetar no servidor HP.
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
                  Modo de Segurança Ativo: Os dados não serão substituídos de imediato. Será apresentado um ecrã com o "Checkup" do que entra de novo.
                </p>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-500 disabled:opacity-50 text-white p-4 rounded-xl font-bold uppercase tracking-wider transition-colors flex justify-center items-center gap-2">
                {loading ? "A Analisar Folha..." : "Analisar Documento"} <ArrowRight size={20} />
              </button>
            </form>
          </>
        ) : (
          <div className="space-y-6 mt-6">
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <div>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Total de Linhas Lidas</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{checkup.totalLido}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Novos: +{checkup.novos.length}</p>
                <p className="text-sm font-bold text-blue-600 dark:text-blue-400">A Atualizar: {checkup.atualizar.length}</p>
              </div>
            </div>

            {checkup.erros.length > 0 && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 p-4 rounded-lg">
                <h4 className="text-sm font-bold text-red-700 dark:text-red-400 flex items-center gap-2 mb-2"><AlertTriangle size={16}/> Problemas Detetados ({checkup.erros.length})</h4>
                <p className="text-xs text-red-600 dark:text-red-300">Algumas linhas não têm Referência ou Descrição e serão ignoradas.</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 max-h-60 overflow-y-auto">
                <h4 className="font-bold text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-2 sticky top-0 bg-white dark:bg-slate-800 pb-2"><PackagePlus size={16}/> Peças Novas</h4>
                <ul className="space-y-2 text-sm">
                  {checkup.novos.slice(0, 20).map((p, i) => (
                    <li key={i} className="flex justify-between border-b border-slate-100 dark:border-slate-700 pb-1">
                      <span className="text-slate-600 dark:text-slate-300 truncate pr-2">{p.referencia}</span>
                      <span className="font-bold text-slate-900 dark:text-white">+{p.quantidade}</span>
                    </li>
                  ))}
                  {checkup.novos.length === 0 && <li className="text-xs text-slate-400">Nenhuma peça nova detetada.</li>}
                </ul>
              </div>

              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 max-h-60 overflow-y-auto">
                <h4 className="font-bold text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2 sticky top-0 bg-white dark:bg-slate-800 pb-2"><CheckCircle2 size={16}/> Peças a Atualizar</h4>
                <ul className="space-y-2 text-sm">
                  {checkup.atualizar.slice(0, 20).map((p, i) => (
                    <li key={i} className="flex justify-between border-b border-slate-100 dark:border-slate-700 pb-1">
                      <span className="text-slate-600 dark:text-slate-300 truncate pr-2">{p.referencia}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{p.qtdAntiga} ➔ {p.qtdNova}</span>
                    </li>
                  ))}
                  {checkup.atualizar.length === 0 && <li className="text-xs text-slate-400">Nenhuma atualização de quantidade detetada.</li>}
                </ul>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button onClick={() => setCheckup(null)} className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white p-3 rounded-lg font-bold transition-colors">
                Cancelar Importação
              </button>
              <button onClick={handleConfirmarInjecao} disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-500 text-white p-3 rounded-lg font-bold transition-colors shadow-lg shadow-blue-500/30">
                {loading ? "A Injetar no Motor..." : "Confirmar e Injetar"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}