import { AlertTriangle, Info, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface AlertsPanelProps {
  role: string
}

export function AlertsPanel({ role }: AlertsPanelProps) {
  // Mock alerts - in a real app, these would come from an API
  const alerts = [
    {
      id: 1,
      type: "critical",
      title: "Flooding in North District",
      description: "Water levels rising rapidly. Evacuation needed.",
      time: "10 minutes ago",
    },
    {
      id: 2,
      type: "warning",
      title: "Medical Supplies Low",
      description: "First aid kits running low in East sector.",
      time: "1 hour ago",
    },
    {
      id: 3,
      type: "info",
      title: "New Volunteer Team",
      description: "5 new volunteers available in South sector.",
      time: "3 hours ago",
    },
    {
      id: 4,
      type: "success",
      title: "Rescue Complete",
      description: "Family of 4 successfully evacuated from West district.",
      time: "5 hours ago",
    },
  ]

  // Filter alerts based on role
  const filteredAlerts =
    role === "admin"
      ? alerts
      : alerts.filter(
          (alert) =>
            role === "responder" ||
            (role === "volunteer" && alert.type !== "critical") ||
            (role === "affected" && (alert.type === "info" || alert.type === "success")),
        )

  return (
    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
      {filteredAlerts.map((alert) => (
        <Alert
          key={alert.id}
          variant={
            alert.type === "critical"
              ? "destructive"
              : alert.type === "warning"
                ? "default"
                : alert.type === "success"
                  ? "default"
                  : "default"
          }
          className={
            alert.type === "success"
              ? "border-green-500 text-green-500"
              : alert.type === "info"
                ? "border-blue-500 text-blue-500"
                : undefined
          }
        >
          {alert.type === "critical" && <AlertTriangle className="h-4 w-4" />}
          {alert.type === "warning" && <AlertTriangle className="h-4 w-4" />}
          {alert.type === "info" && <Info className="h-4 w-4" />}
          {alert.type === "success" && <CheckCircle className="h-4 w-4" />}

          <AlertTitle>{alert.title}</AlertTitle>
          <AlertDescription className="flex flex-col">
            <span>{alert.description}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">{alert.time}</span>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  )
}
