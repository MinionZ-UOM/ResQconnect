
    import React, { createContext, useState, useContext, useEffect } from 'react';

    const AuthContext = createContext(null);

    export const AuthProvider = ({ children }) => {
      const [user, setUser] = useState(null);
      const [loading, setLoading] = useState(true);
      const [allUsers, setAllUsers] = useState(() => {
        const storedAllUsers = localStorage.getItem('resqlink_all_users');
        return storedAllUsers ? JSON.parse(storedAllUsers) : [];
      }); 

      useEffect(() => {
        const storedUser = localStorage.getItem('resqlink_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        setLoading(false);
      }, []);

      useEffect(() => {
        localStorage.setItem('resqlink_all_users', JSON.stringify(allUsers));
      }, [allUsers]);

      const login = (userData) => {
        const existingUser = allUsers.find(u => u.email === userData.email);
        
        if (existingUser && existingUser.role === userData.role) {
            setUser(existingUser);
            localStorage.setItem('resqlink_user', JSON.stringify(existingUser));
            return true;
        }
        // Demo specific logins for pre-defined roles if not found in allUsers
        if (!existingUser) {
            let demoUserToLogin = null;
            if (userData.role === 'government_help_centre' && userData.email.startsWith('gov@')) {
                demoUserToLogin = { id: 'gov1', name: 'Admin User', email: userData.email, role: 'government_help_centre', avatar: `https://avatar.vercel.sh/${userData.email}.png` };
            } else if (userData.role === 'first_responder' && userData.email.startsWith('responder@')) {
                 demoUserToLogin = { id: `resp-${Date.now()}`, name: 'Responder Demo', email: userData.email, role: 'first_responder', avatar: `https://avatar.vercel.sh/${userData.email}.png` };
            } else if (userData.role === 'volunteer' || userData.role === 'affected_individual') {
                // For these roles, if not found, create a temp profile for login (less strict for demo)
                demoUserToLogin = { 
                    id: userData.id || `user-${Date.now()}`, 
                    name: userData.name || userData.email.split('@')[0], 
                    email: userData.email, 
                    role: userData.role,
                    avatar: `https://avatar.vercel.sh/${userData.email}.png`
                };
            }

            if (demoUserToLogin) {
                setUser(demoUserToLogin);
                localStorage.setItem('resqlink_user', JSON.stringify(demoUserToLogin));
                // Add to allUsers list if not already there by email
                if (!allUsers.find(u => u.email === demoUserToLogin.email)) {
                    setAllUsers(prev => [...prev, demoUserToLogin]);
                }
                return true;
            }
        }
        return false;
      };

      const register = (userData) => {
        const existingUser = allUsers.find(u => u.email === userData.email);
        if (existingUser) {
          return false; 
        }
        const newUser = { ...userData, id: userData.id || `user-${Date.now()}`, avatar: `https://avatar.vercel.sh/${userData.email}.png` };
        setAllUsers(prev => [...prev, newUser]);
        return true;
      };

      const logout = () => {
        setUser(null);
        localStorage.removeItem('resqlink_user');
      };

      return (
        <AuthContext.Provider value={{ user, users: allUsers, loading, login, logout, register }}>
          {children}
        </AuthContext.Provider>
      );
    };

    export const useAuth = () => useContext(AuthContext);
  