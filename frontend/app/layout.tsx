// app/layout.tsx
"use client";

import { ThemeProvider } from "next-themes";
import { Inter } from "next/font/google";
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { AuthProvider, useAuth } from "@/hooks/AuthProvider";
import { usePathname } from "next/navigation";
import "./globals.css";

import { useEffect } from "react";
import { getQueue, clearQueue, QueuedRequest } from "@/lib/offlineQueue";
import { callApi } from "@/lib/api";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Attempt to replay queued requests on reconnection
    const syncQueued = async () => {
      if (!navigator.onLine) return;
      const queue: QueuedRequest[] = await getQueue();
      if (!queue.length) return;

      for (const req of queue) {
        try {
          await callApi(req.url, req.method as any, req.payload);
        } catch (err) {
          console.error("Failed to sync request:", req, err);
          // stop on first failure; we’ll retry next online event
          return;
        }
      }
      await clearQueue();
      console.log("✅ Offline observations synced.");
    };

    window.addEventListener("online", syncQueued);

    // Also try once on mount if we’re already online
    if (navigator.onLine) syncQueued();

    return () => {
      window.removeEventListener("online", syncQueued);
    };
  }, []);

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
  const isPublicRoute = !user || pathname === "/" || pathname.startsWith("/auth/login") || pathname.startsWith("/auth/signup");
  
    if (isPublicRoute) {
    return <>{children}</>;
  }

  // Otherwise user is logged in and not on a public page—show the sidebar
  return (
    <SidebarProvider>
      <Sidebar></Sidebar>

      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
