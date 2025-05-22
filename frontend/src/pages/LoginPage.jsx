
    import React, { useState } from 'react';
    import { Link, useNavigate } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { useAuth } from '@/contexts/AuthContext';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';
    import { ShieldAlert } from 'lucide-react';

    const LoginPage = () => {
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [role, setRole] = useState('affected_individual'); // Default role
      const { login } = useAuth();
      const navigate = useNavigate();
      const { toast } = useToast();

      const handleSubmit = (e) => {
        e.preventDefault();
        // Basic validation
        if (!email || !password) {
          toast({
            title: "Login Failed",
            description: "Please enter both email and password.",
            variant: "destructive",
          });
          return;
        }
        // In a real app, you'd call an API. Here, we'll simulate.
        // The role is selected by the user for demo purposes.
        // In a real system, role would likely be determined by credentials.
        const success = login({ id: Date.now().toString(), email, name: email.split('@')[0], role }); 
        if (success) {
          toast({
            title: "Login Successful",
            description: `Welcome back! You are logged in as ${role.replace('_', ' ')}.`,
          });
          navigate('/dashboard');
        } else {
          toast({
            title: "Login Failed",
            description: "Invalid credentials or role. Please try again.",
            variant: "destructive",
          });
        }
      };

      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center min-h-[calc(100vh-14rem)] py-12 bg-gradient-to-br from-background to-muted/30"
        >
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="text-center">
              <ShieldAlert className="mx-auto h-12 w-12 text-primary mb-2" />
              <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Login to ResQLink</CardTitle>
              <CardDescription>Access your dashboard and coordinate effectively.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="yourname@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Login as</Label>
                  <select 
                    id="role" 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)} 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="affected_individual">Affected Individual</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="first_responder">First Responder</option>
                    <option value="government_help_centre">Government Help Centre</option>
                  </select>
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Login</Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col items-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Don't have an account? <Link to="/register" className="font-medium text-primary hover:underline">Register here</Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      );
    };

    export default LoginPage;
  