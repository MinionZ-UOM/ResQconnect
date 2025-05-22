import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { AlertTriangle, ArrowRight } from "lucide-react"
import { DisasterList } from "@/components/disasters/disaster-list"

interface DashboardPageProps {
  params: {
    role: string
  }
}

export default function DashboardPage({ params }: DashboardPageProps) {
  const role = params.role
  const roleTitle = role.charAt(0).toUpperCase() + role.slice(1)

  return (
    <div className="container mx-auto p-4 md:p-6">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">Welcome, {roleTitle}</h1>
        <p className="text-slate-600 dark:text-slate-400">Select a disaster to begin</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Active Disasters</CardTitle>
            <CardDescription>Requiring assistance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">4</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              <span className="text-red-500 dark:text-red-400">↑ 1</span> from yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Your Active Tasks</CardTitle>
            <CardDescription>Assigned to you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">2</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              <Badge className="bg-yellow-500">In Progress</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Recent Alerts</CardTitle>
            <CardDescription>Important notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium">Evacuation Order: North County</span>
            </div>
            <div className="mt-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/${role}/alerts`}>
                  View All <ArrowRight className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Disasters</CardTitle>
          <CardDescription>Select a disaster to view details and provide assistance</CardDescription>
        </CardHeader>
        <CardContent>
          <DisasterList />
        </CardContent>
      </Card>
    </div>
  )
}
