import { PrismaClient } from "@prisma/client"
import { ClipboardCheck, ShieldAlert } from "lucide-react"
import PainelAprovacoes from "@/components/PainelAprovacoes"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

const prisma = new PrismaClient()
export const dynamic = 'force-dynamic'

export default async function AprovacoesPage() {
  // 1. O Radar de Identificação
  const session = await getServerSession(authOptions)
  const userEmail = session?.user?.email

  if (!userEmail) redirect("/login")

  // 2. Busca o condutor atual E a sua etiqueta do organograma
  const currentUser = await prisma.user.findUnique({
    where: { email: userEmail },
    include: { cargo: true } // O include mágico que puxa a etiqueta!
  })

  // 3. A REGRA DE OURO DOS TEKU: Quem fica à porta?
  // - O Coordenador de Soldadura
  // - Qualquer pessoa do Departamento de Compras
  // - O pessoal de estaleiro (Role USER)
  const isBlocked = currentUser?.cargo?.nome === "Coordenador Soldadura" || 
                    currentUser?.cargo?.departamento === "Compras" ||
                    currentUser?.role === "USER"

  // Se o utilizador estiver bloqueado (e não for o MASTER), mostramos o ecrã de alta segurança
  if (isBlocked && currentUser?.role !== "MASTER") {
    return (
      <div className="p-8 w-full max-w-7xl mx-auto flex flex-col items-center justify-center h-[60vh] text-center">
        <ShieldAlert size={80} className="text-red-500 mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
        <h1 className="text-3xl font-bold text-slate-100 mb-3">Acesso Restrito</h1>
        <p className="text-slate-400 max-w-md">
          O teu perfil ({currentUser?.cargo?.nome || "Sem Etiqueta"}) não tem autorização para visualizar ou aprovar requisições de armazém.
        </p>
      </div>
    )
  }

  // 4. Se passou o bloqueio, o motor arranca e carrega os tickets todos!
  const pedidos = await prisma.pedidoMaterial.findMany({
    include: {
      obra: true,
      material: true,
      requisitante: true,
      aprovador: true
    },
    orderBy: { dataPedido: 'desc' }
  })

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <ClipboardCheck className="text-blue-500" size={32} />
        <h1 className="text-3xl font-bold text-slate-100">Torre de Controlo</h1>
      </div>

      {/* 5. A PONTE: Passamos a Role e o Cargo limpos para o ecrã frontal */}
      <PainelAprovacoes 
        ticketsIniciais={pedidos} 
        userRole={currentUser?.role || "USER"}
        userCargo={currentUser?.cargo?.nome || ""}
      />
    </div>
  )
}