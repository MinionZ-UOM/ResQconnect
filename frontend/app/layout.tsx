"use client";

import { ThemeProvider } from "next-themes";
import { Inter } from "next/font/google";
import { SidebarProvider, Sidebar } from "@/components/ui/sidebar";
import { AuthProvider, useAuth } from "@/hooks/AuthProvider";
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
            <SidebarProvider>
              <WithOptionalSidebar>{children}</WithOptionalSidebar>
            </SidebarProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

function WithOptionalSidebar({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  // While auth state is initializing, render nothing (or a spinner)
  if (loading) return null;

  // If no user, or we're on the public routes ("/" or "/auth/login or "/auth/signup"), don't show sidebar
  const isPublicRoute = !user || pathname === "/" || pathname.startsWith("/auth/login");
  
    if (isPublicRoute) {
    return <>{children}</>;
  }

  // Otherwise user is logged in and not on a public page—show the sidebar
  return (
    <SidebarProvider>
      <Sidebar>{children}</Sidebar>
    </SidebarProvider>
  );
}
