"use client";

import { ThemeProvider } from "next-themes";
import { Inter } from "next/font/google";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider, useAuth  } from "@/hooks/AuthProvider";
import { usePathname } from "next/navigation";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <MaybeSidebar>{children}</MaybeSidebar>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

function MaybeSidebar({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  // While auth state is initializing, render nothing (or a spinner)
  if (loading) return null;

  // If no user, or we're on the public routes ("/" or "/auth/login"), don't show sidebar
  const isOnLoginPage = pathname === "/" || pathname.startsWith("/auth/login") || pathname.startsWith("/auth/signup") || pathname.startsWith("/auth/forgot-password");
  if (!user || isOnLoginPage) {
    return <>{children}</>;
  }

  // Otherwise user is logged in and not on a public page—show the sidebar
  return <SidebarProvider>{children}</SidebarProvider>;
}