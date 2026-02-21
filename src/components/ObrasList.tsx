"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MapPin, Calendar, Trash2, HardHat } from "lucide-react"

type Obra = {
  id: string
  nome: string
  localizacao: string | null
  estado: string
  dataInicio: Date
}

export default function ObrasList({ obrasIniciais }: { obrasIniciais: Obra[] }) {
  const router = useRouter()
  // Estado para controlar que aba está ativa
  const [abaAtiva, setAbaAtiva] = useState("TODAS")

  // Filtra as obras consoante a aba escolhida
  const obrasFiltradas = abaAtiva === "TODAS" 
    ? obrasIniciais 
    : obrasIniciais.filter(obra => obra.estado === abaAtiva)

  // Função para apagar a obra
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault() // Impede que o clique no botão abra a página da obra
    
    if (!confirm("Tens a certeza que queres eliminar esta obra? Todos os dados associados serão perdidos.")) return

    const res = await fetch(`/api/obras/${id}`, { method: 'DELETE' })
    if (res.ok) {
      router.refresh() // Pede ao servidor para recarregar a lista atualizada
    } else {
      alert("Erro ao eliminar a obra. Tenta novamente.")
    }
  }

  return (
    <div>
      {/* Abas de Navegação */}
      <div className="flex gap-2 mb-8 border-b border-slate-700 pb-px overflow-x-auto">
        <button 
          onClick={() => setAbaAtiva("TODAS")} 
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${abaAtiva === "TODAS" ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-slate-200"}`}
        >
          Todas as Obras
        </button>
        <button 
          onClick={() => setAbaAtiva("EM_CURSO")} 
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${abaAtiva === "EM_CURSO" ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-slate-200"}`}
        >
          Em Andamento
        </button>
        <button 
          onClick={() => setAbaAtiva("CONCLUIDA")} 
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${abaAtiva === "CONCLUIDA" ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-slate-200"}`}
        >
          Concluídas
        </button>
        <button 
          onClick={() => setAbaAtiva("PAUSADA")} 
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${abaAtiva === "PAUSADA" ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-slate-200"}`}
        >
          Pausadas
        </button>
      </div>

      {/* Grelha de Obras */}
      {obrasFiltradas.length === 0 ? (
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-12 text-center">
          <HardHat className="mx-auto text-slate-500 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-slate-300 mb-2">Nenhuma obra encontrada nesta categoria</h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {obrasFiltradas.map((obra) => (
            // O Link transforma o cartão inteiro numa área clicável
            <Link 
              href={`/admin/obras/${obra.id}`} 
              key={obra.id} 
              className="group relative bg-slate-800 rounded-lg border border-slate-700 p-6 hover:border-blue-500 transition-all block"
            >
              {/* Botão de Eliminar (Aparece ao passar o rato) */}
              <button 
                onClick={(e) => handleDelete(e, obra.id)}
                className="absolute top-4 right-4 p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-md opacity-0 group-hover:opacity-100 transition-all z-10"
                title="Eliminar Obra"
              >
                <Trash2 size={18} />
              </button>

              <div className="pr-8 mb-4">
                <h3 className="text-xl font-bold text-slate-200 line-clamp-2 mb-2 group-hover:text-blue-400 transition-colors">{obra.nome}</h3>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  obra.estado === 'EM_CURSO' ? 'bg-green-600/20 text-green-400' :
                  obra.estado === 'CONCLUIDA' ? 'bg-slate-600/20 text-slate-400' :
                  'bg-yellow-600/20 text-yellow-400'
                }`}>
                  {obra.estado.replace('_', ' ')}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-slate-500" />
                  <span className="truncate">{obra.localizacao || "Sem localização definida"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-slate-500" />
                  <span>Início: {new Date(obra.dataInicio).toLocaleDateString('pt-PT')}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}