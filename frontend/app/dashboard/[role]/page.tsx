import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { AlertTriangle, ArrowRight, MapPin, Phone, PlusCircle, Hospital, TentTree } from "lucide-react"
import { DisasterList } from "@/components/disasters/disaster-list"
import AvailabilityToggle from '@/components/availability-toggle'
import AvailabilityCard from '@/components/availability-card'

interface DashboardPageProps {
  params: Promise<{ role: string }>
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { role: slug } = await params

  // Display-friendly title: “First Responder” from “first-responder”
  const roleTitle = slug
    .replace(/[-_]/g, " ") // replace both "-" and "_" with space
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  return (    
    <div className="fixed inset-0 py-3 md:left-64 md:right-0 overflow-auto px-4 md:px-6">    
      <header className="mb-6 ml-8 md:ml-0">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
          Welcome, {roleTitle}
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {slug === "affected-individual" ? (
          <>
            {/* Nearby Help Centers Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Nearby Help Centers</CardTitle>
                <CardDescription>Assistance close to you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-3">
                  <Hospital className="h-5 w-5 text-blue-500" />
                  <span><strong>Panadura Base Hospital</strong> – 3km away</span>
                </div>
                <div className="flex items-center gap-3">
                  <TentTree className="h-5 w-5 text-green-600" />
                  <span><strong>Kandy Relief Shelter</strong> – 1.5km away</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-yellow-600" />
                  <span><strong>Malabe Community Tent</strong> – 2km away</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Quick Actions</CardTitle>
                <CardDescription>Take immediate steps</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full flex items-center justify-start gap-7 px-4 py-3" variant="default">
                  <Link href={`/dashboard/${slug}/new-request`} className="flex items-center justify-start gap-3 w-full">
                    <PlusCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">Submit New Request</span>
                  </Link>
                </Button>

                <Button className="w-full flex items-center justify-start gap-7 px-4 py-3" variant="outline">
                  <Phone className="h-5 w-5" />
                  <span className="text-sm font-medium">Call Emergency</span>
                </Button>

                <Button className="w-full flex items-center justify-start gap-7 px-4 py-3" variant="secondary" asChild>
                  <Link href={`/dashboard/${slug}/map`} className="flex items-center justify-start gap-3 w-full">
                    <MapPin className="h-5 w-5" />
                    <span className="text-sm font-medium">View Disaster Map</span>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Original Cards for other roles */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Active Disasters</CardTitle>
                <CardDescription>Requiring assistance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  3
                </div>
                <div className="text-base text-slate-500 dark:text-slate-400">
                  <span className="text-red-500 dark:text-red-400">↑ 1</span> from yesterday
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Your Active Tasks</CardTitle>
                <CardDescription>Assigned to you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">2</div>
                <div className="text-base text-slate-500 dark:text-slate-400">
                  <Badge className="bg-yellow-500">In Progress</Badge>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Third Card (Always Shown) */}
        {slug === 'volunteer' ? (
          <AvailabilityCard />
          ) : (
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
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Active Disasters Near Your Area</CardTitle>
          <CardDescription className="text-base">
            Here are the disasters currently active in your region. Click on any disaster to view details and join efforts.
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
