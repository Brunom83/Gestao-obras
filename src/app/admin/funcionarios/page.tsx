import { PrismaClient } from "@prisma/client"
import { Users } from "lucide-react"
import GestaoFuncionarios from "@/components/GestaoFuncionarios"

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export default async function FuncionariosPage() {
  // O servidor vai buscar a lista de pessoal antes de desenhar a página
  const funcionarios = await prisma.funcionario.findMany({
    orderBy: { nome: 'asc' }
  })

  return (
    <div className="p-8 w-full max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3 mb-8">
        <Users className="text-blue-500" size={32} />
        <h1 className="text-3xl font-bold text-slate-100">Recursos Humanos</h1>
      </div>

      {/* Renderiza o componente interativo */}
      <GestaoFuncionarios funcionariosIniciais={funcionarios} />
    </div>
  )
}