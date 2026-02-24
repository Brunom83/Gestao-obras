import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import AuthProvider from "@/components/AuthProvider"

// Carrega o pneu (fonte) base para todo o projeto
const inter = Inter({ subsets: ["latin"] })

// As informações de SEO e título da aba do browser
export const metadata: Metadata = {
  title: "Gestão de Obras | ERP",
  description: "Sistema interno de gestão de obras, stock e RH.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt">
      <body className={inter.className}>
        {/* A nossa Antena Transmissora de Sessão */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}