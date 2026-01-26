import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import EventPreviewPage from './pages/EventPreviewPage';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';

import SharePage from './pages/SharePage';
import EventsPage from './pages/EventsPage';
import ExplorePage from './pages/ExplorePage';
import ConnectPage from './pages/ConnectPage';
import ProfilePage from './pages/ProfilePage';
import DocsPage from './pages/DocsPage';
import NotFoundPage from './pages/NotFoundPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
 // const { isAuthenticated } = useApp();
 // if (!isAuthenticated) {
 //   return <Navigate to="/join" />;
  //}
  return <>{children}</>;
}
function MockRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/dashboard/share" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/preview" element={<EventPreviewPage />} />
        <Route path="/docs" element={<DocsPage />} />
        
        {/* Redirect directly to your work */}
        <Route path="/join" element={<Navigate to="/dashboard/share" replace />} />

        {/* The Main Dashboard Structure */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Routes>
                  <Route path="share" element={<SharePage />} />
                  <Route path="events" element={<EventsPage />} />
                  <Route path="explore" element={<ExplorePage />} />
                  <Route path="connect" element={<ConnectPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route index element={<Navigate to="share" replace />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch-all for broken links */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MockRouter />
    </AppProvider>
  );
}