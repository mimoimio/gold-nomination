// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import NominationList from './components/NominationLists';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import { useEffect, type JSX } from 'react';
import './App.css';
import AdminClaimsDashboard from './components/AdminClaimsDashboard';
import pb from './lib/pocketbase';
import ReportClaim from './components/ReportClaim';
import AdminApprovals from './components/AdminApprovals';

// 1. Protected Route Wrapper (For standard investors)
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isValid, user } = useAuth();

  if (!isValid) {
    return <Navigate to="/login" replace />;
  }

  // Prevent Admins from accessing investor-only pages
  if (user?.role === 'admin') {
    return <Navigate to="/admin/claims" replace />;
  }

  return children;
};

// 2. Admin Route Wrapper
const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isValid } = useAuth();

  if (!isValid || user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// 3. Root Redirector
// Intelligently routes the user based on their login state and role
const RootRoute = () => {
  const { isValid, user } = useAuth();

  if (!isValid) return <Navigate to="/login" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin/claims" replace />;

  return <Navigate to="/dashboard" replace />;
};

function App() {
  useEffect(() => {
    if (pb.authStore.isValid) {
      pb.collection('users').authRefresh().catch((err) => {
        console.error("Auth refresh failed:", err);
        pb.authStore.clear();
      });
    }
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background text-foreground flex flex-col">
          {/* The Header now acts as the global Nav component */}
          <Header />

          <main className="flex-1">
            <Routes>
              {/* The Root Route */}
              <Route path="/" element={<RootRoute />} />

              {/* Public Route */}
              <Route path="/login" element={<Login />} />

              {/* Investor Routes */}
              <Route
                path="/dashboard"
                element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
              />
              <Route
                path="/manage"
                element={<ProtectedRoute><NominationList /></ProtectedRoute>}
              />
              <Route
                path="/user/claim"
                element={<ProtectedRoute><ReportClaim /></ProtectedRoute>}
              />

              {/* Admin Routes */}
              <Route
                path="/admin/claims"
                element={<AdminRoute><AdminClaimsDashboard /></AdminRoute>}
              />

              <Route
                path="/admin/approvals"
                element={<AdminRoute><AdminApprovals /></AdminRoute>}
              />

              {/* Default Catch-All */}
              <Route path="*" element={<RootRoute />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;