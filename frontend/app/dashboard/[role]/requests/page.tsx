import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RequestsList } from "@/components/requests/requests-list"
import { RequestForm } from "@/components/requests/request-form"
import { Plus, Filter } from "lucide-react"

interface RequestsPageProps {
  params: {
    role: string
  }
}

export default function RequestsPage({ params }: RequestsPageProps) {
  const role = params.role

  return (
    <div className="container mx-auto p-4 md:p-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">Requests</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage and track assistance requests</p>
        </div>

        {(role === "affected" || role === "volunteer") && (
          <Button className="mt-4 md:mt-0">
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        )}
      </header>

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
          <CardTitle>All Requests</CardTitle>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="new">New</TabsTrigger>
              <TabsTrigger value="assigned">Assigned</TabsTrigger>
              <TabsTrigger value="inProgress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <RequestsList role={role} filter="all" />
            </TabsContent>
            <TabsContent value="new">
              <RequestsList role={role} filter="New" />
            </TabsContent>
            <TabsContent value="assigned">
              <RequestsList role={role} filter="Assigned" />
            </TabsContent>
            <TabsContent value="inProgress">
              <RequestsList role={role} filter="InProgress" />
            </TabsContent>
            <TabsContent value="completed">
              <RequestsList role={role} filter="Completed" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {(role === "affected" || role === "volunteer") && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Submit New Request</CardTitle>
          </CardHeader>
          <CardContent>
            <RequestForm role={role} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
