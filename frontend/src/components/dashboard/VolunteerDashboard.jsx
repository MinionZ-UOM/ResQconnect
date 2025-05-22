import React from 'react';
    import { Link } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
    import { PlusCircle } from 'lucide-react';

    const VolunteerDashboard = ({ user, tasks, requests, TaskItemComponent, RequestItemComponent, eventId }) => {
      return (
        <Tabs defaultValue="my_tasks">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my_tasks">My Tasks</TabsTrigger>
            <TabsTrigger value="report_observation">Report Observation</TabsTrigger>
          </TabsList>
          <TabsContent value="my_tasks">
            <Card>
              <CardHeader><CardTitle>Your Assigned Tasks for this Event</CardTitle></CardHeader>
              <CardContent>
                {tasks.filter(t => t.assignee === user.id && t.status !== 'Completed').map(task => <TaskItemComponent key={task.id} task={task} eventId={eventId}/>)}
                {tasks.filter(t => t.assignee === user.id && t.status !== 'Completed').length === 0 && <p>No tasks assigned currently for this event. Check back later!</p>}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="report_observation">
             <Card>
              <CardHeader><CardTitle>Report an Observation for this Event</CardTitle><CardDescription>Share what you see in the field to help coordination efforts.</CardDescription></CardHeader>
              <CardContent>
                <Button asChild size="lg" className="w-full">
                  <Link to={`/report-observation/${eventId}`}><PlusCircle className="mr-2 h-5 w-5" />Create New Report</Link>
                </Button>
                <h4 className="text-md font-semibold mt-6 mb-2">Your Recent Reports for this Event:</h4>
                 {requests.filter(r => r.submittedBy === user.email && r.type === 'Observation').slice(0,3).map(req => <RequestItemComponent key={req.id} request={req} />)}
                 {requests.filter(r => r.submittedBy === user.email && r.type === 'Observation').length === 0 && <p>You haven't submitted any reports for this event yet.</p>}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      );
    };

    export default VolunteerDashboard;