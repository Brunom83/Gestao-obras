"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Esta é a peça mágica que diz ao TypeScript: "Aceita as props todas do next-themes!"
type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}