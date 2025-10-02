// src/App.js
import React, { useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import useStore from './context/store';
import ErrorBoundary from './components/common/ErrorBoundary';
import Navbar from './components/common/Navbar';

// pages
import Auth from './pages/Auth';
import AssistantAuth from './pages/AssistantAuth';
import AdminDashboard from './pages/AdminDashboard';
import StudentManagement from './pages/StudentManagement';
import AttendanceReport from './pages/AttendanceReport';
import PaymentManagement from './pages/PaymentManagement'; // ← added
import AssistantProfile from './pages/AssistantProfile';

import theme from './theme';

export default function App() {
  const { token, role, setAuth } = useStore();

  // Rehydrate token & role from localStorage on app load
  useEffect(() => {
    const t = localStorage.getItem('token');
    const r = localStorage.getItem('role');
    if (t && r) setAuth(t, r);
  }, [setAuth]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <Router>
          <Navbar />

          <Routes>
            {/* Public */}
            <Route path="/" element={<Auth />} />

            {/* Assistant login */}
            <Route path="/assistants" element={<AssistantAuth />} />

            {/* Admin-only */}
            {token && role === 'admin' && (
              <Route path="/dashboard" element={<AdminDashboard />} />
            )}

            {/* Assistant-only */}
{token && (role === 'assistant' || role === 'admin') && (
              <>
                <Route path="/students" element={<StudentManagement />} />
                <Route
                  path="/attendance/report"
                  element={<AttendanceReport />}
                />
                <Route path="/payments" element={<PaymentManagement />} />
                <Route
                  path="/assistant/profile"
                  element={<AssistantProfile />}
                />
              </>
            )}

            {/* Fallback based on role */}
            <Route
              path="*"
              element={
                token ? (
                  role === 'admin' ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <Navigate to="/students" replace />
                  )
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
          </Routes>
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
