"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Request } from "@/lib/types"
import { MessageSquare, MapPin, Clock, User, FileText, Brain } from "lucide-react"
import { RequestChat } from "@/components/requests/request-chat"

interface RequestDetailsProps {
  request: Request
  role: string
}

export function RequestDetails({ request, role }: RequestDetailsProps) {
  const [activeTab, setActiveTab] = useState("details")

  // Mock AI analysis data - in a real app, this would come from an API
  const aiAnalysis = {
    extractedInfo: {
      urgency: request.priority,
      peopleAffected: 1,
      resourcesNeeded: ["Medical Supplies", "Insulin"],
      hazards: ["Medical Emergency"],
    },
    recommendedActions: [
      "Dispatch medical team with insulin supplies",
      "Check for other medical needs",
      "Follow up within 2 hours",
    ],
    confidenceScore: 0.92,
    modelUsed: "GPT-4o",
    processingTime: 0.8,
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold">{request.title}</h2>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span>ID: {request.id}</span>
            <span>•</span>
            <Badge variant="outline">{request.type}</Badge>
            <span>•</span>
            <Badge
              variant={
                request.priority === "Critical" ? "destructive" : request.priority === "High" ? "default" : "outline"
              }
              className={
                request.priority === "High"
                  ? "bg-orange-500"
                  : request.priority === "Medium"
                    ? "bg-yellow-500"
                    : request.priority === "Low"
                      ? "bg-green-500"
                      : undefined
              }
            >
              {request.priority}
            </Badge>
          </div>
        </div>

        {(role === "responder" || role === "admin") && request.status === "New" && (
          <Button className="mt-4 md:mt-0">Assign to Me</Button>
        )}

        {(role === "responder" || role === "volunteer") &&
          (request.status === "Assigned" || request.status === "InProgress") && (
            <Button className="mt-4 md:mt-0">Mark as Completed</Button>
          )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">
            <FileText className="mr-2 h-4 w-4" />
            Details
          </TabsTrigger>
          <TabsTrigger value="ai">
            <Brain className="mr-2 h-4 w-4" />
            AI Analysis
          </TabsTrigger>
          <TabsTrigger value="chat">
            <MessageSquare className="mr-2 h-4 w-4" />
            Communication
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Request Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-slate-600 dark:text-slate-400">{request.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Status</h3>
                  <Badge
                    variant={
                      request.status === "New" ? "destructive" : request.status === "Completed" ? "default" : "outline"
                    }
                    className={
                      request.status === "Completed"
                        ? "bg-green-500"
                        : request.status === "InProgress"
                          ? "bg-yellow-500"
                          : request.status === "Assigned"
                            ? "bg-blue-500"
                            : undefined
                    }
                  >
                    {request.status}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Created</h3>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(request.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Requester</h3>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <User className="h-4 w-4" />
                    <span>John Doe (ID: {request.createdBy})</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Location</h3>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <MapPin className="h-4 w-4" />
                    <span>{request.location.address}</span>
                  </div>
                </div>
              </div>

              {request.mediaUrls && request.mediaUrls.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Attached Media</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {request.mediaUrls.map((url, index) => (
                      <div key={index} className="border rounded-md overflow-hidden">
                        <img
                          src={url || "/placeholder.svg"}
                          alt={`Attachment ${index + 1}`}
                          className="w-full h-32 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {request.assignedTo && (
            <Card>
              <CardHeader>
                <CardTitle>Assignment Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Assigned To</h3>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <User className="h-4 w-4" />
                      <span>Jane Smith (ID: {request.assignedTo})</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Assigned At</h3>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(request.updatedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Analysis</CardTitle>
              <CardDescription>Automated analysis of the request using AI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Extracted Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-md p-3">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Urgency</span>
                    <div className="font-medium">{aiAnalysis.extractedInfo.urgency}</div>
                  </div>

                  <div className="border rounded-md p-3">
                    <span className="text-sm text-slate-500 dark:text-slate-400">People Affected</span>
                    <div className="font-medium">{aiAnalysis.extractedInfo.peopleAffected}</div>
                  </div>

                  <div className="border rounded-md p-3">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Resources Needed</span>
                    <div className="font-medium">{aiAnalysis.extractedInfo.resourcesNeeded.join(", ")}</div>
                  </div>

                  <div className="border rounded-md p-3">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Hazards</span>
                    <div className="font-medium">{aiAnalysis.extractedInfo.hazards.join(", ")}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Recommended Actions</h3>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                  {aiAnalysis.recommendedActions.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-md p-3">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Confidence Score</span>
                  <div className="font-medium">{aiAnalysis.confidenceScore * 100}%</div>
                </div>

                <div className="border rounded-md p-3">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Model Used</span>
                  <div className="font-medium">{aiAnalysis.modelUsed}</div>
                </div>

                <div className="border rounded-md p-3">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Processing Time</span>
                  <div className="font-medium">{aiAnalysis.processingTime}s</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat">
          <RequestChat requestId={request.id} role={role} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
