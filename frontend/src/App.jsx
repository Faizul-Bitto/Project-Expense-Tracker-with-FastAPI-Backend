import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { Toaster, toast } from 'sonner'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import VerifyOTPPage from './pages/auth/VerifyOTPPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import { UserRoutes } from './routes/UserRoutes'
import { AdminRoutes } from './routes/AdminRoutes'

function ToastWatcher() {
  const location = useLocation()

  useEffect(() => {
    const state = location.state
    if (state?.toastMessage) {
      const msg = state.toastMessage
      const type = state.toastType || 'success'
      if (type === 'success') {
        toast.success(msg, { duration: 5000 })
      } else if (type === 'error') {
        toast.error(msg, { duration: 5000 })
      } else {
        toast(msg, { duration: 5000 })
      }
      // Clear the state so it doesn't re-fire
      window.history.replaceState({}, document.title)
    }
  }, [location])

  return null
}

function App() {
  useEffect(() => {
    document.title = 'Expense Tracker'
  }, [])

  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastWatcher />
        <Toaster position="top-right" richColors closeButton />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-otp" element={<VerifyOTPPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/" element={UserRoutes.element}>
            {UserRoutes.children.map((child) => (
              <Route key={child.path || 'index'} {...child} />
            ))}
          </Route>
          <Route path="/admin" element={AdminRoutes.element}>
            {AdminRoutes.children.map((child) => (
              <Route key={child.path || 'index'} {...child} />
            ))}
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App