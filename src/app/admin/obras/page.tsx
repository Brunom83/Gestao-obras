import { PrismaClient } from "@prisma/client"
import { HardHat, Plus } from "lucide-react"
import Link from "next/link"
import ObrasList from "@/components/ObrasList"

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export default async function ObrasPage() {
  // Busca todas as obras na base de dados
  const obras = await prisma.obra.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="p-8 w-full max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <HardHat className="text-blue-500" size={32} />
          <h1 className="text-3xl font-bold text-slate-100">Gestão de Obras</h1>
        </div>
        
        <Link 
          href="/admin/obras/nova"
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Nova Obra
        </Link>
      </div>

      {/* Renderiza a componente interativa que acabámos de criar */}
      <ObrasList obrasIniciais={obras} />
    </div>
  )
}