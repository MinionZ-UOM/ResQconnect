"use client"

import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebaseClient"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { RequestsOverview } from "@/components/dashboard/requests-overview"
// import { ResourcesOverview } from "@/components/dashboard/resources-overview"
import { MetricsDisplay } from "@/components/dashboard/metrics-display"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { AlertsPanel } from "@/components/dashboard/alerts-panel"
import { UserStats } from "@/components/dashboard/user-stats"
// import { TasksOverview } from "@/components/dashboard/tasks-overview"
import type { Disaster } from "@/lib/types"

export default function AdminDashboardPage() {
  const [disasters, setDisasters] = useState<Disaster[]>([])
  const [selectedDisaster, setSelectedDisaster] = useState<string>("all")

  useEffect(() => {
    async function fetchDisasters() {
      const snapshot = await getDocs(collection(db, "disasters"))
      const result: Disaster[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Disaster, "id">),
      }))
      setDisasters(result)
    }

    fetchDisasters()
  }, [])

  const currentDisaster = disasters.find((d) => d.id === selectedDisaster)

  return (
    <div className="fixed inset-0 py-3 md:left-64 md:right-0 overflow-auto px-4 md:px-6">
      <header>
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="mb-6 ml-8 md:ml-0">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200 md:text-3xl">
              Admin Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {selectedDisaster === "all"
                ? "Overview of all disaster response activities"
                : `Overview of ${currentDisaster?.name || "Selected Disaster"} response activities`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={selectedDisaster} onValueChange={setSelectedDisaster}>
              <SelectTrigger className="w-[180px] md:w-[240px]">
                <SelectValue placeholder="Select disaster" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Disasters</SelectItem>
                {disasters.map((disaster) => (
                  <SelectItem key={disaster.id} value={disaster.id}>
                    {disaster.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button asChild>
              <a href="/admin/disasters">Register New Disaster</a>
            </Button>
          </div>
        </div>
      </header>

      {/* ... Keep rest of your dashboard cards and tabs unchanged ... */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Active Requests</CardTitle>
            <CardDescription>Pending assistance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {selectedDisaster === "all" ? 42 : 24}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              <span className="text-green-500 dark:text-green-400">↑ 12%</span> from yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Available Resources</CardTitle>
            <CardDescription>Ready to deploy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {selectedDisaster === "all" ? 78 : 42}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              <span className="text-red-500 dark:text-red-400">↓ 8%</span> from yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Response Time</CardTitle>
            <CardDescription>Average time to respond</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">18m</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              <span className="text-green-500 dark:text-green-400">↑ 15%</span> improvement
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="requests">
              <TabsList className="mb-4 overflow-x-auto whitespace-nowrap">
                <TabsTrigger value="requests">Requests</TabsTrigger>
                {/* <TabsTrigger value="tasks">Tasks</TabsTrigger> */}
                {/* <TabsTrigger value="resources">Resources</TabsTrigger> */}
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
              </TabsList>
              <div className="overflow-x-auto">
                <TabsContent value="requests">
                  <RequestsOverview disasterId={selectedDisaster === "all" ? undefined : selectedDisaster} />
                </TabsContent>
                {/* <TabsContent value="tasks">
                  <TasksOverview disasterId={selectedDisaster === "all" ? undefined : selectedDisaster} />
                </TabsContent> */}
                {/* <TabsContent value="resources">
                  <ResourcesOverview disasterId={selectedDisaster === "all" ? undefined : selectedDisaster} />
                </TabsContent> */}
                <TabsContent value="users">
                  <UserStats disasterId={selectedDisaster === "all" ? undefined : selectedDisaster} />
                </TabsContent>
                <TabsContent value="metrics">
                  <MetricsDisplay disasterId={selectedDisaster === "all" ? undefined : selectedDisaster} />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alerts & Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <AlertsPanel disasterId={selectedDisaster === "all" ? undefined : selectedDisaster} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentActivity disasterId={selectedDisaster === "all" ? undefined : selectedDisaster} />
        </CardContent>
      </Card>
    </div>
  )
}
