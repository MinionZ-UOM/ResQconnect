
    import React from 'react';
    import { Outlet, Link, useNavigate } from 'react-router-dom';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button.jsx';
    import { LogOut, User, ShieldAlert, Home, MessageSquare, ListChecks, BarChart3, Settings } from 'lucide-react';
    import { useAuth } from '@/contexts/AuthContext.jsx';
    import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.jsx";
    import {
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuLabel,
      DropdownMenuSeparator,
      DropdownMenuTrigger,
    } from "@/components/ui/dropdown-menu.jsx";

    const AppHeader = () => {
      const { user, logout } = useAuth();
      const navigate = useNavigate();

      const handleLogout = () => {
        logout();
        navigate('/login');
      };

      return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <ShieldAlert className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">ResQLink</span>
            </Link>
            <div className="flex items-center space-x-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatar || `https://avatar.vercel.sh/${user.email || user.id}.png`} alt={user.name || "User"} />
                        <AvatarFallback>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name || "User"}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email || "No email"}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      <ListChecks className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/communication')}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <span>Messages</span>
                    </DropdownMenuItem>
                    {user.role === 'government_help_centre' && (
                       <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        <span>Admin Panel</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigate('/login')}>Login</Button>
                  <Button onClick={() => navigate('/register')}>Register</Button>
                </>
              )}
            </div>
          </div>
        </header>
      );
    };
    
    const AppFooter = () => {
      return (
        <footer className="border-t bg-muted/40">
          <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
            <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
              <ShieldAlert className="h-6 w-6 text-primary" />
              {/* <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                Built by AI for effective disaster response.
                © {new Date().getFullYear()} ResQLink. All rights reserved.
              </p> */}
            </div>
             <p className="text-center text-sm text-muted-foreground">
                Version 0.0.1
             </p>
          </div>
        </footer>
      );
    };

    const MainLayout = () => {
      return (
        <div className="flex min-h-screen flex-col">
          <AppHeader />
          <main className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="container py-8"
            >
              <Outlet />
            </motion.div>
          </main>
          <AppFooter />
        </div>
      );
    };
    
    export default MainLayout;
  