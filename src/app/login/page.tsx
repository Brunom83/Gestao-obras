"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { HardHat, Lock, Mail, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [lembrar, setLembrar] = useState(false)
  const [erro, setErro] = useState("")
  const [loading, setLoading] = useState(false)

  // Assim que a página carrega, o motor verifica se há um email guardado na garagem
  useEffect(() => {
    const emailGuardado = localStorage.getItem("gestao_obras_email")
    if (emailGuardado) {
      setEmail(emailGuardado)
      setLembrar(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErro("")

    // Sistema de memória: se a caixa estiver picada, grava o email no navegador do PC local
    if (lembrar) {
      localStorage.setItem("gestao_obras_email", email)
    } else {
      localStorage.removeItem("gestao_obras_email")
    }

    // Dispara a ignição para o servidor HP (.130)
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    })

    if (res?.error) {
      setErro("Credenciais inválidas. Tenta novamente.")
      setLoading(false)
    } else {
      // Se o Nitrox ativar, redireciona para o Painel de Controlo
      router.push("/admin/overview")
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[url('/grid.svg')] bg-center">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-blue-600 p-4 rounded-full shadow-lg shadow-blue-500/20">
            <HardHat size={40} className="text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-100">
          Gestão de Obras
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Painel de Administração Restrito
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 py-8 px-4 shadow-2xl sm:rounded-xl sm:px-10 border border-slate-800">
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Mensagem de Erro */}
            {erro && (
              <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle size={18} />
                <p>{erro}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300">
                Email Profissional
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 bg-slate-800 border border-slate-700 rounded-lg py-3 text-slate-200 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                  placeholder="...@empresa.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">
                Palavra-passe
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 bg-slate-800 border border-slate-700 rounded-lg py-3 text-slate-200 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="lembrar_me"
                  name="lembrar_me"
                  type="checkbox"
                  checked={lembrar}
                  onChange={(e) => setLembrar(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-700 rounded bg-slate-800"
                />
                <label htmlFor="lembrar_me" className="ml-2 block text-sm text-slate-400">
                  Lembrar o meu email
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "A verificar credenciais..." : "Entrar no Sistema"}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  )
}