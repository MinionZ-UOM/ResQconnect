"use client"

import { useState } from "react"
import { Doughnut } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import type { User, UserRole } from "@/lib/types"

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend)

interface UserStatsProps {
  disasterId?: string
}

export function UserStats({ disasterId }: UserStatsProps) {
  const [view, setView] = useState<"chart" | "table">("chart")
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<UserRole | "All">("All")

  // Mock users data - in a real app, this would come from an API
  const mockUsers: User[] = [
    {
      id: "user-101",
      name: "John Smith",
      email: "john.smith@example.com",
      role: "Responder",
      skills: ["Medical", "Search and Rescue"],
      availability: true,
      location: { latitude: 38.5816, longitude: -121.4944 },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
    },
    {
      id: "user-102",
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      role: "Responder",
      skills: ["Firefighting", "First Aid"],
      availability: true,
      location: { latitude: 38.5816, longitude: -121.4944 },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25), // 25 days ago
    },
    {
      id: "user-103",
      name: "Michael Brown",
      email: "michael.brown@example.com",
      role: "Volunteer",
      skills: ["Driving", "Communication"],
      availability: true,
      location: { latitude: 38.5816, longitude: -121.4944 },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20), // 20 days ago
    },
    {
      id: "user-104",
      name: "Emily Davis",
      email: "emily.davis@example.com",
      role: "Volunteer",
      skills: ["First Aid", "Cooking"],
      availability: false,
      location: { latitude: 38.5816, longitude: -121.4944 },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15), // 15 days ago
    },
    {
      id: "user-105",
      name: "David Wilson",
      email: "david.wilson@example.com",
      role: "Affected",
      availability: false,
      location: { latitude: 38.5816, longitude: -121.4944 },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
    },
    {
      id: "user-106",
      name: "Lisa Martinez",
      email: "lisa.martinez@example.com",
      role: "Affected",
      availability: false,
      location: { latitude: 38.5816, longitude: -121.4944 },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    },
    {
      id: "user-107",
      name: "Robert Taylor",
      email: "robert.taylor@example.com",
      role: "Admin",
      availability: true,
      location: { latitude: 38.5816, longitude: -121.4944 },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60), // 60 days ago
    },
  ]

  // Filter users based on search query and role filter
  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      searchQuery === "" ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRole = roleFilter === "All" || user.role === roleFilter

    return matchesSearch && matchesRole
  })

  // Count users by role for chart
  const roleCounts = {
    Responder: mockUsers.filter((user) => user.role === "Responder").length,
    Volunteer: mockUsers.filter((user) => user.role === "Volunteer").length,
    Affected: mockUsers.filter((user) => user.role === "Affected").length,
    Admin: mockUsers.filter((user) => user.role === "Admin").length,
  }

  const chartData = {
    labels: Object.keys(roleCounts),
    datasets: [
      {
        data: Object.values(roleCounts),
        backgroundColor: [
          "rgba(239, 68, 68, 0.6)",
          "rgba(16, 185, 129, 0.6)",
          "rgba(59, 130, 246, 0.6)",
          "rgba(139, 92, 246, 0.6)",
        ],
        borderColor: [
          "rgba(239, 68, 68, 1)",
          "rgba(16, 185, 129, 1)",
          "rgba(59, 130, 246, 1)",
          "rgba(139, 92, 246, 1)",
        ],
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
      },
    },
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
        <div className="flex space-x-1 rounded-md bg-slate-100 dark:bg-slate-800 p-1">
          <button
            onClick={() => setView("chart")}
            className={`px-3 py-1.5 text-sm rounded-md ${
              view === "chart" ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Chart
          </button>
          <button
            onClick={() => setView("table")}
            className={`px-3 py-1.5 text-sm rounded-md ${
              view === "table" ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Table
          </button>
        </div>

        {view === "table" && (
          <div className="flex flex-col md:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search users..."
                className="pl-8 w-full md:w-[200px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as UserRole | "All")}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Roles</SelectItem>
                <SelectItem value="Responder">Responders</SelectItem>
                <SelectItem value="Volunteer">Volunteers</SelectItem>
                <SelectItem value="Affected">Affected</SelectItem>
                <SelectItem value="Admin">Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {view === "chart" ? (
        <div className="h-80">
          <Doughnut data={chartData} options={chartOptions} />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        user.role === "Responder"
                          ? "border-red-500 text-red-500"
                          : user.role === "Volunteer"
                            ? "border-green-500 text-green-500"
                            : user.role === "Affected"
                              ? "border-blue-500 text-blue-500"
                              : "border-purple-500 text-purple-500"
                      }
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.skills?.join(", ") || "N/A"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={user.availability ? "default" : "outline"}
                      className={user.availability ? "bg-green-500" : undefined}
                    >
                      {user.availability ? "Available" : "Unavailable"}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
