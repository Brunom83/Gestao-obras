import { PrismaClient } from "@prisma/client"
import { Package, Search } from "lucide-react"
import { getServerSession } from "next-auth" // Adicionado para ver quem está logado
import { authOptions } from "@/lib/auth"
import InventarioTable from "@/components/InventarioTable"

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export default async function InventarioPage() {
  // O Radar Teku
  const session = await getServerSession(authOptions)
  const patenteAtual = (session?.user as any)?.role || "USER"

  // Busca os materiais
  const materiais = await prisma.material.findMany({
    orderBy: { descricao: 'asc' }
  })

  // Busca as obras ativas (Apenas se precisar delas para os Pedidos)
  const obras = await prisma.obra.findMany({
    where: { estado: 'EM_CURSO' },
    orderBy: { nome: 'asc' }
  })

  return (
    <div className="p-8 w-full max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Package className="text-blue-500" size={32} />
        <h1 className="text-3xl font-bold text-slate-100">Armazém e Stock</h1>
      </div>

      {/* Injeta os dados novos no componente visual */}
      <InventarioTable 
        materiaisIniciais={materiais} 
        obrasAtivas={obras}
        userRole={patenteAtual} 
      />
    </div>
  )
}