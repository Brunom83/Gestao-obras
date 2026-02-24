"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { LayoutDashboard, HardHat, Package, Users, LogOut, ShieldCheck, Clock } from "lucide-react"

export default function Sidebar() {
  const pathname = usePathname()
  
  // O Accelecharger de leitura de sessão no Frontend
  const { data: session } = useSession()
  const userRole = (session?.user as any)?.role || "USER"

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`)

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <HardHat className="text-blue-500" />
          <span>Gestão Obras</span>
        </h1>
        {/* Mostra quem está logado e a sua patente */}
        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${userRole === 'SUPERADMIN' ? 'bg-purple-500' : userRole === 'ADMIN' ? 'bg-blue-500' : 'bg-green-500'}`}></span>
          Logado como: {userRole}
        </p>
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
        <Link 
          href="/admin/overview" 
          className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/admin/overview') ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
        >
          <LayoutDashboard size={20} /> Painel Central
        </Link>

        <Link 
          href="/admin/obras" 
          className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/admin/obras') ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
        >
          <HardHat size={20} /> Obras Ativas
        </Link>

        <Link 
          href="/admin/inventario" 
          className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/admin/inventario') ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
        >
          <Package size={20} /> Armazém / Stock
        </Link>

        {/* CAMUFLAGEM DOS SILENCERZ: Só ADMIN e SUPERADMIN veem os Recursos Humanos */}
        {(userRole === 'ADMIN' || userRole === 'SUPERADMIN') && (
          <Link 
            href="/admin/funcionarios" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/admin/funcionarios') ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
          >
            <Users size={20} /> Recursos Humanos
          </Link>
        )}

        
      {/* Via rápida para os Chefes de Equipas lançarem as horas */}
        <Link 
          href="/admin/horas" 
          className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/admin/horas') ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
        >
          <Clock size={20} /> Registo de Horas
        </Link>

        {/* CAMUFLAGEM NÍVEL MÁXIMO: Só o SUPERADMIN vê a Gestão de Acessos */}
        {userRole === 'SUPERADMIN' && (
          <Link 
            href="/admin/utilizadores" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/admin/utilizadores') ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
          >
            <ShieldCheck size={20} /> Gestão de Acessos
          </Link>
        )}
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