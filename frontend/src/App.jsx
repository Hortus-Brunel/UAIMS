import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { PageLoader } from './components/UI';

import AppLayout from './layouts/AppLayout';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Protected Pages
import Dashboard from './pages/Dashboard';
import Announcements from './pages/Announcements';
import AnnouncementDetail from './pages/AnnouncementDetail';
import CreateEditAnnouncement from './pages/CreateAnnouncement';
import Bookmarks from './pages/Bookmarks';
import Notifications from './pages/Notifications';
import Moderation from './pages/Moderation';
import UserManagement from './pages/UserManagement';
import Categories from './pages/Categories';
import Analytics from './pages/Analytics';
import AuditLogs from './pages/AuditLogs';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import About from './pages/About';

function ProtectedRoute({ children, minLevel }) {
  const { user, loading, hasLevel } = useAuth();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;

  if (minLevel && !hasLevel(minLevel)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  const { loading } = useAuth();

  if (loading) return <PageLoader />;

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Main app layout protected routes */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
        <Route path="/announcements/:id" element={<ProtectedRoute><AnnouncementDetail /></ProtectedRoute>} />
        <Route path="/announcements/:id/edit" element={<ProtectedRoute minLevel="L1_REP"><CreateEditAnnouncement /></ProtectedRoute>} />
        <Route path="/create" element={<ProtectedRoute minLevel="L1_REP"><CreateEditAnnouncement /></ProtectedRoute>} />
        <Route path="/bookmarks" element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/about" element={<About />} />

        {/* Admins & Moderators */}
        <Route path="/moderation" element={<ProtectedRoute minLevel="L2_DEPT_ADMIN"><Moderation /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute minLevel="L2_DEPT_ADMIN"><UserManagement /></ProtectedRoute>} />
        <Route path="/categories" element={<ProtectedRoute minLevel="L2_DEPT_ADMIN"><Categories /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute minLevel="L3_FACULTY_ADMIN"><Analytics /></ProtectedRoute>} />
        <Route path="/audit" element={<ProtectedRoute minLevel="L4_UNIVERSITY_ADMIN"><AuditLogs /></ProtectedRoute>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
