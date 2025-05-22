import React from 'react';
    import { Link } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { motion } from 'framer-motion';
    import { ShieldAlert, Users, MessageSquare, Activity, ListChecks } from 'lucide-react';

    const HomePage = () => {
      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-14rem)] py-12 bg-gradient-to-br from-background to-muted/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center p-8 rounded-xl shadow-2xl bg-card max-w-3xl"
          >
            <ShieldAlert className="mx-auto h-20 w-20 text-primary mb-6" />
            <h1 className="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary mb-6">
              Welcome to ResQLink
            </h1>
            <p className="text-xl text-muted-foreground mb-10">
              Your AI-powered partner in disaster response and coordination. We connect responders, volunteers, and affected individuals for faster, more effective aid.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6 mb-12">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transform hover:scale-105 transition-transform duration-200">
                <Link to="/events"><ListChecks className="mr-2 h-5 w-5" /> View Active Incidents</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="shadow-lg transform hover:scale-105 transition-transform duration-200">
                <Link to="/login">Login / Register</Link>
              </Button>
            </div>
          </motion.div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl w-full px-4">
            {[
              { icon: <Users className="h-10 w-10 text-accent" />, title: "Unified Coordination", description: "Seamlessly connect first responders, volunteers, and government agencies for specific disaster events." },
              { icon: <MessageSquare className="h-10 w-10 text-accent" />, title: "Real-time Communication", description: "Instant updates and clear communication channels within each event." },
              { icon: <Activity className="h-10 w-10 text-accent" />, title: "AI-Powered Insights", description: "Intelligent task prioritization and resource allocation per disaster scenario." },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 * (index + 1) }}
                className="bg-card p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-center mb-4 bg-accent/10 rounded-full h-16 w-16 mx-auto">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-center">{feature.title}</h3>
                <p className="text-muted-foreground text-sm text-center">{feature.description}</p>
              </motion.div>
            ))}
          </div>
           <motion.div 
            className="mt-16 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            >
            <h2 className="text-2xl font-semibold mb-4">Ready to assist or need help?</h2>
            <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link to="/events">Explore Disaster Events</Link>
            </Button>
          </motion.div>
          {/* <div className="mt-16 w-full max-w-5xl px-4">
             <h2 className="text-3xl font-bold text-center mb-8">Our Partners</h2>
             <div className="flex flex-wrap justify-center items-center gap-8">
                <img  alt="Partner Logo 1 - Red Cross" class="h-12 text-muted-foreground filter grayscale hover:grayscale-0 transition-all" src="https://images.unsplash.com/photo-1584441405886-bc91be61e56a" />
                <img  alt="Partner Logo 2 - FEMA" class="h-12 text-muted-foreground filter grayscale hover:grayscale-0 transition-all" src="https://images.unsplash.com/photo-1643219086762-2ff48d483197" />
                <img  alt="Partner Logo 3 - UNICEF" class="h-12 text-muted-foreground filter grayscale hover:grayscale-0 transition-all" src="https://images.unsplash.com/photo-1647496922891-c4b3fb6b5ee9" />
                <img  alt="Partner Logo 4 - WHO" class="h-12 text-muted-foreground filter grayscale hover:grayscale-0 transition-all" src="https://images.unsplash.com/photo-1649000808933-1f4aac7cad9a" />
             </div>
          </div> */}
        </div>
      );
    };

    export default HomePage;