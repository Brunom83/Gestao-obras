import { PrismaClient } from "@prisma/client"
import { Package } from "lucide-react"
import InventarioTable from "@/components/InventarioTable"

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export default async function InventarioPage() {
  // 1. O Servidor vai buscar os dados ao PostgreSQL
  const materiais = await prisma.material.findMany({
    orderBy: {
      descricao: 'asc'
    }
  })

  // 2. Entrega os dados ao Componente Cliente para serem renderizados com a pesquisa
  return (
    <div className="p-8 w-full">
      <div className="flex items-center gap-3 mb-8">
        <Package className="text-blue-500" size={32} />
        <h1 className="text-3xl font-bold text-slate-100">Gestão de Inventário</h1>
      </div>

      <InventarioTable materiais={materiais} />
    </div>
  )
}