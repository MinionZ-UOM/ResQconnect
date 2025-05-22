import React, { useState, useEffect, useRef } from 'react';
    import { useParams, Link, useNavigate } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { Textarea } from '@/components/ui/textarea';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
    import { Send, Users, MessageCircle, ArrowLeft, AlertTriangle } from 'lucide-react';
    import { useAuth } from '@/contexts/AuthContext';
    import { useData } from '@/contexts/DataContext';
    import { motion, AnimatePresence } from 'framer-motion';

    const generateMockUsersForEvent = (eventId) => {
        const eventNamePart = eventId.split('_').slice(1).join('_'); 
        return [
            { id: `coord_${eventId}`, name: `Coordinator (${eventNamePart})`, avatar: `https://avatar.vercel.sh/coord_${eventId}.png`, role: 'coordinator', eventId: eventId },
            { id: `respA_${eventId}`, name: `Responder Alpha (${eventNamePart})`, avatar: `https://avatar.vercel.sh/alpha_${eventId}.png`, role: 'first_responder', eventId: eventId },
            { id: `volB_${eventId}`, name: `Volunteer Bravo (${eventNamePart})`, avatar: `https://avatar.vercel.sh/bravo_${eventId}.png`, role: 'volunteer', eventId: eventId },
        ];
    };


    const CommunicationHubPage = () => {
      const { eventId } = useParams();
      const { user } = useAuth();
      const { getEventById, getMessagesForEventChannel, addMessageToEventChannel } = useData();
      const navigate = useNavigate();

      const currentEvent = getEventById(eventId);
      
      const [eventSpecificChannels, setEventSpecificChannels] = useState([]);
      const [selectedChannel, setSelectedChannel] = useState(null);
      const [messages, setMessages] = useState([]);
      const [newMessage, setNewMessage] = useState('');
      const messagesEndRef = useRef(null);

      useEffect(() => {
        if (currentEvent) {
          const channels = generateMockUsersForEvent(eventId);
          setEventSpecificChannels(channels);
          if (channels.length > 0 && (!selectedChannel || selectedChannel.eventId !== eventId)) {
             setSelectedChannel(channels[0]);
          }
        } else {
          setEventSpecificChannels([]);
          setSelectedChannel(null);
        }
      }, [eventId, currentEvent, selectedChannel]);

      useEffect(() => {
        if (selectedChannel && eventId) {
          setMessages(getMessagesForEventChannel(eventId, selectedChannel.id) || []);
        } else {
          setMessages([]);
        }
      }, [selectedChannel, eventId, getMessagesForEventChannel]);

      useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, [messages]);


      if (!currentEvent) {
        return (
          <div className="text-center py-10">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h1 className="text-2xl font-bold">Event Not Found</h1>
            <p className="text-muted-foreground">Cannot access communication hub: The specified event (ID: {eventId}) does not exist.</p>
            <Button asChild className="mt-4">
              <Link to="/events"><ArrowLeft className="mr-2 h-4 w-4" />Back to Events</Link>
            </Button>
          </div>
        );
      }
      
      const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !selectedChannel || !eventId) return;

        const message = {
          id: `msg_${Date.now()}`,
          eventId: eventId,
          sender: user.id, 
          senderName: user.name,
          senderAvatar: user.avatar || `https://avatar.vercel.sh/${user.email || user.id}.png`,
          text: newMessage,
          timestamp: new Date().toISOString(),
        };
        
        addMessageToEventChannel(eventId, selectedChannel.id, message);
        
        if (selectedChannel.role === 'coordinator' && (newMessage.toLowerCase().includes('task') || newMessage.toLowerCase().includes('instruction'))) {
          setTimeout(() => {
            const llmResponse = {
              id: `llm_${Date.now()}`,
              eventId: eventId,
              sender: selectedChannel.id,
              senderName: selectedChannel.name,
              senderAvatar: selectedChannel.avatar,
              text: `AI Response for "${currentEvent.name}" event, regarding "${newMessage.substring(0,20)}...": Further details required or action XYZ initiated.`,
              timestamp: new Date().toISOString(),
            };
            addMessageToEventChannel(eventId, selectedChannel.id, llmResponse);
          }, 1500);
        }
        setNewMessage('');
      };

      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col h-[calc(100vh-10rem)] gap-6"
        >
           <div className="flex justify-between items-center mb-0">
                <h1 className="text-2xl font-bold">Communication Hub: <span className="text-primary">{currentEvent.name}</span></h1>
                <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/event/${eventId}`)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Event Dashboard
                </Button>
            </div>
          <div className="flex flex-col md:flex-row flex-grow gap-6 min-h-0"> {/* Added min-h-0 */}
          {/* Channels/Users List */}
            <Card className="w-full md:w-1/3 lg:w-1/4 shadow-lg flex flex-col"> {/* Added flex flex-col */}
              <CardHeader>
                <CardTitle className="flex items-center"><Users className="mr-2 h-6 w-6 text-primary" />Channels</CardTitle>
                <CardDescription>For: {currentEvent.name}</CardDescription>
              </CardHeader>
              <CardContent className="p-0 flex-grow overflow-y-auto"> {/* Added flex-grow and overflow-y-auto */}
                <ul className="space-y-1">
                  {eventSpecificChannels.map((channelUser) => (
                    <li key={channelUser.id}>
                      <Button
                        variant={selectedChannel?.id === channelUser.id ? 'secondary' : 'ghost'}
                        className={`w-full justify-start p-3 h-auto ${selectedChannel?.id === channelUser.id ? 'bg-primary/10 text-primary' : ''}`}
                        onClick={() => setSelectedChannel(channelUser)}
                      >
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src={channelUser.avatar} alt={channelUser.name} />
                          <AvatarFallback>{channelUser.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm">{channelUser.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{channelUser.role.replace('_',' ')}</p>
                        </div>
                      </Button>
                    </li>
                  ))}
                  {eventSpecificChannels.length === 0 && <p className="p-4 text-sm text-muted-foreground">No communication channels for this event.</p>}
                </ul>
              </CardContent>
            </Card>

            {/* Chat Area */}
            <Card className="flex-1 flex flex-col shadow-xl">
              {selectedChannel ? (
                <>
                  <CardHeader className="border-b">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={selectedChannel.avatar} alt={selectedChannel.name} />
                        <AvatarFallback>{selectedChannel.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-xl">{selectedChannel.name}</CardTitle>
                        <CardDescription className="text-xs capitalize">{selectedChannel.role.replace('_',' ')} - Real-time Chat for {currentEvent.name}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/30">
                    <AnimatePresence>
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        layout
                        initial={{ opacity: 0, y: 10, x: msg.sender === user.id ? 10 : -10 }}
                        animate={{ opacity: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex items-end gap-2 ${msg.sender === user.id || msg.senderName === user.name ? 'justify-end' : 'justify-start'}`}
                      >
                        {(msg.sender !== user.id && msg.senderName !== user.name) && (
                          <Avatar className="h-8 w-8 self-end">
                            <AvatarImage src={msg.senderAvatar || `https://avatar.vercel.sh/${msg.sender}.png`} alt={msg.senderName} />
                            <AvatarFallback>{msg.senderName ? msg.senderName.charAt(0) : 'U'}</AvatarFallback>
                          </Avatar>
                        )}
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl shadow ${msg.sender === user.id || msg.senderName === user.name ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-card text-card-foreground rounded-bl-none'}`}>
                          <p className="text-sm">{msg.text}</p>
                          <p className={`text-xs mt-1 ${msg.sender === user.id || msg.senderName === user.name ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground text-left'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {(msg.sender === user.id || msg.senderName === user.name) && (
                          <Avatar className="h-8 w-8 self-end">
                            <AvatarImage src={msg.senderAvatar || `https://avatar.vercel.sh/${user.id}.png`} alt={user.name} />
                            <AvatarFallback>{user.name ? user.name.charAt(0) : 'Me'}</AvatarFallback>
                          </Avatar>
                        )}
                      </motion.div>
                    ))}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                  </CardContent>
                  <CardFooter className="p-4 border-t">
                    <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
                      <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={`Message ${selectedChannel.name} in ${currentEvent.name} channel...`}
                        className="flex-1 resize-none"
                        rows={1}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                      />
                      <Button type="submit" size="icon" className="bg-primary hover:bg-primary/90">
                        <Send className="h-5 w-5" />
                      </Button>
                    </form>
                  </CardFooter>
                </>
              ) : (
                <CardContent className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Select a channel to start chatting for the "{currentEvent.name}" event.</p>
                    {eventSpecificChannels.length === 0 && <p className="text-sm text-red-500 mt-1">No channels available for this event.</p>}
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </motion.div>
      );
    };

    export default CommunicationHubPage;