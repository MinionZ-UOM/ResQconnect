import React from 'react';
    import { Link } from 'react-router-dom';
    import { useData } from '@/contexts/DataContext';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { motion } from 'framer-motion';
    import { AlertTriangle, ShieldCheck, MapPin, CalendarDays, ExternalLink } from 'lucide-react';

    const EventCard = ({ event }) => {
      const getStatusColor = (status) => {
        if (status === 'Active') return 'text-destructive';
        if (status === 'Contained' || status === 'Monitoring') return 'text-yellow-500';
        if (status === 'Closed' || status === 'Resolved') return 'text-green-500';
        return 'text-muted-foreground';
      };

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <Card className="shadow-lg hover:shadow-xl transition-shadow flex flex-col h-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl font-semibold text-primary">{event.name}</CardTitle>
                {event.type === 'Flood' && <AlertTriangle className="h-6 w-6 text-blue-500" />}
                {event.type === 'Earthquake' && <ShieldCheck className="h-6 w-6 text-orange-500" />}
                {event.type === 'Wildfire' && <AlertTriangle className="h-6 w-6 text-red-600" />}
              </div>
              <CardDescription className="text-sm text-muted-foreground">{event.type}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
              <div className="text-xs space-y-1">
                <p className="flex items-center"><MapPin className="h-3 w-3 mr-2 text-gray-500" /> {event.location}</p>
                <p className="flex items-center"><CalendarDays className="h-3 w-3 mr-2 text-gray-500" /> {new Date(event.date).toLocaleDateString()}</p>
                <p className="flex items-center">Status: <span className={`ml-1 font-medium ${getStatusColor(event.status)}`}>{event.status}</span></p>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full bg-primary hover:bg-primary/90">
                <Link to={`/dashboard/event/${event.id}`}>
                  View Dashboard <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      );
    };

    const EventsPage = () => {
      const { disasterEvents } = useData();

      return (
        <div className="container mx-auto py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold tracking-tight text-center mb-4">Active Disaster Events</h1>
            <p className="text-lg text-muted-foreground text-center mb-12">
              Select an event to view its specific dashboard, tasks, requests, and resources.
            </p>
          </motion.div>

          {disasterEvents && disasterEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {disasterEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center py-10"
            >
              <AlertTriangle className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground">No active disaster events at the moment.</p>
              <p className="text-sm text-muted-foreground mt-2">Please check back later for updates.</p>
            </motion.div>
          )}
        </div>
      );
    };

    export default EventsPage;