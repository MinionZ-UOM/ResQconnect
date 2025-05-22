import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

    const ResponderDashboard = ({ user, tasks, requests, resources, TaskItemComponent, RequestItemComponent, eventId }) => {
      return (
        <Tabs defaultValue="active_tasks">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active_tasks">Active Tasks</TabsTrigger>
            <TabsTrigger value="pending_reports">Pending Reports</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>
          <TabsContent value="active_tasks">
            <Card>
              <CardHeader><CardTitle>Your Active Tasks for this Event</CardTitle></CardHeader>
              <CardContent>
                {tasks.filter(t => t.assignee === user.id && t.status === 'In Progress').map(task => <TaskItemComponent key={task.id} task={task} eventId={eventId}/>)}
                {tasks.filter(t => t.assignee === user.id && t.status === 'In Progress').length === 0 && <p>No active tasks assigned for this event.</p>}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="pending_reports">
            <Card>
              <CardHeader><CardTitle>Incoming Reports for this Event</CardTitle></CardHeader>
              <CardContent>
                {requests.filter(r => r.status === 'Pending' && (r.type === 'Help Request' || r.type === 'Observation')).map(req => <RequestItemComponent key={req.id} request={req} />)}
                 {requests.filter(r => r.status === 'Pending' && (r.type === 'Help Request' || r.type === 'Observation')).length === 0 && <p>No pending reports for this event.</p>}
              </CardContent>
            </Card>
          </TabsContent>
           <TabsContent value="resources">
            <Card>
              <CardHeader><CardTitle>Available Resources for this Event</CardTitle></CardHeader>
              <CardContent>
                {resources.map(res => (
                  <div key={res.id} className="p-2 border-b">{res.name} - Status: {res.status} - Quantity: {res.quantity}</div>
                ))}
                 {resources.length === 0 && <p>No resources listed for this event.</p>}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      );
    };

    export default ResponderDashboard;