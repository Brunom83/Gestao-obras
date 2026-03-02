import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import AuthProvider from "@/components/AuthProvider"
import { Toaster } from "react-hot-toast"
import { ThemeProvider } from "@/components/ThemeProvider" // <-- ADICIONA ISTO

// Carrega o pneu (fonte) base para todo o projeto
const inter = Inter({ subsets: ["latin"] })

// As informações de SEO e título da aba do browser
export const metadata: Metadata = {
  title: "Gestão de Obras | ERP",
  description: "Sistema interno de gestão de obras, stock e RH.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // ADICIONA suppressHydrationWarning À TAG HTML!
    <html lang="pt" suppressHydrationWarning> 
      <body className={`${inter.className} bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300`}>
        <AuthProvider>
          <ThemeProvider> {/* <-- ENVOLVE O CHILDREN AQUI */}
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}