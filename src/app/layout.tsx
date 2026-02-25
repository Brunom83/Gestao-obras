import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import AuthProvider from "@/components/AuthProvider"
import { Toaster } from "react-hot-toast"

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
      <body className={`${inter.className} bg-slate-900 text-slate-100 min-h-screen flex flex-col`}>
        {/* Provedor de Notificações */}
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        {/* A nossa Antena Transmissora de Sessão */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}