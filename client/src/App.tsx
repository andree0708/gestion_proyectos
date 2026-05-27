import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateListing from './pages/CreateListing';
import EditListing from './pages/EditListing';
import Catalog from './pages/Catalog';
import ListingDetail from './pages/ListingDetail';
import Orders from './pages/Orders';
import Payments from './pages/Payments';
import Offers from './pages/Offers';
import Messages from './pages/Messages';
import ModerationPanel from './pages/ModerationPanel';
import { useAuthStore } from './hooks/useAuth';
import { useEffect } from 'react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  useEffect(() => {
    if (!isLoading) useAuthStore.getState().checkAuth();
  }, []);
  if (isLoading) return <div className="p-8">Cargando...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/catalog" replace />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/catalog/:id" element={<ListingDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/listings/create" element={<ProtectedRoute><CreateListing /></ProtectedRoute>} />
        <Route path="/listings/edit/:id" element={<ProtectedRoute><EditListing /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
        <Route path="/offers" element={<ProtectedRoute><Offers /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/moderation" element={<ProtectedRoute><ModerationPanel /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
