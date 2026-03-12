import { PrismaClient } from "@prisma/client"
import { Package, Activity } from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import InventarioTable from "@/components/InventarioTable"
import NovoMaterialForm from "@/components/NovoMaterialForm"
import ImportarExcelModal from "@/components/ImportarExcelModal"
import Link from "next/link"
import RegistarSobrasModal from "@/components/RegistarSobrasModal"

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export default async function InventarioPage() {
  const session = await getServerSession(authOptions)
  const patenteAtual = (session?.user as any)?.role || "USER"
  
  // O radar de gerência que já tinhas montado!
  const isAdmin = ["ADMIN", "SUPERADMIN", "MASTER"].includes(patenteAtual)

  const materiais = await prisma.material.findMany({
    orderBy: { descricao: 'asc' }
  })

  const obras = await prisma.obra.findMany({
    where: { estado: 'EM_CURSO' },
    orderBy: { nome: 'asc' }
  })

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto space-y-6">
      
      {/* O CABEÇALHO E A ZONA DE AÇÕES */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div className="flex items-center gap-3">
          <Package className="text-blue-600 dark:text-blue-500" size={32} />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Armazém e Stock</h1>
        </div>

        {/* 🛡️ ZONA TRANCADA: Só aparece para Admin, SuperAdmin ou Master */}
        {isAdmin && (
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            
            <Link 
              href="/admin/historico"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 dark:bg-slate-900 hover:bg-slate-700 dark:hover:bg-slate-800 text-white border border-slate-700 rounded-md transition-colors font-semibold shadow-sm h-10 w-full sm:w-auto"
            >
              <Activity size={18} className="text-blue-400" />
              Auditoria
            </Link>
            
            {/* O TEU NOVO BOTÃO DE RENTABILIDADE VEM AQUI! */}
            <RegistarSobrasModal materiais={materiais} obras={obras} />

            <ImportarExcelModal />
            <NovoMaterialForm />
          </div>
        )}
      </div>

      <InventarioTable 
        materiaisIniciais={materiais} 
        obrasAtivas={obras}
        userRole={patenteAtual} 
      />
    </div>
  )
}