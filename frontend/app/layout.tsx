"use client"                    // ← now this is a client component
import React from "react"
import { useTheme, ThemeProvider } from "next-themes"
import { Inter } from "next/font/google"
import { SidebarProvider } from "@/components/ui/sidebar"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { theme, resolvedTheme } = useTheme()
  // decide which class to apply
  const htmlClass = theme === "system" ? resolvedTheme : theme
  // match CSS color-scheme
  const colorScheme = htmlClass === "dark" ? "dark" : "light"

  return (
    <html
      lang="en"
      className={htmlClass}
      style={{ colorScheme }}
    >
      <head />  
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>{children}</SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
