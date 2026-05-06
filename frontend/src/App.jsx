import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Onboarding from './pages/Onboarding';
import Recommendations from './pages/Recommendations';
import CourseDetail from './pages/CourseDetail';
import ChatSearch from './pages/ChatSearch';
import LearningPath from './pages/LearningPath';
import Progress from './pages/Progress';
import Feedback from './pages/Feedback';
import Layout from './components/Layout';

import { useAuth } from './context/AuthContext';

// Robust ProtectedRoute
const ProtectedRoute = ({ children, requireOnboarded = true, showLayout = true }) => {
  const { token, user, loading } = useAuth();
  const onboarded = localStorage.getItem('onboarded') === 'true';
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requireOnboarded && !onboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  // Allow Onboarding page if NOT onboarded
  if (location.pathname === '/onboarding' && onboarded) {
    return <Navigate to="/" replace />;
  }

  return showLayout ? <Layout>{children}</Layout> : children;
};

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Onboarding Flow (Protected but doesn't require onboarded status yet) */}
        <Route 
          path="/onboarding" 
          element={
            <ProtectedRoute requireOnboarded={false} showLayout={false}>
              <Onboarding />
            </ProtectedRoute>
          } 
        />

        {/* Protected Dashboard Routes */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
        <Route 
          path="/course/:id" 
          element={
            <ProtectedRoute showLayout={false}>
              <CourseDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute showLayout={false}>
              <ChatSearch />
            </ProtectedRoute>
          } 
        />
        <Route path="/learning-path" element={<ProtectedRoute><LearningPath /></ProtectedRoute>} />
        <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
        <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
