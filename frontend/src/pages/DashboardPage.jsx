import React from 'react';
    import { useAuth } from '@/contexts/AuthContext';
    import { Button } from '@/components/ui/button';
    import { AlertTriangle, CheckCircle, ListChecks, MessageSquare, PlusCircle, MapPin, Archive, ArrowLeft, Globe } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { Link, useParams, useNavigate } from 'react-router-dom';
    import { useData } from '@/contexts/DataContext';
    import StatCard from '@/components/dashboard/StatCard';
    import TaskItem from '@/components/dashboard/TaskItem';
    import RequestItem from '@/components/dashboard/RequestItem';
    import ResponderDashboard from '@/components/dashboard/ResponderDashboard';
    import VolunteerDashboard from '@/components/dashboard/VolunteerDashboard';
    import AffectedIndividualDashboard from '@/components/dashboard/AffectedIndividualDashboard';
    import GovernmentDashboard from '@/components/dashboard/GovernmentDashboard';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

    // This function might need to be outside or passed only necessary data if it causes hook issues
    const getRoleSpecificStats = (user, eventTasks, eventRequests, eventResources) => {
      if (!user) return [];
      // Ensure data arrays are initialized even if empty to prevent filter errors
      const tasks = eventTasks || [];
      const requests = eventRequests || [];
      const resources = eventResources || [];

      switch (user.role) {
        case 'first_responder':
          return [
            { title: "Active Tasks (Event)", value: tasks.filter(t => t.assignee === user.id && t.status === 'In Progress').length, icon: <ListChecks />, color: "text-primary" },
            { title: "Pending Tasks (Event)", value: tasks.filter(t => t.assignee === user.id && t.status === 'Pending').length, icon: <AlertTriangle />, color: "text-yellow-500" },
            { title: "Completed Tasks (Event)", value: tasks.filter(t => t.assignee === user.id && t.status === 'Completed').length, icon: <CheckCircle />, color: "text-green-500" },
            { title: "Available Resources (Event)", value: resources.filter(r => r.status === 'Available').length, icon: <Archive />, color: "text-blue-500" },
          ];
        case 'volunteer':
          return [
            { title: "Assigned Tasks (Event)", value: tasks.filter(t => t.assignee === user.id && t.status !== 'Completed').length, icon: <ListChecks />, color: "text-primary" },
            { title: "Reported Observations (Event)", value: requests.filter(r => r.submittedBy === user.email && r.type === 'Observation').length, icon: <MessageSquare />, color: "text-accent" },
            { title: "Completed Tasks (Event)", value: tasks.filter(t => t.assignee === user.id && t.status === 'Completed').length, icon: <CheckCircle />, color: "text-green-500" },
          ];
        case 'affected_individual':
          return [
            { title: "My Requests (Event)", value: requests.filter(r => r.submittedBy === user.email).length, icon: <ListChecks />, color: "text-primary" },
            { title: "Pending Requests (Event)", value: requests.filter(r => r.submittedBy === user.email && r.status === 'Pending').length, icon: <AlertTriangle />, color: "text-yellow-500" },
            { title: "Requests In Progress (Event)", value: requests.filter(r => r.submittedBy === user.email && r.status === 'In Progress').length, icon: <CheckCircle />, color: "text-blue-500" },
          ];
        case 'government_help_centre':
           return [
            { title: "Active Tasks (Event)", value: tasks.filter(t => t.status === 'In Progress').length, icon: <ListChecks />, color: "text-primary" },
            { title: "Pending Requests (Event)", value: requests.filter(r => r.status === 'Pending').length, icon: <AlertTriangle />, color: "text-yellow-500" },
            // Placeholder for total volunteers, this would typically come from user data filtered by event participation
            { title: "Volunteers (Event)", value: "N/A", icon: <CheckCircle />, color: "text-green-500" }, 
            { title: "Resources Deployed (Event)", value: resources.filter(r => r.status === 'Deployed').length, icon: <Archive />, color: "text-blue-500" },
          ];
        default:
          return [];
      }
    };

    const MapPlaceholder = ({ items, event }) => (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center"><Globe className="mr-2 h-6 w-6 text-primary" /> Event Map Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
            <p>(Map showing {items.length} geolocated items for {event?.name || 'this event'} will be displayed here)</p>
          </div>
           <ul className="text-xs mt-2">
            {items.slice(0,5).map(item => (
                <li key={item.id}>{item.title || item.type || item.name} at ({item.lat}, {item.lng})</li>
            ))}
            {items.length > 5 && <li>And {items.length - 5} more items...</li>}
          </ul>
        </CardContent>
      </Card>
    );


    const DashboardPage = () => {
      const { eventId } = useParams();
      const { user } = useAuth();
      const { tasks, requests, resources, getEventById } = useData();
      const navigate = useNavigate();

      const currentEvent = getEventById(eventId);

      if (!currentEvent) {
        return (
          <div className="text-center py-10">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h1 className="text-2xl font-bold">Disaster Event Not Found</h1>
            <p className="text-muted-foreground">The event (ID: {eventId}) you are looking for does not exist.</p>
            <Button asChild className="mt-4" onClick={() => navigate('/events')}>
              <Link to="/events"><ArrowLeft className="mr-2 h-4 w-4" />Back to Events</Link>
            </Button>
          </div>
        );
      }

      // Filter data for the current event
      const eventTasks = tasks.filter(t => t.eventId === eventId);
      const eventRequests = requests.filter(r => r.eventId === eventId);
      const eventResources = resources.filter(r => r.eventId === eventId);
      const geolocatedItems = [
        ...eventTasks.filter(t => t.lat && t.lng),
        ...eventRequests.filter(rq => rq.lat && rq.lng),
        ...eventResources.filter(rs => rs.lat && rs.lng)
      ];


      const userRoleName = user ? user.role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'User';

      const getGreeting = () => {
        const hours = new Date().getHours();
        if (hours < 12) return 'Good Morning';
        if (hours < 18) return 'Good Afternoon';
        return 'Good Evening';
      };
      
      const stats = getRoleSpecificStats(user, eventTasks, eventRequests, eventResources);

      const renderContentForRole = () => {
        if (!user) return <p>Loading user data...</p>;
        switch (user.role) {
          case 'first_responder':
            return <ResponderDashboard user={user} tasks={eventTasks} requests={eventRequests} resources={eventResources} TaskItemComponent={TaskItem} RequestItemComponent={RequestItem} eventId={eventId} />;
          case 'volunteer':
            return <VolunteerDashboard user={user} tasks={eventTasks} requests={eventRequests} TaskItemComponent={TaskItem} RequestItemComponent={RequestItem} eventId={eventId} />;
          case 'affected_individual':
            return <AffectedIndividualDashboard user={user} requests={eventRequests} RequestItemComponent={RequestItem} eventId={eventId} />;
          case 'government_help_centre':
            return <GovernmentDashboard tasks={eventTasks} resources={eventResources} TaskItemComponent={TaskItem} eventId={eventId} />;
          default:
            return <p>No specific dashboard content for this role.</p>;
        }
      };

      if (!user) {
        return <div className="text-center py-10">Loading user data or not logged in...</div>;
      }

      return (
        <div className="space-y-8 animate-fadeIn">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{currentEvent.name}</h1>
              <p className="text-muted-foreground">Dashboard for {userRoleName}. {getGreeting()}, {user.name || 'User'}!</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate('/events')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Events
              </Button>
            </div>
            {user.role === 'affected_individual' && (
              <Button asChild className="mt-4 sm:mt-0 bg-accent hover:bg-accent/90">
                <Link to={`/submit-request/${eventId}`}><PlusCircle className="mr-2 h-4 w-4" /> Request Assistance</Link>
              </Button>
            )}
             {user.role === 'volunteer' && (
              <Button asChild className="mt-4 sm:mt-0 bg-accent hover:bg-accent/90">
                <Link to={`/report-observation/${eventId}`}><PlusCircle className="mr-2 h-4 w-4" /> Report Observation</Link>
              </Button>
            )}
          </motion.div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>
          
           <MapPlaceholder items={geolocatedItems} event={currentEvent} />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {renderContentForRole()}
          </motion.div>
        </div>
      );
    };

    export default DashboardPage;