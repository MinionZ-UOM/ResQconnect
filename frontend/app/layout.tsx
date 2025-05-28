// app/layout.tsx
"use client";

import { ThemeProvider } from "next-themes";
import { Inter } from "next/font/google";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/hooks/AuthProvider";
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
            <SidebarProvider>{children}</SidebarProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
