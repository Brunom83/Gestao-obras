import { PrismaClient } from "@prisma/client"
import Link from "next/link"
import { Clock, MapPin, ArrowRight, HardHat } from "lucide-react"

const prisma = new PrismaClient()

// Força o servidor HP a ler os dados em tempo real
export const dynamic = 'force-dynamic'

export default async function ListaHorasPage() {
  // Vai buscar APENAS as obras que estão a decorrer
  const obrasAtivas = await prisma.obra.findMany({
    where: { estado: 'EM_CURSO' },
    orderBy: { nome: 'asc' }
  })

  return (
    <div className="p-8 w-full max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Clock className="text-blue-500" size={32} />
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Registo de Horas</h1>
          <p className="text-slate-400 mt-1">Seleciona a obra onde a tua equipa esteve a trabalhar hoje.</p>
        </div>
      </div>

      {obrasAtivas.length === 0 ? (
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-12 text-center">
          <HardHat className="mx-auto text-slate-500 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-slate-300">Nenhuma obra em curso neste momento.</h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {obrasAtivas.map((obra) => (
            <Link 
              href={`/admin/horas/${obra.id}`} 
              key={obra.id} 
              className="group bg-slate-800 rounded-lg border border-slate-700 p-6 hover:border-blue-500 transition-all flex flex-col justify-between"
            >
              <div>
                <h3 className="text-xl font-bold text-slate-200 line-clamp-2 mb-3 group-hover:text-blue-400 transition-colors">
                  {obra.nome}
                </h3>
                <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
                  <MapPin size={16} className="text-slate-500" />
                  <span className="truncate">{obra.localizacao || "Sem localização"}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-blue-400 font-medium text-sm border-t border-slate-700 pt-4">
                <span>Lançar Horas da Equipa</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}