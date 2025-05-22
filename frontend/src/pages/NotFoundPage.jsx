
    import React from 'react';
    import { Link } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { AlertTriangle, Home } from 'lucide-react';
    import { motion } from 'framer-motion';

    const NotFoundPage = () => {
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center text-center min-h-[calc(100vh-14rem)] py-12 bg-gradient-to-br from-background to-muted/30"
        >
          <AlertTriangle className="h-24 w-24 text-destructive mb-8 animate-pulse" />
          <h1 className="text-6xl font-extrabold text-foreground mb-4">404</h1>
          <h2 className="text-3xl font-semibold text-muted-foreground mb-6">Page Not Found</h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-md">
            Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
          </p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link to="/">
              <Home className="mr-2 h-5 w-5" />
              Go to Homepage
            </Link>
          </Button>
        </motion.div>
      );
    };

    export default NotFoundPage;
  