export { default } from "next-auth/middleware"

export const config = {
  // Bloqueia tudo menos a página de login e ficheiros públicos
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login).*)"],
}