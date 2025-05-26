// frontend/app/dashboard/[role]/page.tsx
import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { AlertTriangle, ArrowRight } from "lucide-react"
import { DisasterList } from "@/components/disasters/disaster-list"

interface DashboardPageProps {
  params: Promise<{ role: string }>
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { role: slug } = await params

  // Display-friendly title: “First Responder” from “first-responder”
  const roleTitle = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  return (
    <div className="min-h-screen p-4 md:p-6">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
          Welcome, {roleTitle}
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Select a disaster to begin
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Active Disasters</CardTitle>
            <CardDescription>Requiring assistance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
              4
            </div>
            <div className="text-base text-slate-500 dark:text-slate-400">
              <span className="text-red-500 dark:text-red-400">↑ 1</span> from
              yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Your Active Tasks</CardTitle>
            <CardDescription>Assigned to you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
              2
            </div>
            <div className="text-base text-slate-500 dark:text-slate-400">
              <Badge className="bg-yellow-500">In Progress</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Recent Alerts</CardTitle>
            <CardDescription>Important notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <span className="text-base font-medium">
                Evacuation Order: North County
              </span>
            </div>
            <div className="mt-4">
              <Button variant="outline" size="default" asChild>
                <Link href={`/dashboard/${slug}/alerts`}>
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Active Disasters</CardTitle>
          <CardDescription className="text-base">
            Select a disaster to view details and provide assistance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Pass the slug (e.g. "volunteer", "first-responder") to your list */}
          <DisasterList role={slug} />
        </CardContent>
      </Card>
    </div>
  )
}
