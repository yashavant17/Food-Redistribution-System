import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import DonorDashboard from './pages/DonorDashboard';
import NgoDashboard from './pages/NgoDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import DashboardLayout from './layouts/DashboardLayout';
import RatingModal from './components/ratings/RatingModal';
import './styles/index.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to appropriate dashboard
    switch (user?.role) {
      case 'admin': return <Navigate to="/admin/dashboard" replace />;
      case 'ngo': 
      case 'volunteer': return <Navigate to="/ngo/dashboard" replace />;
      case 'donor':
      case 'restaurant': return <Navigate to="/donor/dashboard" replace />;
      default: return <Navigate to="/donor/dashboard" replace />;
    }
  }

  return children;
};

// Public Route - redirects to dashboard if already logged in
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  if (isAuthenticated) {
    switch (user?.role) {
      case 'admin': return <Navigate to="/admin/dashboard" replace />;
      case 'ngo': 
      case 'volunteer': return <Navigate to="/ngo/dashboard" replace />;
      case 'donor':
      case 'restaurant': return <Navigate to="/donor/dashboard" replace />;
      default: return <Navigate to="/donor/dashboard" replace />;
    }
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Donor Routes */}
      <Route path="/donor/*" element={
        <ProtectedRoute allowedRoles={['donor', 'restaurant']}>
          <DashboardLayout>
            <Routes>
              <Route path="dashboard" element={<DonorDashboard />} />
              <Route path="add-donation" element={<DonorDashboard />} />
              <Route path="my-donations" element={<DonorDashboard />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </DashboardLayout>
        </ProtectedRoute>
      } />

      {/* NGO Routes */}
      <Route path="/ngo/*" element={
        <ProtectedRoute allowedRoles={['ngo', 'volunteer']}>
          <DashboardLayout>
            <Routes>
              <Route path="dashboard" element={<NgoDashboard />} />
              <Route path="available" element={<NgoDashboard />} />
              <Route path="accepted" element={<NgoDashboard />} />
              <Route path="map" element={<NgoDashboard />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin/*" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <DashboardLayout>
            <Routes>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminDashboard />} />
              <Route path="donations" element={<AdminDashboard />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </DashboardLayout>
        </ProtectedRoute>
      } />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function GlobalRatingModal() {
  const { ratingModal, setRatingModal } = useAuth();
  
  if (!ratingModal) return null;

  const handleClose = () => {
    if (ratingModal.onClose) ratingModal.onClose();
    setRatingModal(null);
  };

  const handleSubmitted = () => {
    if (ratingModal.onSubmitted) ratingModal.onSubmitted();
    setRatingModal(null);
  };
  
  return (
    <RatingModal
      donation={ratingModal.donation}
      rateTarget={ratingModal.rateTarget}
      onClose={handleClose}
      onSubmitted={handleSubmitted}
    />
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
              borderRadius: '8px',
              fontSize: '14px',
            },
            success: {
              style: { background: '#2E7D32' },
              iconTheme: { primary: 'white', secondary: '#2E7D32' },
            },
            error: {
              style: { background: '#D32F2F' },
              iconTheme: { primary: 'white', secondary: '#D32F2F' },
            },
          }}
        />
        <AppRoutes />
        <GlobalRatingModal />
      </AuthProvider>
    </Router>
  );
}

export default App;
