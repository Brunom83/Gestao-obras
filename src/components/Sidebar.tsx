"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { LayoutDashboard, HardHat, Package, Clock, Users, ShieldCheck, LogOut, Lock } from "lucide-react"

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  
  // Leitura do perfil do utilizador (fallback para USER por segurança)
  const userRole = (session?.user as any)?.role || "USER"
  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`)

  // Configuração centralizada de acessos
  const menuItens = [
    { nome: "Painel Central", path: "/admin/overview", icon: LayoutDashboard, rolesPermitidos: ["MASTER", "SUPERADMIN"] },
    { nome: "Gestão de Obras", path: "/admin/obras", icon: HardHat, rolesPermitidos: ["MASTER", "SUPERADMIN", "ADMIN"] },
    { nome: "Armazém / Stock", path: "/admin/inventario", icon: Package, rolesPermitidos: ["MASTER", "SUPERADMIN", "ADMIN", "USER"] },
    { nome: "Recursos Humanos", path: "/admin/funcionarios", icon: Users, rolesPermitidos: ["MASTER", "SUPERADMIN", "ADMIN"] },
    { nome: "Registo de Horas", path: "/admin/horas", icon: Clock, rolesPermitidos: ["MASTER", "SUPERADMIN", "ADMIN", "USER"] },
    { nome: "Gestão de Acessos", path: "/admin/utilizadores", icon: ShieldCheck, rolesPermitidos: ["MASTER", "SUPERADMIN"] },
  ]

  // Definição da cor do indicador de perfil
  const roleColor = 
    userRole === 'MASTER' ? 'bg-red-500' : 
    userRole === 'SUPERADMIN' ? 'bg-purple-500' : 
    userRole === 'ADMIN' ? 'bg-blue-500' : 'bg-green-500'

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <HardHat className="text-blue-500" />
          <span>Gestão Obras</span>
        </h1>
        <p className="text-xs text-slate-500 mt-2 flex items-center gap-2 font-medium">
          <span className={`w-2 h-2 rounded-full ${roleColor}`}></span>
          Perfil: {userRole}
        </p>
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
        {menuItens.map((item) => {
          const isPermitido = item.rolesPermitidos.includes(userRole)
          const isAtivo = isActive(item.path)
          const Icone = item.icon

          if (!isPermitido) {
            // Renderiza o link inativo com cadeado
            return (
              <div key={item.path} className="flex items-center justify-between px-4 py-3 rounded-lg text-slate-600 bg-slate-900/50 cursor-not-allowed border border-transparent select-none">
                <div className="flex items-center gap-3 font-medium">
                  <Icone size={20} className="opacity-40" />
                  {item.nome}
                </div>
                <Lock size={14} className="opacity-40" />
              </div>
            )
          }

          // Renderiza o link ativo e funcional
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors border ${
                isAtivo 
                  ? 'bg-blue-600 text-white border-blue-500' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border-transparent'
              }`}
            >
              <Icone size={20} />
              {item.nome}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg font-medium transition-colors"
        >
          <LogOut size={20} /> Sair do Sistema
        </button>
      </div>
    </aside>
  )
}