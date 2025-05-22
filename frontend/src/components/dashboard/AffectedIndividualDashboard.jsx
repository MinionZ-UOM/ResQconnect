import React from 'react';
    import { Link } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
    import { PlusCircle } from 'lucide-react';

    const AffectedIndividualDashboard = ({ user, requests, RequestItemComponent, eventId }) => {
      return (
        <Tabs defaultValue="my_requests">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my_requests">My Requests</TabsTrigger>
            <TabsTrigger value="submit_request">Submit New Request</TabsTrigger>
          </TabsList>
          <TabsContent value="my_requests">
            <Card>
              <CardHeader><CardTitle>Your Help Requests for this Event</CardTitle></CardHeader>
              <CardContent>
                {requests.filter(r => r.submittedBy === user.email && r.type === 'Help Request').map(req => <RequestItemComponent key={req.id} request={req} />)}
                {requests.filter(r => r.submittedBy === user.email && r.type === 'Help Request').length === 0 && <p>You have not submitted any requests for this event yet.</p>}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="submit_request">
             <Card>
              <CardHeader><CardTitle>Submit a Help Request for this Event</CardTitle><CardDescription>Let us know what assistance you need.</CardDescription></CardHeader>
              <CardContent>
                <Button asChild size="lg" className="w-full">
                  <Link to={`/submit-request/${eventId}`}><PlusCircle className="mr-2 h-5 w-5" />Create New Request</Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      );
    };

    export default AffectedIndividualDashboard;