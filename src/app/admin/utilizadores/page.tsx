import { PrismaClient } from "@prisma/client"
import { ShieldCheck } from "lucide-react"
import GestaoUtilizadores from "@/components/GestaoUtilizadores"

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export default async function UtilizadoresPage() {
  // Vai buscar toda a malta que tem chave do sistema
  const utilizadores = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="p-8 w-full max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <ShieldCheck className="text-purple-500" size={32} />
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Gestão de Acessos</h1>
          <p className="text-slate-400 mt-1">Controla quem pode entrar no sistema e o seu nível de permissões.</p>
        </div>
      </div>

      <GestaoUtilizadores utilizadores={utilizadores} />
    </div>
  )
}