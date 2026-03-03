"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PackagePlus, PackageMinus, Save, X, Search, QrCode, ClipboardList, Building2 } from "lucide-react"
import { QRCodeCanvas } from "qrcode.react"
import toast from "react-hot-toast"

type Material = {
  id: string
  descricao: string
  medidas: string | null
  quantidade: number
  unidade: string | null
  referenciaInterna: string | null 
}

type Obra = {
  id: string
  nome: string
}

export default function InventarioTable({ 
  materiaisIniciais, obrasAtivas, userRole
}: { 
  materiaisIniciais: Material[], obrasAtivas: Obra[], userRole: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [pesquisa, setPesquisa] = useState("")

  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeAction, setActiveAction] = useState<'adicionar' | 'remover' | null>(null)
  const [quantidadeInput, setQuantidadeInput] = useState("")
  
  const [showQrCodeMat, setShowQrCodeMat] = useState<Material | null>(null)
  const [modalRequisicao, setModalRequisicao] = useState<Material | null>(null)
  const [reqData, setReqData] = useState({ obraId: "", quantidade: "" })

  const isAdminOrHigher = ["ADMIN", "SUPERADMIN", "MASTER"].includes(userRole)

  const termosPesquisa = pesquisa.toLowerCase().split(" ").filter(termo => termo.trim() !== "")
  const materiaisFiltrados = materiaisIniciais.filter(mat => {
    const textoDaPeca = `${mat.descricao} ${mat.medidas || ""} ${mat.unidade || ""} ${mat.referenciaInterna || ""}`.toLowerCase()
    return termosPesquisa.every(termo => textoDaPeca.includes(termo))
  })

  const handleStock = async (e: React.FormEvent, id: string) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`/api/materiais/${id}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantidade: Number(quantidadeInput), acao: activeAction })
      })

      if (res.ok) {
        setActiveId(null)
        setActiveAction(null)
        setQuantidadeInput("")
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || "Erro ao atualizar stock.")
      }
    } catch (error) {
      alert("Falha de comunicação.")
    } finally {
      setLoading(false)
    }
  }

  const handleRequisicao = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!modalRequisicao) return

    setLoading(true)
    const toastId = toast.loading("A submeter pedido...")

    try {
      const res = await fetch(`/api/pedidos-material`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialId: modalRequisicao.id, obraId: reqData.obraId, quantidade: reqData.quantidade })
      })

      if (res.ok) {
        toast.success("Ticket submetido!", { id: toastId })
        setModalRequisicao(null)
        setReqData({ obraId: "", quantidade: "" })
      } else {
        const error = await res.json()
        toast.error(error.error || "Erro ao fazer o pedido.", { id: toastId })
      }
    } catch (error) {
      toast.error("Falha na comunicação.", { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden relative transition-colors">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-200">Stock Atual</h2>
          <span className="bg-blue-100 dark:bg-blue-600/20 text-blue-700 dark:text-blue-400 py-1 px-3 rounded-full text-sm font-medium mt-2 inline-block">
            Mostrando: {materiaisFiltrados.length}
          </span>
        </div>

        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 dark:text-slate-500" />
          </div>
          <input
            type="text"
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            className="block w-full pl-10 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg py-2.5 text-slate-900 dark:text-slate-200 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors outline-none"
            placeholder="Procurar material, medida ou ref..."
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
          <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-slate-900/50">
            <tr>
              <th className="px-6 py-4 font-bold">Ref. Interna</th>
              <th className="px-6 py-4 font-bold">Descrição</th>
              <th className="px-6 py-4 font-bold">Medidas</th>
              <th className="px-6 py-4 font-bold text-right">Em Stock</th>
              <th className="px-6 py-4 font-bold text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {materiaisFiltrados.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Nenhum material encontrado.</td>
              </tr>
            ) : (
              materiaisFiltrados.map((mat) => (
                <tr key={mat.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-blue-600 dark:text-blue-400 font-medium">{mat.referenciaInterna || "S/ Ref."}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-200">{mat.descricao}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-500">{mat.medidas || "-"}</td>
                  <td className={`px-6 py-4 text-right font-bold ${mat.quantidade < 10 ? 'text-amber-500' : 'text-blue-600 dark:text-blue-400'}`}>
                    {mat.quantidade} <span className="text-slate-500 font-normal text-xs">{mat.unidade}</span>
                  </td>
                  
                  <td className="px-6 py-4">
                    {isAdminOrHigher && activeId === mat.id ? (
                      <form onSubmit={(e) => handleStock(e, mat.id)} className="flex items-center justify-center gap-2">
                        <input
                          type="number" min="0.1" step="0.1" required autoFocus
                          value={quantidadeInput} onChange={(e) => setQuantidadeInput(e.target.value)}
                          className="w-20 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded p-1.5 text-slate-900 dark:text-white text-center text-sm focus:ring-blue-500 outline-none"
                          placeholder="Qtd..."
                        />
                        <button type="submit" disabled={loading} className={`p-1.5 text-white rounded transition-colors disabled:opacity-50 ${activeAction === 'adicionar' ? 'bg-green-600' : 'bg-red-600'}`}>
                          <Save size={16} />
                        </button>
                        <button type="button" onClick={() => { setActiveId(null); setActiveAction(null); setQuantidadeInput(""); }} className="p-1.5 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-white rounded transition-colors">
                          <X size={16} />
                        </button>
                      </form>
                    ) : (
                      <div className="flex justify-center gap-2">
                        <button onClick={() => setShowQrCodeMat(mat)} className="flex items-center gap-1 p-1.5 px-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors text-xs font-medium" title="Gerar QR Code">
                          <QrCode size={16} />
                        </button>

                        {isAdminOrHigher ? (
                          <>
                            <button onClick={() => { setActiveId(mat.id); setActiveAction('adicionar'); }} className="flex items-center gap-1 p-1.5 px-3 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-400/10 border border-green-200 dark:border-green-400/20 rounded-lg transition-colors text-xs font-medium">
                              <PackagePlus size={16} /> <span className="hidden sm:inline">Injetar</span>
                            </button>
                            <button onClick={() => { setActiveId(mat.id); setActiveAction('remover'); }} className="flex items-center gap-1 p-1.5 px-3 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-400/10 border border-red-200 dark:border-red-400/20 rounded-lg transition-colors text-xs font-medium">
                              <PackageMinus size={16} /> <span className="hidden sm:inline">Retirar</span>
                            </button>
                          </>
                        ) : (
                          <button onClick={() => setModalRequisicao(mat)} className="flex items-center gap-1.5 p-1.5 px-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-400/10 border border-blue-200 dark:border-blue-400/20 rounded-lg transition-colors text-sm font-bold uppercase tracking-wide">
                            <ClipboardList size={18} /> Requisitar
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* MODAL DO QR CODE (Com Pintura Dupla) */}
      {showQrCodeMat && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/80 flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowQrCodeMat(null)}}>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 max-w-sm w-full text-center shadow-2xl relative transition-colors">
            <button onClick={() => setShowQrCodeMat(null)} className="absolute top-4 right-4 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              <X size={24} />
            </button>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">{showQrCodeMat.descricao}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{showQrCodeMat.medidas || "Sem medidas específicas"}</p>
            <div className="bg-white p-4 rounded-xl inline-block mb-6 shadow-sm border border-slate-100">
              <QRCodeCanvas value={`hilti-ref:${showQrCodeMat.referenciaInterna || showQrCodeMat.id}`} size={200} level={"H"} includeMargin={true} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-500 break-all">
              Referência do Sistema: <br/> 
              <span className="font-bold text-lg text-slate-800 dark:text-slate-200">{showQrCodeMat.referenciaInterna || "ID: " + showQrCodeMat.id}</span>
            </p>
          </div>
        </div>
      )}

      {/* MODAL DE REQUISIÇÃO (Com Pintura Dupla) */}
      {modalRequisicao && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/80 flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) setModalRequisicao(null)}}>
          <form onSubmit={handleRequisicao} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 max-w-md w-full shadow-2xl relative transition-colors">
            <button type="button" onClick={() => setModalRequisicao(null)} className="absolute top-4 right-4 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              <X size={24} />
            </button>
            
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Pedir Material</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
              Requisitar <strong className="text-blue-600 dark:text-blue-400">{modalRequisicao.descricao}</strong> para uma obra.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  <Building2 size={16} className="text-blue-600 dark:text-blue-400"/> Destino (Obra)
                </label>
                <select 
                  required value={reqData.obraId} onChange={e => setReqData({...reqData, obraId: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-slate-900 dark:text-white focus:ring-blue-500 outline-none"
                >
                  <option value="">-- Escolhe a Obra --</option>
                  {obrasAtivas.map(o => <option key={o.id} value={o.id}>{o.nome}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Quantidade ({modalRequisicao.unidade || "un"})</label>
                <input 
                  type="number" min="0.1" step="0.1" required
                  value={reqData.quantidade} onChange={e => setReqData({...reqData, quantidade: e.target.value})}
                  placeholder={`Em stock: ${modalRequisicao.quantidade}`}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-slate-900 dark:text-white focus:ring-blue-500 outline-none"
                />
              </div>

              <button type="submit" disabled={loading} className="w-full mt-6 bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 text-white p-4 rounded-xl font-bold uppercase tracking-wider transition-colors">
                {loading ? "A Transmitir..." : "Enviar Pedido"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}