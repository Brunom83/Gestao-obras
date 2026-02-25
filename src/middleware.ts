import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const role = token.role as string;

    // 1. REGRAS DO MASTER E SUPERADMIN
    // Painel financeiro global e gestão de acessos do sistema
    const isSuperAdminRoute = path.startsWith('/admin/overview') || path.startsWith('/admin/utilizadores');
    
    if (isSuperAdminRoute && !['MASTER', 'SUPERADMIN'].includes(role)) {
      return NextResponse.redirect(new URL('/admin/obras', req.url));
    }

    // 2. REGRAS DO ADMIN
    // Gestão de obras e recursos humanos
    const isAdminRoute = path.startsWith('/admin/obras') || path.startsWith('/admin/funcionarios');
    
    if (isAdminRoute && !['MASTER', 'SUPERADMIN', 'ADMIN'].includes(role)) {
      return NextResponse.redirect(new URL('/admin/horas', req.url));
    }

    // 3. REGRAS DO USER
    // O USER tem acesso a /admin/horas (para registo) e /admin/inventario (apenas para requisição).
    // Qualquer tentativa de aceder a outras áreas administrativas já foi bloqueada acima.

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    "/admin/:path*", 
  ],
}