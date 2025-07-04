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
    <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-900">

      <div>
        <MainSidebar userRole={userRole} userName={userName} userInitials={userInitials} />
      </div>

      <div className="flex-1 overflow-auto p-6">
        {children}
      </div>
    </div>
  )
}
