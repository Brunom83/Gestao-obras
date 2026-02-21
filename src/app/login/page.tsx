"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (res?.error) {
      setError("Acesso negado. Credenciais inválidas.")
    } else {
      router.push("/") // Vai para a Home que fará o redirecionamento por Role
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
      <form onSubmit={handleSubmit} className="w-full max-w-md p-8 bg-slate-800 rounded-lg shadow-xl">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-400">Gestão de Obras</h1>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        <div className="space-y-4">
          <input 
            type="email" placeholder="Email" value={email} 
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:border-blue-500"
            required
          />
          <input 
            type="password" placeholder="Password" value={password} 
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:border-blue-500"
            required
          />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 p-3 rounded font-bold transition">
            Entrar
          </button>
        </div>
      </form>
    </div>
  )
}