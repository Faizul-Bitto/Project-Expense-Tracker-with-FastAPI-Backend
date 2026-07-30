import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import VerifyOTPPage from './pages/auth/VerifyOTPPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import { UserRoutes } from './routes/UserRoutes'
import { AdminRoutes } from './routes/AdminRoutes'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-otp" element={<VerifyOTPPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* User routes */}
        <Route path="/" element={UserRoutes.element}>
          {UserRoutes.children.map((child) => (
            <Route key={child.path || 'index'} {...child} />
          ))}
        </Route>

        {/* Admin routes */}
        <Route path="/admin" element={AdminRoutes.element}>
          {AdminRoutes.children.map((child) => (
            <Route key={child.path || 'index'} {...child} />
          ))}
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App