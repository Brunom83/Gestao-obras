import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "react-hot-toast"; // A NOSSA ANTENA

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gestão de Obras",
  description: "Sistema de gestão para a empresa TEKU",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors`}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {/* ANTENA LIGADA DIRETO NO CHASSI, SEM SIDEBAR AQUI! */}
            <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}