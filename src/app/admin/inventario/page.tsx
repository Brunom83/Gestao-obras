import { PrismaClient } from "@prisma/client"
import { Package } from "lucide-react"
import InventarioTable from "@/components/InventarioTable"
import NovoMaterialForm from "@/components/NovoMaterialForm"

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export default async function InventarioPage() {
  const materiais = await prisma.material.findMany({
    orderBy: {
      descricao: 'asc'
    }
  })

  return (
    <div className="p-8 w-full max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Package className="text-blue-500" size={32} />
        <h1 className="text-3xl font-bold text-slate-100">Gestão de Inventário</h1>
      </div>

      {/* O nosso novo cockpit de Injeção */}
      <NovoMaterialForm />

      <InventarioTable materiaisIniciais={materiais} />
    </div>
  )
}