import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import DashboardLayout from './layouts/DashboardLayout';
import SharePage from './pages/SharePage';
import EventsPage from './pages/EventsPage';
import ExplorePage from './pages/ExplorePage';

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard/posts" replace />} />
          <Route
            path="/dashboard/*"
            element={
              <DashboardLayout>
                <Routes>
                  <Route path="posts" element={<SharePage />} />
                  <Route path="events" element={<EventsPage />} />
                  <Route path="explore" element={<ExplorePage />} />
                  <Route index element={<Navigate to="posts" replace />} />
                </Routes>
              </DashboardLayout>
            }
          />
        </Routes>
      </Router>
    </AppProvider>
  );
}