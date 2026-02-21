"use client"

import { signOut } from "next-auth/react"

export default function AdminOverview() {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-700">
        <h1 className="text-3xl font-bold text-blue-400 mb-4">Painel de Controlo (SuperAdmin)</h1>
        <p className="text-slate-300 mb-8">
          Bem-vindo ao Gestão de Obras, Vicius. O teu SuperAdmin de permissões está ativo.
          Aqui terás a visão geral de todas as obras, inventário e gestão de pessoal.
        </p>
        
        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded transition"
        >
          Sair (Logout)
        </button>
      </div>
    </div>
  )
}