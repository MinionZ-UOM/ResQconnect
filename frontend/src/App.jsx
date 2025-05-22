import React from 'react';
    import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
    import { Toaster } from '@/components/ui/toaster';
    import { AuthProvider, useAuth } from '@/contexts/AuthContext';
    import { DataProvider } from '@/contexts/DataContext';
    
    import MainLayout from '@/layouts/MainLayout';
    import HomePage from '@/pages/HomePage';
    import LoginPage from '@/pages/LoginPage';
    import RegisterPage from '@/pages/RegisterPage';
    import DashboardPage from '@/pages/DashboardPage';
    import SubmitRequestPage from '@/pages/SubmitRequestPage';
    import ReportObservationPage from '@/pages/ReportObservationPage';
    import TaskDetailsPage from '@/pages/TaskDetailsPage';
    import CommunicationHubPage from '@/pages/CommunicationHubPage';
    import AdminDashboardPage from '@/pages/AdminDashboardPage';
    import NotFoundPage from '@/pages/NotFoundPage';
    import EventsPage from '@/pages/EventsPage';

    const ProtectedRoute = ({ children, roles }) => {
      const { user, loading } = useAuth();
    
      if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
      }
    
      if (!user) {
        return <Navigate to="/login" replace />;
      }
    
      if (roles && !roles.includes(user.role)) {
        // If a specific event dashboard is intended, let it handle its own access/redirect
        if (window.location.pathname.startsWith('/dashboard/event/')) {
           return children;
        }
        return <Navigate to="/events" replace />; 
      }
    
      return children;
    };

    function AppRoutes() {
      return (
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            <Route 
              path="/events" 
              element={
                <ProtectedRoute roles={['first_responder', 'volunteer', 'affected_individual', 'government_help_centre']}>
                  <EventsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/event/:eventId" 
              element={
                <ProtectedRoute roles={['first_responder', 'volunteer', 'affected_individual', 'government_help_centre']}>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
             {/* Fallback for generic /dashboard to redirect to events page or a default event */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute roles={['first_responder', 'volunteer', 'affected_individual', 'government_help_centre']}>
                  <Navigate to="/events" replace />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/submit-request/:eventId" 
              element={
                <ProtectedRoute roles={['affected_individual', 'volunteer']}>
                  <SubmitRequestPage />
                </ProtectedRoute>
              } 
            />
             <Route 
              path="/submit-request" 
              element={ /* Default if no eventId, maybe redirect or show event selector */
                <ProtectedRoute roles={['affected_individual', 'volunteer']}>
                   <Navigate to="/events" replace />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/report-observation/:eventId" 
              element={
                <ProtectedRoute roles={['volunteer', 'first_responder']}>
                  <ReportObservationPage />
                </ProtectedRoute>
              } 
            />
             <Route 
              path="/report-observation" 
              element={ /* Default if no eventId */
                <ProtectedRoute roles={['volunteer', 'first_responder']}>
                  <Navigate to="/events" replace />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/task/:eventId/:taskId" 
              element={
                <ProtectedRoute roles={['first_responder', 'volunteer']}>
                  <TaskDetailsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/communication/:eventId" 
              element={
                <ProtectedRoute roles={['first_responder', 'volunteer', 'affected_individual', 'government_help_centre']}>
                  <CommunicationHubPage />
                </ProtectedRoute>
              } 
            />
             <Route 
              path="/communication" 
              element={ 
                <ProtectedRoute roles={['first_responder', 'volunteer', 'affected_individual', 'government_help_centre']}>
                  <Navigate to="/events" replace />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute roles={['government_help_centre']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      );
    }
    
    function App() {
      return (
        <AuthProvider>
          <DataProvider>
            <Router>
              <AppRoutes />
              <Toaster />
            </Router>
          </DataProvider>
        </AuthProvider>
      );
    }
    
    export default App;