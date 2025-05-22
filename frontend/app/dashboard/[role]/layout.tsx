import type React from "react"
import { MainSidebar } from "@/components/main-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import type { UserRole } from "@/lib/types"
import { notFound } from "next/navigation"

interface DashboardLayoutProps {
  children: React.ReactNode
  params: {
    role: string
  }
}

export default function DashboardLayout({ children, params }: DashboardLayoutProps) {
  // Validate role
  const validRoles = ["responder", "volunteer", "affected"]
  if (!validRoles.includes(params.role)) {
    notFound()
  }

  // Mock user data - in a real app, this would come from authentication
  const userRole = (params.role.charAt(0).toUpperCase() + params.role.slice(1)) as UserRole
  const userName = `Test ${userRole}`
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      <MainSidebar userRole={userRole} userName={userName} userInitials={userInitials} />

      <SidebarInset>
        <div className="h-full overflow-auto">{children}</div>
      </SidebarInset>
    </div>
  )
}
