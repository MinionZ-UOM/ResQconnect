import React, { useState } from 'react';
    import { useNavigate, useParams, Link } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Textarea } from '@/components/ui/textarea';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { useToast } from '@/components/ui/use-toast';
    import { useAuth } from '@/contexts/AuthContext';
    import { useData } from '@/contexts/DataContext';
    import { motion } from 'framer-motion';
    import { FilePlus2, UploadCloud, ArrowLeft, AlertTriangle } from 'lucide-react';

    const SubmitRequestPage = () => {
      const { eventId } = useParams();
      const { user } = useAuth();
      const { addRequest, getEventById } = useData();
      const navigate = useNavigate();
      const { toast } = useToast();

      const currentEvent = getEventById(eventId);

      const [requestType, setRequestType] = useState('');
      const [details, setDetails] = useState('');
      const [location, setLocation] = useState('');
      const [lat, setLat] = useState('');
      const [lng, setLng] = useState('');
      const [urgency, setUrgency] = useState('Medium');
      const [imageFile, setImageFile] = useState(null);

      if (!currentEvent) {
        return (
          <div className="text-center py-10">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h1 className="text-2xl font-bold">Event Not Found</h1>
            <p className="text-muted-foreground">Cannot submit request: The specified event (ID: {eventId}) does not exist.</p>
            <Button asChild className="mt-4">
              <Link to="/events"><ArrowLeft className="mr-2 h-4 w-4" />Back to Events</Link>
            </Button>
          </div>
        );
      }


      const handleSubmit = (e) => {
        e.preventDefault();
        if (!requestType || !details) {
          toast({
            title: "Missing Information",
            description: "Please select a request type and provide details.",
            variant: "destructive",
          });
          return;
        }

        const newRequest = {
          id: Date.now().toString(),
          eventId: eventId,
          type: requestType,
          details,
          location,
          lat: lat ? parseFloat(lat) : null,
          lng: lng ? parseFloat(lng) : null,
          urgency,
          submittedBy: user.email, 
          submittedAt: new Date().toISOString(),
          status: 'Pending', 
          image: imageFile ? URL.createObjectURL(imageFile) : null,
        };
        
        addRequest(newRequest);

        toast({
          title: "Request Submitted",
          description: `Your request for help regarding "${currentEvent.name}" has been successfully submitted.`,
        });
        navigate(`/dashboard/event/${eventId}`); 
      };

      const handleImageUpload = (e) => {
        if (e.target.files && e.target.files[0]) {
          setImageFile(e.target.files[0]);
        }
      };

      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto py-8"
        >
           <Button variant="outline" asChild className="mb-6" onClick={() => navigate(`/dashboard/event/${eventId}`)}>
            <Link to={`/dashboard/event/${eventId}`}><ArrowLeft className="mr-2 h-4 w-4" /> Back to Event Dashboard</Link>
          </Button>
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <FilePlus2 className="mx-auto h-12 w-12 text-primary mb-2" />
              <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Submit Help Request</CardTitle>
              <CardDescription>For event: <span className="font-semibold">{currentEvent.name}</span>. Describe your situation and what assistance you need.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="requestType">Type of Request</Label>
                  <Select onValueChange={setRequestType} value={requestType}>
                    <SelectTrigger id="requestType">
                      <SelectValue placeholder="Select request type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Medical Aid">Medical Aid</SelectItem>
                      <SelectItem value="Food & Water">Food & Water</SelectItem>
                      <SelectItem value="Shelter">Shelter</SelectItem>
                      <SelectItem value="Rescue">Rescue</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="details">Details</Label>
                  <Textarea id="details" placeholder="Please provide as much detail as possible about your situation and needs." value={details} onChange={(e) => setDetails(e.target.value)} required rows={5} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location Description (Optional)</Label>
                  <Input id="location" type="text" placeholder="e.g., 123 Main St, or nearby landmark" value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="lat">Latitude (Optional)</Label>
                        <Input id="lat" type="number" step="any" placeholder="e.g., 34.0522" value={lat} onChange={(e) => setLat(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lng">Longitude (Optional)</Label>
                        <Input id="lng" type="number" step="any" placeholder="e.g., -118.2437" value={lng} onChange={(e) => setLng(e.target.value)} />
                    </div>
                </div>


                <div className="space-y-2">
                  <Label htmlFor="urgency">Urgency Level</Label>
                  <Select onValueChange={setUrgency} defaultValue="Medium">
                    <SelectTrigger id="urgency">
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High (Life-threatening)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="imageUpload">Upload Image (Optional)</Label>
                  <div className="flex items-center justify-center w-full">
                      <label htmlFor="imageUpload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <UploadCloud className="w-8 h-8 mb-2 text-gray-500" />
                              <p className="mb-1 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                          </div>
                          <Input id="imageUpload" type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                      </label>
                  </div>
                  {imageFile && <p className="text-sm text-muted-foreground mt-2">Selected file: {imageFile.name}</p>}
                </div>


                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Submit Request</Button>
              </form>
            </CardContent>
            <CardFooter>
                <p className="text-xs text-muted-foreground text-center w-full">Your request will be processed by our AI system and routed to the appropriate responders for this event.</p>
            </CardFooter>
          </Card>
        </motion.div>
      );
    };

    export default SubmitRequestPage;