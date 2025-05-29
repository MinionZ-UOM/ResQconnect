"use client"

import { useEffect, useState } from "react"
import { Doughnut } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { db } from "@/lib/firebaseClient"
import { collection, getDoc, getDocs, doc } from "firebase/firestore"
import type { User, UserRole } from "@/lib/types"

ChartJS.register(ArcElement, Tooltip, Legend)

interface UserStatsProps {
  disasterId?: string
}

const roleMap: Record<string, UserRole> = {
  affected_individual: "Affected",
  volunteer: "Volunteer",
  first_responder: "Responder",
  admin: "Admin",
}

export function UserStats({ disasterId }: UserStatsProps) {
  const [view, setView] = useState<"chart" | "table">("chart")
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<UserRole | "All">("All")
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        let participantUids: string[] = []

        if (disasterId && disasterId !== "all") {
          const disasterRef = doc(db, "disasters", disasterId)
          const participantsSnap = await getDocs(collection(disasterRef, "participants"))
          participantUids = participantsSnap.docs.map((doc) => doc.id)
        } else {
          const usersSnap = await getDocs(collection(db, "users"))
          participantUids = usersSnap.docs.map((doc) => doc.id)
        }

        const userPromises = participantUids.map(async (uid) => {
          const userSnap = await getDoc(doc(db, "users", uid))
          if (!userSnap.exists()) return null

          const userData = userSnap.data()
          const roleKey = userData.role_id
          const mappedRole = roleMap[roleKey] || "Affected"

          return {
            id: uid,
            name: userData.display_name ?? "Unnamed",
            email: userData.email ?? "",
            role: mappedRole,
            skills: userData.skills ?? [],
            availability: userData.availability ?? false,
            location: userData.location,
            createdAt: userData.created_at?.toDate?.() ?? new Date(),
          } satisfies User
        })

        const usersList = (await Promise.all(userPromises)).filter(Boolean) as User[]
        //console.log("Fetched Users:", usersList)
        setUsers(usersList)
      } catch (error) {
        console.error("Error fetching users:", error)
      }
    }

    fetchUsers()
  }, [disasterId])

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchQuery === "" ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRole = roleFilter === "All" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const roleCounts = {
    Responder: users.filter((u) => u.role === "Responder").length,
    Volunteer: users.filter((u) => u.role === "Volunteer").length,
    Affected: users.filter((u) => u.role === "Affected").length,
    Admin: users.filter((u) => u.role === "Admin").length,
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
      legend: { position: "right" as const },
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
            <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as UserRole | "All")}>
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
                <TableHead>Availability</TableHead>
                <TableHead>Registered</TableHead>
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
                  <TableCell>
                    <Badge
                      variant={user.availability ? "default" : "outline"}
                      className={user.availability ? "bg-green-500" : undefined}
                    >
                      {user.availability ? "Available" : "Unavailable"}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
