import React, { createContext, useState, useContext, useEffect } from 'react';
    import { useAuth } from '@/contexts/AuthContext';

    const DataContext = createContext(null);

    const initialDisasterEvents = [
      { id: 'event_flood_city_a', name: 'City A Flooding Emergency', type: 'Flood', location: 'City A, Region X', date: '2025-05-20', status: 'Active', description: 'Severe flooding due to heavy rainfall impacting multiple districts in City A.', defaultLat: 34.0522, defaultLng: -118.2437 },
      { id: 'event_earthquake_region_y', name: 'Region Y Earthquake Response', type: 'Earthquake', location: 'Region Y', date: '2025-05-15', status: 'Active', description: 'Magnitude 6.8 earthquake caused significant infrastructure damage.', defaultLat: 36.7783, defaultLng: -119.4179 },
      { id: 'event_wildfire_north_forest', name: 'North Forest Wildfire Containment', type: 'Wildfire', location: 'North Forest Area', date: '2025-05-10', status: 'Contained', description: 'Large wildfire now contained, recovery efforts underway.', defaultLat: 37.8651, defaultLng: -119.5383 },
    ];
    
    const initialTasks = [
      { id: 'task1', eventId: 'event_flood_city_a', title: 'Deliver Medical Supplies to Sector A', description: 'Urgent need for bandages and antiseptics at the makeshift clinic in Sector A school.', assignee: 'respX', assignedToName: 'Responder X', status: 'In Progress', urgency: 'High', location: 'Sector A School', lat: 34.0550, lng: -118.2450, instructions: ['Collect supplies from central depot.', 'Proceed to Sector A school.', 'Coordinate with on-site medic.'] },
      { id: 'task2', eventId: 'event_earthquake_region_y', title: 'Assess Bridge Damage on Route 7', description: 'Reports of potential collapse. Need immediate assessment.', assignee: 'respY', assignedToName: 'Responder Y', status: 'Pending', urgency: 'High', location: 'Route 7 Bridge', lat: 36.7800, lng: -119.4200, instructions: [] },
      { id: 'task3', eventId: 'event_flood_city_a', title: 'Distribute Food Rations in Camp Alpha', description: 'Ensure all registered families receive their daily rations.', assignee: 'volZ', assignedToName: 'Volunteer Zoe', status: 'Pending', urgency: 'Medium', location: 'Camp Alpha', lat: 34.0500, lng: -118.2500, instructions: ['Pick up ration packs from warehouse.', 'Verify recipient list.', 'Distribute fairly.'] },
      { id: 'task4', eventId: 'event_wildfire_north_forest', title: 'Set up Temporary Shelter at Community Hall', description: 'Prepare community hall to house 50 displaced individuals.', assignee: null, assignedToName: 'Unassigned', status: 'Pending', urgency: 'High', location: 'Community Hall', lat: 37.8680, lng: -119.5400, instructions: ['Clear main hall area.', 'Set up cots and blankets.', 'Arrange for water supply.'] },
    ];

    const initialRequests = [
      { id: 'req1', eventId: 'event_flood_city_a', type: 'Help Request', details: 'Family of 4 trapped in flooded house, water rising.', submittedBy: 'affected1@example.com', submittedAt: new Date(Date.now() - 3600000).toISOString(), status: 'Pending', urgency: 'High', location: '123 Flood St.', lat: 34.0510, lng: -118.2400, image: null },
      { id: 'req2', eventId: 'event_earthquake_region_y', type: 'Observation', details: 'Main road to west blocked by fallen tree.', submittedBy: 'volunteer1@example.com', submittedAt: new Date(Date.now() - 7200000).toISOString(), status: 'Processed', urgency: 'Medium', location: 'West Main Road', lat: 36.7750, lng: -119.4250, image: 'https://images.unsplash.com/photo-1566378258309-7339fd37a86c' },
      { id: 'req3', eventId: 'event_flood_city_a', type: 'Help Request', details: 'Need baby formula and diapers.', submittedBy: 'affected2@example.com', submittedAt: new Date(Date.now() - 10800000).toISOString(), status: 'In Progress', urgency: 'Medium', location: 'Shelter Gamma', lat: 34.0490, lng: -118.2550, image: null },
    ];

    const initialResources = [
      { id: 'res1', eventId: 'event_flood_city_a', name: 'Medical Kits', quantity: 50, status: 'Available', lat: 34.0520, lng: -118.2430 },
      { id: 'res2', eventId: 'event_earthquake_region_y', name: 'Food Rations (1-day)', quantity: 200, status: 'Available', lat: 36.7780, lng: -119.4170 },
      { id: 'res3', eventId: 'event_flood_city_a', name: 'Water Bottles (500ml)', quantity: 500, status: 'Deployed', lat: 34.0530, lng: -118.2420 },
      { id: 'res4', eventId: 'event_wildfire_north_forest', name: 'Blankets', quantity: 100, status: 'Available', lat: 37.8655, lng: -119.5380 },
    ];

    const initialEventMessages = {
      'event_flood_city_a': {
        'coord_event_flood_city_a': [
          { id: 'm_flood_1', eventId: 'event_flood_city_a', sender: 'coord_event_flood_city_a', senderName: 'Coordinator (City A)', senderAvatar: 'https://avatar.vercel.sh/coord_event_flood_city_a.png', text: 'Flood coordination channel for City A is active. Updates will be posted here.', timestamp: new Date(Date.now() - 700000) },
        ],
        'respA_event_flood_city_a': [
          { id: 'm_flood_2', eventId: 'event_flood_city_a', sender: 'respA_event_flood_city_a', senderName: 'Responder Alpha (City A)', senderAvatar: 'https://avatar.vercel.sh/alpha_event_flood_city_a.png', text: 'Sector B flood assessment ongoing.', timestamp: new Date(Date.now() - 400000) },
        ],
      },
      'event_earthquake_region_y': {
        'coord_event_earthquake_region_y': [
          { id: 'm_quake_1', eventId: 'event_earthquake_region_y', sender: 'coord_event_earthquake_region_y', senderName: 'Coordinator (Region Y)', senderAvatar: 'https://avatar.vercel.sh/coord_event_earthquake_region_y.png', text: 'Earthquake response for Region Y. Please report structural damages.', timestamp: new Date(Date.now() - 650000) },
        ],
      }
    };
    
    export const DataProvider = ({ children }) => {
      const [disasterEvents, setDisasterEvents] = useState(() => {
        const storedEvents = localStorage.getItem('resqlink_disaster_events');
        return storedEvents ? JSON.parse(storedEvents) : initialDisasterEvents;
      });
      const [tasks, setTasks] = useState(() => {
        const storedTasks = localStorage.getItem('resqlink_tasks');
        return storedTasks ? JSON.parse(storedTasks) : initialTasks;
      });
      const [requests, setRequests] = useState(() => {
        const storedRequests = localStorage.getItem('resqlink_requests');
        return storedRequests ? JSON.parse(storedRequests) : initialRequests;
      });
      const [resources, setResources] = useState(() => {
        const storedResources = localStorage.getItem('resqlink_resources');
        return storedResources ? JSON.parse(storedResources) : initialResources;
      });
      const [eventMessages, setEventMessages] = useState(() => {
        const storedMessages = localStorage.getItem('resqlink_event_messages');
        return storedMessages ? JSON.parse(storedMessages) : initialEventMessages;
      });
      
      const auth = useAuth(); 
      const users = auth ? auth.users : [];

      useEffect(() => {
        localStorage.setItem('resqlink_disaster_events', JSON.stringify(disasterEvents));
      }, [disasterEvents]);
      useEffect(() => {
        localStorage.setItem('resqlink_tasks', JSON.stringify(tasks));
      }, [tasks]);
      useEffect(() => {
        localStorage.setItem('resqlink_requests', JSON.stringify(requests));
      }, [requests]);
      useEffect(() => {
        localStorage.setItem('resqlink_resources', JSON.stringify(resources));
      }, [resources]);
      useEffect(() => {
        localStorage.setItem('resqlink_event_messages', JSON.stringify(eventMessages));
      }, [eventMessages]);

      const addDisasterEvent = (event) => {
        setDisasterEvents(prevEvents => [event, ...prevEvents]);
        setEventMessages(prev => ({
          ...prev,
          [event.id]: {} // Initialize message channels for the new event
        }));
      };
      const addTask = (task) => {
        setTasks(prevTasks => [task, ...prevTasks]);
      };
      const addRequest = (request) => {
        setRequests(prevRequests => [request, ...prevRequests]);
      };
      const addResource = (resource) => {
        setResources(prevResources => [resource, ...prevResources]);
      };
      
      const updateTaskStatus = (taskId, newStatus) => {
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId ? { ...task, status: newStatus } : task
          )
        );
      };
      const updateRequestStatus = (requestId, newStatus) => {
         setRequests(prevRequests => 
          prevRequests.map(request => 
            request.id === requestId ? { ...request, status: newStatus } : request
          )
        );
      };

      const getEventById = (eventId) => disasterEvents.find(event => event.id === eventId);

      const getMessagesForEventChannel = (eventId, channelId) => {
        return eventMessages[eventId]?.[channelId] || [];
      };

      const addMessageToEventChannel = (eventId, channelId, message) => {
        setEventMessages(prevEventMessages => {
          const updatedEventMessages = { ...prevEventMessages };
          if (!updatedEventMessages[eventId]) {
            updatedEventMessages[eventId] = {};
          }
          if (!updatedEventMessages[eventId][channelId]) {
            updatedEventMessages[eventId][channelId] = [];
          }
          updatedEventMessages[eventId][channelId] = [...updatedEventMessages[eventId][channelId], message];
          return updatedEventMessages;
        });
      };


      return (
        <DataContext.Provider value={{ 
          disasterEvents, tasks, requests, resources, users, eventMessages,
          addDisasterEvent, addTask, addRequest, addResource, 
          updateTaskStatus, updateRequestStatus, getEventById,
          getMessagesForEventChannel, addMessageToEventChannel
        }}>
          {children}
        </DataContext.Provider>
      );
    };
    export const useData = () => useContext(DataContext);