import React from 'react';
    import { Link } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { MapPin } from 'lucide-react';

    const TaskItem = ({ task, eventId }) => (
       <Card className="mb-4 animate-fadeIn">
        <CardHeader>
          <CardTitle className="text-lg">{task.title}</CardTitle>
          <CardDescription>Urgency: <span className={`font-semibold ${task.urgency === 'High' ? 'text-destructive' : task.urgency === 'Medium' ? 'text-yellow-500' : 'text-green-500'}`}>{task.urgency}</span> | Status: {task.status}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{task.description}</p>
          {task.location && <p className="text-sm mt-1"><MapPin className="inline h-4 w-4 mr-1 text-primary" /> Location: {task.location}</p>}
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/task/${eventId}/${task.id}`}>View Details</Link>
          </Button>
        </CardFooter>
      </Card>
    );

    export default TaskItem;