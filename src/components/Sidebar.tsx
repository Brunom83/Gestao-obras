"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { LayoutDashboard, HardHat, Package, Clock, Users, ShieldCheck, LogOut, Lock, Menu, X } from "lucide-react"

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false) // O motor que controla o menu no telemóvel!
  
  const userRole = (session?.user as any)?.role || "USER"
  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`)

  const menuItens = [
    { nome: "Painel Central", path: "/admin/overview", icon: LayoutDashboard, rolesPermitidos: ["MASTER", "SUPERADMIN"] },
    { nome: "Gestão de Obras", path: "/admin/obras", icon: HardHat, rolesPermitidos: ["MASTER", "SUPERADMIN", "ADMIN"] },
    { nome: "Armazém / Stock", path: "/admin/inventario", icon: Package, rolesPermitidos: ["MASTER", "SUPERADMIN", "ADMIN", "USER"] },
    { nome: "Recursos Humanos", path: "/admin/funcionarios", icon: Users, rolesPermitidos: ["MASTER", "SUPERADMIN", "ADMIN"] },
    { nome: "Registo de Horas", path: "/admin/horas", icon: Clock, rolesPermitidos: ["MASTER", "SUPERADMIN", "ADMIN", "USER"] },
    { nome: "Gestão de Acessos", path: "/admin/utilizadores", icon: ShieldCheck, rolesPermitidos: ["MASTER", "SUPERADMIN"] },
  ]

  const roleColor = 
    userRole === 'MASTER' ? 'bg-red-500' : 
    userRole === 'SUPERADMIN' ? 'bg-purple-500' : 
    userRole === 'ADMIN' ? 'bg-blue-500' : 'bg-green-500'

  return (
    <>
      {/* CABEÇALHO MOBILE (Só aparece em telemóveis) */}
      <div className="md:hidden flex items-center justify-between bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-40 shadow-md">
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <HardHat className="text-blue-500" /> ERP PRO
        </h1>
        <button onClick={() => setIsOpen(!isOpen)} className="text-slate-300 hover:text-white transition-colors">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* OVERLAY OBSCURO (Fundo escuro quando o menu está aberto no mobile) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* A SIDEBAR (Fica escondida à esquerda no mobile e visível no desktop) */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0
      `}>
        <div className="p-6 border-b border-slate-800 hidden md:block">
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <HardHat className="text-blue-500" />
            <span>Gestão Obras</span>
          </h1>
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-2 font-medium">
            <span className={`w-2 h-2 rounded-full ${roleColor}`}></span>
            Perfil: {userRole}
          </p>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto mt-4 md:mt-0">
          {menuItens.map((item) => {
            const isPermitido = item.rolesPermitidos.includes(userRole)
            const isAtivo = isActive(item.path)
            const Icone = item.icon

            if (!isPermitido) {
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

            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsOpen(false)} // Fecha o menu automaticamente quando clicas num link!
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
    </>
  )
}