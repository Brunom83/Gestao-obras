"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"

export default function EliminarObraBotao({ obraId, nomeObra }: { obraId: string, nomeObra: string }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    // A confirmação dupla para evitar acidentes na pista!
    if (!confirm(`Atenção a fundo: Queres mesmo eliminar a obra "${nomeObra}"? Todo o histórico vai ser desintegrado do servidor HP!`)) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/obras/${obraId}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/admin/obras')
        router.refresh()
      } else {
        alert("Erro ao eliminar a obra.")
        setIsDeleting(false)
      }
    } catch (error) {
      alert("Falha de comunicação com a centralina.")
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 px-4 py-2.5 rounded-lg transition-colors border border-red-500/30 font-medium disabled:opacity-50"
    >
      <Trash2 size={18} />
      <span className="hidden sm:inline">{isDeleting ? "A apagar..." : "Eliminar Obra"}</span>
    </button>
  )
}