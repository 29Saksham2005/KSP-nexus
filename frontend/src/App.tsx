import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { MainLayout } from './layouts/MainLayout';
import { MissionControl } from './modules/MissionControl/MissionControl';
import { GeoIntelligence } from './modules/GeoIntelligence/GeoIntelligence';
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Initializing KSP NEXUS...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Wrap the protected content in our 3-Region Layout
  return <MainLayout>{children}</MainLayout>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <MissionControl />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/geo" 
            element={
              <ProtectedRoute>
                <GeoIntelligence />
              </ProtectedRoute>
            } 
          />
          
          {/* Default redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;