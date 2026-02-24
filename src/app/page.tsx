import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  // 1. Não tem o Accelecharger (sessão)? Vai para a garagem fazer o Login.
  if (!session) {
    redirect("/login")
  }

  // 2. Tem chave na ignição? Manda direto para o Cockpit principal.
  // (A nossa Rota 1 é que vai tratar de esconder os botões lá dentro consoante o cargo)
  redirect("/admin/overview")
}