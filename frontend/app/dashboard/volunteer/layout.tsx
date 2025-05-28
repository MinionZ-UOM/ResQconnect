// frontend/app/dashboard/[role]/layout.tsx
import type React from "react"
import { MainSidebar } from "@/components/main-sidebar"
import { Sidebar, SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import type { UserRole } from "@/lib/types"
import { uiToBackend } from "@/lib/roles"
import { notFound } from "next/navigation"

interface DashboardLayoutProps {
  children: React.ReactNode
  params: Promise<{ role: string }>
}

const backendToUI = Object.fromEntries(
  Object.entries(uiToBackend).map(([ui, backend]) => [backend, ui])
) as Record<string, UserRole>

export default async function DashboardLayout({
  children,
  params,
}: DashboardLayoutProps) {
  const role = "volunteer"
  // hyphens back to underscores
  const backendRole = role.replace(/-/g, "_")
  // validate
  if (!(backendRole in backendToUI)) {
    notFound()
  }

  const userRole = backendToUI[backendRole]
  const userName = `Test ${userRole}`
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      <MainSidebar
        userRole={userRole}
        userName={userName}
        userInitials={userInitials}
      />

      {/* <SidebarInset> */}
        <div className="h-full overflow-auto">{children}</div>
      {/* </SidebarInset>? */}
    </div>
    // <SidebarProvider>
    //   <Sidebar></Sidebar>

    //   <SidebarInset>
    //     {children}
    //   </SidebarInset>
    // </SidebarProvider>
  )
}
