import { PrismaClient } from "@prisma/client"
import { Users } from "lucide-react"
import GestaoFuncionarios from "@/components/GestaoFuncionarios"

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export default async function FuncionariosPage() {
  // Busca a malta e "puxa" o cargo associado a eles para podermos mostrar a cor e o nome na tabela
  const funcionarios = await prisma.funcionario.findMany({
    orderBy: { nome: 'asc' },
    include: { cargo: true } // O include mágico que vai buscar os dados da tabela relacionada!
  })

  // Busca todas as caixas do organograma que injetámos com o Seed
  const cargosOrganograma = await prisma.cargoOrganograma.findMany({
    orderBy: [
      { departamento: 'asc' },
      { subDepartamento: 'asc' },
      { nome: 'asc' }
    ]
  })

  return (
    <div className="p-8 w-full max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Users className="text-blue-500" size={32} />
        <h1 className="text-3xl font-bold text-slate-100">Recursos Humanos</h1>
      </div>

      {/* Passamos as duas listas para o motor interativo */}
      <GestaoFuncionarios 
        funcionariosIniciais={funcionarios} 
        listaCargos={cargosOrganograma} 
      />
    </div>
  )
}