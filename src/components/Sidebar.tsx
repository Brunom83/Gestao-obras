"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, HardHat, Package, Users, Clock, LogOut } from "lucide-react"

export default function Sidebar() {
  const pathname = usePathname()

  // Função para saber se o link está ativo e mudar a cor
  const isActive = (path: string) => pathname.startsWith(path)

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 h-screen flex flex-col sticky top-0">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold text-blue-500 flex items-center gap-2">
          <HardHat size={24} />
          Gestão Obras
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <Link 
          href="/admin/overview" 
          className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/admin/overview') ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
        >
          <LayoutDashboard size={20} /> Painel de Controlo
        </Link>
        
        <Link 
          href="/admin/obras" 
          className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/admin/obras') ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
        >
          <HardHat size={20} /> Gestão de Obras
        </Link>

        <Link 
          href="/admin/inventario" 
          className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/admin/inventario') ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
        >
          <Package size={20} /> Inventário
        </Link>

        {/* Agrupamos o pessoal todo aqui */}
        <Link 
          href="/admin/funcionarios" 
          className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/admin/funcionarios') ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
        >
          <Users size={20} /> Recursos Humanos
        </Link>

        {/* Link preparado para o futuro ecrã de relatórios mensais */}
        <Link 
          href="/admin/horas" 
          className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/admin/horas') ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
        >
          <Clock size={20} /> Relatório de Horas
        </Link>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg font-medium transition-colors">
          <LogOut size={20} /> Sair do Sistema
        </button>
      </div>
    </div>
  )
}