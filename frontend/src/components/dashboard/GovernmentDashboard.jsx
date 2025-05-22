import React from 'react';
    import { Link } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

    const GovernmentDashboard = ({ tasks, resources, TaskItemComponent, eventId }) => {
      return (
         <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="manage_tasks">Manage Tasks</TabsTrigger>
            <TabsTrigger value="manage_resources">Manage Resources</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <Card>
              <CardHeader><CardTitle>Event Overview</CardTitle></CardHeader>
              <CardContent>
                <p>This is where aggregated data and key metrics for this specific event will be displayed.</p>
                <p className="mt-2 text-sm text-muted-foreground">Event ID: {eventId}</p>
                <Button asChild className="mt-4">
                  <Link to="/admin">Go to Full Admin Panel (Global)</Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
           <TabsContent value="manage_tasks">
            <Card>
              <CardHeader><CardTitle>All Tasks for this Event</CardTitle></CardHeader>
              <CardContent>
                {tasks.map(task => <TaskItemComponent key={task.id} task={task} eventId={eventId}/>)}
                {tasks.length === 0 && <p>No tasks in the system for this event.</p>}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="manage_resources">
             <Card>
              <CardHeader><CardTitle>All Resources for this Event</CardTitle></CardHeader>
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

    export default GovernmentDashboard;