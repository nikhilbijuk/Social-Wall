import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import DashboardLayout from './layouts/DashboardLayout';
import ExplorePage from './pages/ExplorePage';

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Redirect root path to explore */}
          <Route path="/" element={<Navigate to="/dashboard/explore" replace />} />

          <Route
            path="/dashboard/*"
            element={
              <DashboardLayout>
                <Routes>
                  {/* Redirect old routes to explore */}
                  <Route path="posts" element={<Navigate to="../explore" replace />} />
                  <Route path="events" element={<Navigate to="../explore" replace />} />

                  {/* Main Route */}
                  <Route path="explore" element={<ExplorePage />} />

                  {/* Default Index */}
                  <Route index element={<Navigate to="explore" replace />} />
                </Routes>
              </DashboardLayout>
            }
          />
        </Routes>
      </Router>
    </AppProvider>
  );
}