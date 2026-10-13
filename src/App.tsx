// src/App.tsx
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import Signup from './components/Signup';

// NEW IMPORT
import CreateWasiyyah from './components/CreateWasiyyah';

// ... (Your wrappers remain exactly the same)
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isValid, user } = useAuth();
  if (!isValid) return <Navigate to="/login" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin/claims" replace />;
  return children;
};

const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isValid } = useAuth();
  if (!isValid || user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

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
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<RootRoute />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Investor Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/manage" element={<ProtectedRoute><NominationList /></ProtectedRoute>} />
              <Route path="/user/claim" element={<ProtectedRoute><ReportClaim /></ProtectedRoute>} />

              {/* NEW: 6-Step Wasiyyah Route */}
              <Route
                path="/wasiyyah/create"
                element={<ProtectedRoute><CreateWasiyyah /></ProtectedRoute>}
              />

              {/* Admin Routes */}
              <Route path="/admin/claims" element={<AdminRoute><AdminClaimsDashboard /></AdminRoute>} />
              <Route path="/admin/approvals" element={<AdminRoute><AdminApprovals /></AdminRoute>} />

              <Route path="*" element={<RootRoute />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;