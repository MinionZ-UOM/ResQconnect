"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertTriangle,
  BarChart,
  Bell,
  CheckSquare,
  FileText,
  Home,
  Inbox,
  LogOut,
  Map,
  MessageSquare,
  Package,
  Settings,
  Users,
} from "lucide-react";
import type { UserRole } from "@/lib/types";
import { useAuth } from "@/hooks/AuthProvider";
import { uiToBackend } from "@/lib/roles";

interface MainSidebarProps {
  userRole: UserRole;
  userName: string;
  userInitials: string;
  userAvatar?: string;
  disasterId?: string;
}

export function MainSidebar({
  userRole,
  userName,
  userInitials,
  userAvatar,
  disasterId,
}: MainSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [notifications] = useState(3);

  // derive the slug from backend key, e.g. "first_responder" → "first-responder"
  const backendKey = uiToBackend[userRole];
  const roleSlug = backendKey.replace(/_/g, "-");

  const baseRoutes = [
    {
      title: "Home",
      icon: Home,
      href:
        userRole === "Admin"
          ? "/admin/dashboard"
          : `/dashboard/${roleSlug}`,
    },
  ];

  const roleRoutes = {
    Responder: [
      {
        title: "Tasks",
        href: `/dashboard/${roleSlug}/tasks${disasterId ? `?disasterId=${disasterId}` : ""}`,
        icon: CheckSquare,
      },
      {
        title: "Requests",
        href: `/dashboard/${roleSlug}/requests${disasterId ? `?disasterId=${disasterId}` : ""}`,
        icon: Inbox,
        badge: notifications,
      },
      {
        title: "Map View",
        href: `/dashboard/${roleSlug}/map${disasterId ? `?disasterId=${disasterId}` : ""}`,
        icon: Map,
      },
      {
        title: "Communication",
        href: `/dashboard/${roleSlug}/communication${disasterId ? `?disasterId=${disasterId}` : ""}`,
        icon: MessageSquare,
      },
      {
        title: "Resources",
        href: `/dashboard/${roleSlug}/resources${disasterId ? `?disasterId=${disasterId}` : ""}`,
        icon: Package,
      },
    ],
    Volunteer: [
      {
        title: "My Tasks",
        href: `/dashboard/${roleSlug}/tasks${disasterId ? `?disasterId=${disasterId}` : ""}`,
        icon: CheckSquare,
      },
      {
        title: "Report Observation",
        href: `/dashboard/${roleSlug}/report${disasterId ? `?disasterId=${disasterId}` : ""}`,
        icon: FileText,
      },
      {
        title: "Map View",
        href: `/dashboard/${roleSlug}/map${disasterId ? `?disasterId=${disasterId}` : ""}`,
        icon: Map,
      },
      {
        title: "Communication",
        href: `/dashboard/${roleSlug}/communication${disasterId ? `?disasterId=${disasterId}` : ""}`,
        icon: MessageSquare,
      },
    ],
    Affected: [
      {
        title: "My Requests",
        href: `/dashboard/${roleSlug}/requests${disasterId ? `?disasterId=${disasterId}` : ""}`,
        icon: Inbox,
      },
      {
        title: "New Request",
        href: `/dashboard/${roleSlug}/new-request${disasterId ? `?disasterId=${disasterId}` : ""}`,
        icon: AlertTriangle,
      },
      {
        title: "Map View",
        href: `/dashboard/${roleSlug}/map${disasterId ? `?disasterId=${disasterId}` : ""}`,
        icon: Map,
      },
      {
        title: "Communication",
        href: `/dashboard/${roleSlug}/communication${disasterId ? `?disasterId=${disasterId}` : ""}`,
        icon: MessageSquare,
      },
    ],
    Admin: [
      { title: "Dashboard", href: "/admin/dashboard", icon: BarChart },
      { title: "Disasters", href: "/admin/disasters", icon: AlertTriangle },
      {
        title: "Requests",
        href: "/admin/requests",
        icon: Inbox,
        badge: notifications,
      },
      { title: "Tasks", href: "/admin/tasks", icon: CheckSquare },
      { title: "Resources", href: "/admin/resources", icon: Package },
      { title: "Users", href: "/admin/users", icon: Users },
      { title: "Alerts", href: "/admin/alerts", icon: Bell },
      {
        title: "Communication",
        href: "/admin/communication",
        icon: MessageSquare,
      },
      { title: "Settings", href: "/admin/settings", icon: Settings },
    ],
  } as const;

  const routes = [...baseRoutes, ...(roleRoutes[userRole] || [])];

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

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
            <SidebarMenuItem key={`${route.href}-${route.title}`}>
              <SidebarMenuButton
                asChild
                isActive={pathname === route.href}
                tooltip={route.title}
              >
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
            <span className="text-xs text-muted-foreground capitalize">
              {userRole}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={handleLogout}
            title="Sign out"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
