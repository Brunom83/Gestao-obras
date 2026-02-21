import Sidebar from "@/components/Sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* A nossa Sidebar à esquerda */}
      <Sidebar />
      
      {/* A pista principal onde as páginas vão correr (o conteúdo muda aqui) */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}