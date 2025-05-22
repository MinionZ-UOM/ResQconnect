
    import React, { useState } from 'react';
    import { Link, useNavigate } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { useToast } from '@/components/ui/use-toast';
    import { useAuth } from '@/contexts/AuthContext';
    import { motion } from 'framer-motion';
    import { UserPlus } from 'lucide-react';

    const RegisterPage = () => {
      const [name, setName] = useState('');
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [confirmPassword, setConfirmPassword] = useState('');
      const [role, setRole] = useState('volunteer'); // Default to volunteer for registration
      const { toast } = useToast();
      const { register } = useAuth(); // Assuming register function in AuthContext
      const navigate = useNavigate();

      const handleSubmit = (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
          toast({
            title: "Registration Failed",
            description: "Passwords do not match.",
            variant: "destructive",
          });
          return;
        }
        if (!name || !email || !password) {
           toast({
            title: "Registration Failed",
            description: "Please fill all fields.",
            variant: "destructive",
          });
          return;
        }

        // Simulate registration
        const success = register({ id: Date.now().toString(), name, email, role });
        if (success) {
          toast({
            title: "Registration Successful",
            description: "You can now log in.",
          });
          navigate('/login');
        } else {
           toast({
            title: "Registration Failed",
            description: "Could not register user. Email might be taken.",
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
          <Card className="w-full max-w-lg shadow-xl">
            <CardHeader className="text-center">
              <UserPlus className="mx-auto h-12 w-12 text-primary mb-2" />
              <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Create an Account</CardTitle>
              <CardDescription>Join ResQLink to help or get help.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="yourname@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Register as</Label>
                  <select 
                    id="role" 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="volunteer">Volunteer</option>
                    <option value="affected_individual">Affected Individual</option>
                    {/* Other roles might require admin approval or different flow */}
                  </select>
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Register</Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col items-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Login here</Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      );
    };

    export default RegisterPage;
  