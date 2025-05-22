import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { RequestStatus, RequestType } from "@/lib/types"

interface RecentActivityProps {
  role: string
}

export function RecentActivity({ role }: RecentActivityProps) {
  // Mock activity data - in a real app, this would come from an API
  const activities = [
    {
      id: 1,
      type: "request_created",
      user: {
        name: "John Doe",
        avatar: "",
        initials: "JD",
      },
      request: {
        id: "REQ-001",
        type: "Medical" as RequestType,
        title: "Medical assistance needed",
      },
      time: "10 minutes ago",
    },
    {
      id: 2,
      type: "request_assigned",
      user: {
        name: "Sarah Johnson",
        avatar: "",
        initials: "SJ",
      },
      request: {
        id: "REQ-002",
        type: "Evacuation" as RequestType,
        title: "Family evacuation",
      },
      assignedTo: {
        name: "Rescue Team Alpha",
        avatar: "",
        initials: "RT",
      },
      time: "25 minutes ago",
    },
    {
      id: 3,
      type: "request_status_updated",
      user: {
        name: "Mike Wilson",
        avatar: "",
        initials: "MW",
      },
      request: {
        id: "REQ-003",
        type: "Food" as RequestType,
        title: "Food supplies for shelter",
      },
      status: "Completed" as RequestStatus,
      time: "1 hour ago",
    },
    {
      id: 4,
      type: "resource_deployed",
      user: {
        name: "Lisa Chen",
        avatar: "",
        initials: "LC",
      },
      resource: {
        name: "Emergency Medical Kit",
        quantity: 5,
      },
      location: "North District Hospital",
      time: "2 hours ago",
    },
    {
      id: 5,
      type: "volunteer_registered",
      user: {
        name: "Robert Smith",
        avatar: "",
        initials: "RS",
      },
      skills: ["First Aid", "Driving"],
      time: "3 hours ago",
    },
  ]

  // Filter activities based on role
  const filteredActivities =
    role === "admin"
      ? activities
      : activities.filter(
          (activity) =>
            role === "responder" ||
            (role === "volunteer" && activity.type !== "resource_deployed") ||
            (role === "affected" &&
              (activity.type === "request_status_updated" || activity.type === "request_assigned")),
        )

  return (
    <div className="space-y-4">
      {filteredActivities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
          <Avatar>
            <AvatarImage src={activity.user.avatar || "/placeholder.svg"} alt={activity.user.name} />
            <AvatarFallback>{activity.user.initials}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-1">
            <p className="text-sm">
              <span className="font-medium">{activity.user.name}</span>{" "}
              {activity.type === "request_created" && (
                <>
                  created a new <span className="font-medium">{activity.request.type}</span> request: "
                  {activity.request.title}"
                </>
              )}
              {activity.type === "request_assigned" && (
                <>
                  assigned <span className="font-medium">{activity.request.title}</span> to{" "}
                  <span className="font-medium">{activity.assignedTo?.name}</span>
                </>
              )}
              {activity.type === "request_status_updated" && (
                <>
                  marked <span className="font-medium">{activity.request.title}</span> as{" "}
                  <span className="font-medium">{activity.status}</span>
                </>
              )}
              {activity.type === "resource_deployed" && (
                <>
                  deployed{" "}
                  <span className="font-medium">
                    {activity.resource.quantity} {activity.resource.name}
                  </span>{" "}
                  to <span className="font-medium">{activity.location}</span>
                </>
              )}
              {activity.type === "volunteer_registered" && (
                <>
                  registered as a volunteer with skills:{" "}
                  <span className="font-medium">{activity.skills.join(", ")}</span>
                </>
              )}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
