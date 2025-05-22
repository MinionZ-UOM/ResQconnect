"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Home,
  Map,
  MessageSquare,
  Package,
  Settings,
  Users,
  LogOut,
  AlertTriangle,
  Inbox,
  Bell,
  CheckSquare,
  FileText,
  BarChart,
} from "lucide-react"
import type { UserRole } from "@/lib/types"

interface MainSidebarProps {
  userRole: UserRole
  userName: string
  userInitials: string
  userAvatar?: string
  disasterId?: string
}

export function MainSidebar({ userRole, userName, userInitials, userAvatar, disasterId }: MainSidebarProps) {
  const pathname = usePathname()
  const [notifications, setNotifications] = useState(3)

  // Base routes for all users
  const baseRoutes = [
    {
      title: "Home",
      href: userRole === "Admin" ? "/admin/dashboard" : `/dashboard/${userRole.toLowerCase()}`,
      icon: Home,
    },
  ]

  // Role-specific routes
  const roleRoutes = {
    Responder: [
      {
        title: "Tasks",
        href: `/dashboard/responder/tasks${disasterId ? `?disasterId=${disasterId}` : ""}`,
        icon: CheckSquare,
      },
      {
        title: "Requests",
        href: `/dashboard/responder/requests${disasterId ? `?disasterId=${disasterId}` : ""}`,
        icon: Inbox,
        badge: notifications,
      },
      {
        title: "Map View",
        href: `/dashboard/responder/map${disasterId ? `?disasterId=${disasterId}` : ""}`,
        icon: Map,
      },
      {
        title: "Communication",
        href: `/dashboard/responder/communication${disasterId ? `?disasterId=${disasterId}` : ""}`,
        icon: MessageSquare,
      },
      {
        title: "Resources",
        href: `/dashboard/responder/resources${disasterId ? `?disasterId=${disasterId}` : ""}`,
        icon: Package,
      },
    ],
    Volunteer: [
      {
        title: "My Tasks",
        href: `/dashboard/volunteer/tasks${disasterId ? `?disasterId=${disasterId}` : ""}`,
        icon: CheckSquare,
      },
      {
        title: "Report Observation",
        href: `/dashboard/volunteer/report${disasterId ? `?disasterId=${disasterId}` : ""}`,
        icon: FileText,
      },
      {
        title: "Map View",
        href: `/dashboard/volunteer/map${disasterId ? `?disasterId=${disasterId}` : ""}`,
        icon: Map,
      },
      {
        title: "Communication",
        href: `/dashboard/volunteer/communication${disasterId ? `?disasterId=${disasterId}` : ""}`,
        icon: MessageSquare,
      },
    ],
    Affected: [
      {
        title: "My Requests",
        href: `/dashboard/affected/requests${disasterId ? `?disasterId=${disasterId}` : ""}`,
        icon: Inbox,
      },
      {
        title: "New Request",
        href: `/dashboard/affected/new-request${disasterId ? `?disasterId=${disasterId}` : ""}`,
        icon: AlertTriangle,
      },
      {
        title: "Map View",
        href: `/dashboard/affected/map${disasterId ? `?disasterId=${disasterId}` : ""}`,
        icon: Map,
      },
      {
        title: "Communication",
        href: `/dashboard/affected/communication${disasterId ? `?disasterId=${disasterId}` : ""}`,
        icon: MessageSquare,
      },
    ],
    Admin: [
      {
        title: "Dashboard",
        href: "/admin/dashboard",
        icon: BarChart,
      },
      {
        title: "Disasters",
        href: "/admin/disasters",
        icon: AlertTriangle,
      },
      {
        title: "Requests",
        href: "/admin/requests",
        icon: Inbox,
        badge: notifications,
      },
      {
        title: "Tasks",
        href: "/admin/tasks",
        icon: CheckSquare,
      },
      {
        title: "Resources",
        href: "/admin/resources",
        icon: Package,
      },
      {
        title: "Users",
        href: "/admin/users",
        icon: Users,
      },
      {
        title: "Alerts",
        href: "/admin/alerts",
        icon: Bell,
      },
      {
        title: "Communication",
        href: "/admin/communication",
        icon: MessageSquare,
      },
      {
        title: "Settings",
        href: "/admin/settings",
        icon: Settings,
      },
    ],
  }

  const routes = [...baseRoutes, ...(roleRoutes[userRole] || [])]

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center px-2 py-3">
          <div className="flex items-center gap-2 font-semibold text-lg text-blue-700 dark:text-blue-400">
            <AlertTriangle className="h-6 w-6" />
            <span>ResQConnect</span>
          </div>
          <div className="ml-auto md:hidden">
            <SidebarTrigger />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {routes.map((route) => (
            <SidebarMenuItem key={route.href}>
              <SidebarMenuButton asChild isActive={pathname === route.href} tooltip={route.title}>
                <Link href={route.href}>
                  <route.icon className="h-5 w-5" />
                  <span>{route.title}</span>
                </Link>
              </SidebarMenuButton>
              {route.badge && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-medium text-white">
                  {route.badge}
                </div>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <div className="flex items-center gap-2 p-4">
          <Avatar>
            <AvatarImage src={userAvatar || "/placeholder.svg"} alt={userName} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{userName}</span>
            <span className="text-xs text-muted-foreground capitalize">{userRole}</span>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto" asChild>
            <Link href="/">
              <LogOut className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
