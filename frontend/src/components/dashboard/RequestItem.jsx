import React from 'react';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { MapPin } from 'lucide-react';

    const RequestItem = ({ request }) => (
      <Card className="mb-4 animate-fadeIn">
        <CardHeader>
          <CardTitle className="text-lg">{request.type}</CardTitle>
          <CardDescription>Submitted by: {request.submittedBy} | Urgency: <span className={`font-semibold ${request.urgency === 'High' ? 'text-destructive' : request.urgency === 'Medium' ? 'text-yellow-500' : 'text-green-500'}`}>{request.urgency}</span></CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{request.details}</p>
          {request.location && <p className="text-sm mt-1"><MapPin className="inline h-4 w-4 mr-1 text-primary" /> Location: {request.location}</p>}
        </CardContent>
         <CardFooter>
           <span className={`text-xs px-2 py-1 rounded-full ${request.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : request.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{request.status}</span>
        </CardFooter>
      </Card>
    );

    export default RequestItem;