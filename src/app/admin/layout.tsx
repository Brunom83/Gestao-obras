import Sidebar from "@/components/Sidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    // No telemóvel (flex-col) o conteúdo fica por baixo do Header. No Desktop (md:flex-row) fica ao lado!
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-900">
      <Sidebar />
      {/* w-full garante que num telemóvel o formulário ocupa a tela toda sem vazar para os lados */}
      <main className="flex-1 w-full max-w-[100vw] overflow-x-hidden p-4 md:p-8">
        {children}
      </main>
    </div>
  )
}