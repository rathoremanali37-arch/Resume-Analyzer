import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PublicOnlyRoute } from '@/components/PublicOnlyRoute';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { HomePage } from '@/pages/HomePage';
import { DashboardPage } from '@/pages/DashboardPage';
import { InterviewPage } from '@/pages/InterviewPage';
import { AboutPage } from '@/pages/AboutPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Default entry: if signed in → home, if not → login */}
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* Public landing page */}
          <Route path="/about" element={<AboutPage />} />

          {/* Auth pages — redirect to home if already signed in */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicOnlyRoute>
                <SignupPage />
              </PublicOnlyRoute>
            }
          />

          {/* Protected: requires a valid session */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analyze"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview"
            element={
              <ProtectedRoute>
                <InterviewPage />
              </ProtectedRoute>
            }
          />

          {/* Legacy redirect */}
          <Route path="/dashboard" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
