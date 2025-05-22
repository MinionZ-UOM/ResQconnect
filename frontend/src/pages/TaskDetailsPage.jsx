import React from 'react';
    import { useParams, Link, useNavigate } from 'react-router-dom';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { ArrowLeft, MapPin, UserCheck, AlertTriangle, CheckCircle2, MessageSquare } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { useData } from '@/contexts/DataContext';
    import { Badge } from '@/components/ui/badge';

    const TaskDetailsPage = () => {
      const { eventId, taskId } = useParams();
      const navigate = useNavigate();
      const { tasks, updateTaskStatus, getEventById } = useData();
      
      const event = getEventById(eventId);
      const task = tasks.find(t => t.id === taskId && t.eventId === eventId);

      if (!event) {
         return (
          <div className="text-center py-10">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h1 className="text-2xl font-bold">Event Not Found</h1>
            <p className="text-muted-foreground">The event (ID: {eventId}) associated with this task does not exist.</p>
            <Button asChild className="mt-4" onClick={() => navigate('/events')}>
              <Link to="/events"><ArrowLeft className="mr-2 h-4 w-4" />Back to Events</Link>
            </Button>
          </div>
        );
      }

      if (!task) {
        return (
          <div className="text-center py-10">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h1 className="text-2xl font-bold">Task Not Found</h1>
            <p className="text-muted-foreground">The task (ID: {taskId}) you are looking for does not exist for event "{event.name}" or has been removed.</p>
            <Button asChild className="mt-4" onClick={() => navigate(`/dashboard/event/${eventId}`)}>
              <Link to={`/dashboard/event/${eventId}`}><ArrowLeft className="mr-2 h-4 w-4" />Back to Event Dashboard</Link>
            </Button>
          </div>
        );
      }

      const getStatusBadgeVariant = (status) => {
        switch (status) {
          case 'Pending': return 'outline';
          case 'In Progress': return 'secondary';
          case 'Completed': return 'default';
          default: return 'secondary';
        }
      };


      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto py-8"
        >
          <Button variant="outline" asChild className="mb-6" onClick={() => navigate(`/dashboard/event/${eventId}`)}>
            <Link to={`/dashboard/event/${eventId}`}><ArrowLeft className="mr-2 h-4 w-4" /> Back to Event Dashboard</Link>
          </Button>

          <Card className="shadow-xl">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">{task.title}</CardTitle>
                <Badge variant={getStatusBadgeVariant(task.status)} className="text-sm">{task.status}</Badge>
              </div>
              <CardDescription className="text-md">
                Urgency: <span className={`font-semibold ${task.urgency === 'High' ? 'text-destructive' : task.urgency === 'Medium' ? 'text-yellow-500' : 'text-green-500'}`}>{task.urgency}</span> | Part of Event: {event.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-1">Description</h2>
                <p className="text-muted-foreground">{task.description}</p>
              </div>

              {task.location && (
                <div>
                  <h2 className="text-lg font-semibold mb-1 flex items-center"><MapPin className="mr-2 h-5 w-5 text-primary" />Location</h2>
                  <p className="text-muted-foreground">{task.location} {task.lat && task.lng && `(${task.lat}, ${task.lng})`}</p>
                   <div className="mt-2 h-48 bg-muted rounded-md flex items-center justify-center">
                     <p className="text-sm text-muted-foreground">(Map detail for task location will be displayed here)</p>
                   </div>
                </div>
              )}

              {task.assignedToName && (
                 <div>
                  <h2 className="text-lg font-semibold mb-1 flex items-center"><UserCheck className="mr-2 h-5 w-5 text-primary" />Assigned To</h2>
                  <p className="text-muted-foreground">{task.assignedToName}</p>
                </div>
              )}
              
              {task.instructions && task.instructions.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-1">Step-by-step Instructions</h2>
                  <ul className="list-decimal list-inside space-y-1 text-muted-foreground">
                    {task.instructions.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}
              
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <Button variant="outline" asChild>
                 <Link to={`/communication/${eventId}`}>
                  <MessageSquare className="mr-2 h-4 w-4" /> Event Communication Hub
                </Link>
              </Button>
              {task.status !== 'Completed' && (
                <div className="flex gap-2">
                  {task.status === 'Pending' && 
                    <Button onClick={() => updateTaskStatus(task.id, 'In Progress')} className="bg-blue-600 hover:bg-blue-700">
                      Start Task
                    </Button>
                  }
                  {task.status === 'In Progress' &&
                    <Button onClick={() => updateTaskStatus(task.id, 'Completed')} className="bg-green-600 hover:bg-green-700">
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Completed
                    </Button>
                  }
                </div>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      );
    };

    export default TaskDetailsPage;