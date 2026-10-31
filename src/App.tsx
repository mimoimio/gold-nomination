// src/App.tsx
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import { useEffect, type JSX } from 'react';
import './App.css';
import AdminClaimsDashboard from './components/AdminClaimsDashboard';
import ReportClaim from './components/ReportClaim';
import Signup from './components/Signup';
import CreateWasiyyah from './components/CreateWasiyyah';
import pb from './lib/pocketbase';
import WasiClaimAssets from './components/WasiClaimAssets';
import LegalFirmDashboard from './components/LegalFirmDashboard';
import AdminFeeReporting from './components/AdminFeeReporting';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isValid, isAdmin } = useAuth();
  if (!isValid) return <Navigate to="/login" replace />;
  if (isAdmin) return <Navigate to="/admin/claims" replace />;
  return children;
};

const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { isValid, isAdmin } = useAuth();
  if (!isValid || !isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

const RootRoute = () => {
  const { isValid, isAdmin } = useAuth();
  if (!isValid) return <Navigate to="/login" replace />;
  if (isAdmin) return <Navigate to="/admin/claims" replace />;
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
              {/* // Inside your App.tsx <Routes> block: */}

              {/* Public Routes */}
              <Route path="/" element={<RootRoute />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/report-demise" element={<ReportClaim />} /> {/* Moved to Public */}

              {/* User / Pewasiat Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/wasiyyah/create" element={<ProtectedRoute><CreateWasiyyah /></ProtectedRoute>} />
              <Route path="/wasi/claim-assets" element={<ProtectedRoute><WasiClaimAssets /></ProtectedRoute>} />

              {/* Admin Routes */}
              <Route path="/admin/claims" element={<AdminRoute><AdminClaimsDashboard /></AdminRoute>} />
              <Route path="/admin/legal-verification" element={<AdminRoute><LegalFirmDashboard /></AdminRoute>} />
              <Route path="/admin/fee-reporting" element={<AdminRoute><AdminFeeReporting /></AdminRoute>} />

              <Route path="*" element={<RootRoute />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;