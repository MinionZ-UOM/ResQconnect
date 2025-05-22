import React, { useState } from 'react';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Label } from '@/components/ui/label';
    import { BarChart3, Users, ListChecks, BellRing, Settings, ShieldCheck, Package, AlertTriangle } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { useData } from '@/contexts/DataContext'; 
    import { Button } from '@/components/ui/button';
    import { Link } from 'react-router-dom';

    const UserManagement = () => {
      const { users } = useData(); 
      return (
        <Card>
          <CardHeader><CardTitle>Global User Management</CardTitle><CardDescription>View and manage all platform users.</CardDescription></CardHeader>
          <CardContent>
            {users.length > 0 ? (
              <ul className="space-y-2 max-h-96 overflow-y-auto">
                {users.map(user => (
                  <li key={user.id} className="flex justify-between items-center p-3 border rounded-lg shadow-sm bg-background hover:bg-muted/50 transition-colors">
                    <div>
                        <p className="font-semibold">{user.name} <span className="text-xs text-muted-foreground">({user.email})</span></p>
                        <p className="text-sm text-primary capitalize">{user.role.replace('_', ' ')}</p>
                    </div>
                    <Button variant="outline" size="sm">Manage User</Button>
                  </li>
                ))}
              </ul>
            ) : <p className="text-muted-foreground">No users found.</p>}
          </CardContent>
        </Card>
      );
    };
    
    const EventSpecificOverview = ({ eventId, tasks, resources }) => {
        const { getEventById } = useData();
        const event = getEventById(eventId);

        if (!event) return <p className="text-muted-foreground p-4">Select an event to see its details.</p>;

        const eventTasks = tasks.filter(t => t.eventId === eventId);
        const eventResources = resources.filter(r => r.eventId === eventId);

        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Tasks for: <span className="text-primary">{event.name}</span></CardTitle>
                        <CardDescription>Monitor tasks specific to this event.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {eventTasks.length > 0 ? (
                            <ul className="space-y-2 max-h-80 overflow-y-auto">
                                {eventTasks.map(task => (
                                <li key={task.id} className="flex justify-between items-center p-3 border rounded-lg shadow-sm bg-background">
                                    <div>
                                        <p className="font-medium">{task.title}</p>
                                        <p className="text-xs text-muted-foreground">Urgency: {task.urgency} | Status: {task.status} | Assignee: {task.assignedToName || 'Unassigned'}</p>
                                    </div>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link to={`/task/${eventId}/${task.id}`}>View/Assign</Link>
                                    </Button>
                                </li>
                                ))}
                            </ul>
                        ) : <p className="text-muted-foreground">No tasks for this event.</p>}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Resources for: <span className="text-primary">{event.name}</span></CardTitle>
                        <CardDescription>Manage resources allocated to this event.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {eventResources.length > 0 ? (
                            <ul className="space-y-2 max-h-80 overflow-y-auto">
                            {eventResources.map(resource => (
                                <li key={resource.id} className="flex justify-between items-center p-3 border rounded-lg shadow-sm bg-background">
                                    <div>
                                        <p className="font-medium">{resource.name}</p>
                                        <p className="text-xs text-muted-foreground">Quantity: {resource.quantity} | Status: {resource.status}</p>
                                    </div>
                                <Button variant="outline" size="sm">Manage Resource</Button>
                                </li>
                            ))}
                            </ul>
                        ) : <p className="text-muted-foreground">No resources allocated to this event.</p>}
                    </CardContent>
                </Card>
            </motion.div>
        );
    };

    const SystemMonitoring = () => (
      <Card>
        <CardHeader><CardTitle>System Health & Monitoring</CardTitle><CardDescription>Oversee AI agent performance and system status (AgentOps integration placeholder).</CardDescription></CardHeader>
        <CardContent>
          <p>Real-time metrics on AI response time, request fulfillment, and guardrail checks will appear here.</p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-muted/50">
              <CardHeader><CardTitle className="text-lg">AI Agent Performance</CardTitle></CardHeader>
              <CardContent>
                <p>Response Time: <span className="font-bold">0.8s</span> (avg)</p>
                <p>Accuracy: <span className="font-bold">92%</span></p>
              </CardContent>
            </Card>
             <Card className="bg-muted/50">
              <CardHeader><CardTitle className="text-lg">System Load</CardTitle></CardHeader>
              <CardContent>
                <p>CPU Usage: <span className="font-bold">45%</span></p>
                <p>Active Connections: <span className="font-bold">256</span></p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    );
    
    const SettingsAndCompliance = () => (
      <Card>
        <CardHeader><CardTitle>Settings & Compliance</CardTitle><CardDescription>Configure platform settings and ensure adherence to emergency protocols.</CardDescription></CardHeader>
        <CardContent>
          <p>Options for guardrails, ethical AI parameters, and cost-effectiveness settings.</p>
           <div className="mt-4 space-y-2">
            <Button variant="outline">Adjust AI Guardrails</Button>
            <Button variant="outline">Emergency Protocol Settings</Button>
          </div>
        </CardContent>
      </Card>
    );

    const AdminDashboardPage = () => {
      const { disasterEvents, tasks, resources } = useData();
      const [selectedEventId, setSelectedEventId] = useState(disasterEvents[0]?.id || '');
      
      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="flex items-center justify-between">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center"><BarChart3 className="mr-3 h-10 w-10 text-primary"/>Admin Control Center</h1>
          </div>

          <Tabs defaultValue="event_overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              <TabsTrigger value="event_overview"><ShieldCheck className="mr-2 h-4 w-4" />Event Overview</TabsTrigger>
              <TabsTrigger value="global_users"><Users className="mr-2 h-4 w-4" />Global Users</TabsTrigger>
              <TabsTrigger value="system_health"><ListChecks className="mr-2 h-4 w-4" />System Health</TabsTrigger>
              <TabsTrigger value="global_resources"><Package className="mr-2 h-4 w-4" />Global Resources</TabsTrigger>
              <TabsTrigger value="settings"><Settings className="mr-2 h-4 w-4" />Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="event_overview" className="mt-6">
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Select Disaster Event</CardTitle>
                        <CardDescription>Choose an event to view its specific tasks and resources.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {disasterEvents.length > 0 ? (
                            <div className="space-y-2">
                                <Label htmlFor="eventSelectorAdmin">Event:</Label>
                                <Select onValueChange={setSelectedEventId} value={selectedEventId}>
                                    <SelectTrigger id="eventSelectorAdmin" className="w-full md:w-1/2">
                                        <SelectValue placeholder="Select an event" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {disasterEvents.map(event => (
                                            <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ) : (
                            <p className="text-muted-foreground flex items-center"><AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />No disaster events found. Please add events to manage them.</p>
                        )}
                    </CardContent>
                </Card>
                {selectedEventId && <EventSpecificOverview eventId={selectedEventId} tasks={tasks} resources={resources} />}
            </TabsContent>

            <TabsContent value="global_users" className="mt-6">
              <UserManagement />
            </TabsContent>
            <TabsContent value="system_health" className="mt-6">
              <SystemMonitoring />
            </TabsContent>
            <TabsContent value="global_resources" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Global Resource Pool</CardTitle>
                        <CardDescription>Overview of all resources across all events.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {resources.length > 0 ? (
                            <ul className="space-y-2 max-h-96 overflow-y-auto">
                                {resources.map(resource => (
                                    <li key={resource.id} className="p-3 border rounded-lg shadow-sm bg-background">
                                        <p className="font-medium">{resource.name} (Total: {resource.quantity})</p>
                                        <p className="text-xs text-muted-foreground">Status: {resource.status} | Event: {disasterEvents.find(e => e.id === resource.eventId)?.name || 'N/A'}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-muted-foreground">No resources are currently tracked in the system.</p>}
                    </CardContent>
                     <CardFooter>
                        <Button>Add New Global Resource</Button>
                    </CardFooter>
                </Card>
            </TabsContent>
            <TabsContent value="settings" className="mt-6">
              <SettingsAndCompliance />
            </TabsContent>
          </Tabs>
        </motion.div>
      );
    };

    export default AdminDashboardPage;