import type React from "react"
import { MainSidebar } from "@/components/main-sidebar"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {

  const userRole = "Admin"
  const userName = "Admin User"
  const userInitials = "AU"

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-900">

      <div className="w-64 flex-shrink-0 overflow-y-auto border-r border-slate-200 dark:border-slate-700">
        <MainSidebar userRole={userRole} userName={userName} userInitials={userInitials} />
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="h-full w-full overflow-auto p-6">{children}</div>
      </div>
    </div>
  )
}
