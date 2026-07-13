import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// Common
import Navbar from './components/common/Navbar.jsx';
import Footer from './components/common/Footer.jsx';
import Disclaimer from './components/common/Disclaimer.jsx';

// Pages
import Home from './pages/Home.jsx';
import Search from './pages/Search.jsx';
import Details from './pages/Details.jsx';
import Compare from './pages/Compare.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Profile from './pages/Profile.jsx';
import Saved from './pages/Saved.jsx';
import About from './pages/About.jsx';
import Privacy from './pages/Privacy.jsx';
import Terms from './pages/Terms.jsx';
import NotFound from './pages/NotFound.jsx';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminReports from './pages/admin/AdminReports.jsx';
import AdminReviews from './pages/admin/AdminReviews.jsx';
import AdminProfiles from './pages/admin/AdminProfiles.jsx';

// API
import { api, useGetProfileQuery } from './app/api.js';
import { setCredentials, logOut } from './features/auth/authSlice.js';

// Route guards
const ProtectedRoute = ({ children }) => {
  const token = useSelector((state) => state.auth.token);
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  if (!token || user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const dispatch = useDispatch();

  // Session Bootstrapper: Perform silent refresh on app startup
  useEffect(() => {
    const bootstrapSession = async () => {
      try {
        const result = await dispatch(
          api.endpoints.refresh.initiate(undefined, { forceRefetch: true })
        ).unwrap();
        
        if (result?.success) {
          dispatch(
            setCredentials({
              token: result.data.token,
              user: result.data.user
            })
          );
        }
      } catch (err) {
        dispatch(logOut());
      }
    };
    bootstrapSession();
  }, [dispatch]);

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
        <Navbar />
        <Disclaimer />

        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/hospitals/:source/:hospitalId" element={<Details />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />

            {/* Protected User Routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/saved"
              element={
                <ProtectedRoute>
                  <Saved />
                </ProtectedRoute>
              }
            />

            {/* Admin Portal Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <AdminRoute>
                  <AdminReports />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/reviews"
              element={
                <AdminRoute>
                  <AdminReviews />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/profiles"
              element={
                <AdminRoute>
                  <AdminProfiles />
                </AdminRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
