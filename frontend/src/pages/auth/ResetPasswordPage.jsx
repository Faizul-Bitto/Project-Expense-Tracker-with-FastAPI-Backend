import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { authApi } from '../../api/auth.api'
import { Lock, KeyRound, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { logger } from '../../utils/logger'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authApi.resetPassword({ email, password })
      logger.success('Auth', `🔐 Password reset successful | Email=${email}`)
      navigate('/login', {
        replace: true,
        state: {
          toastMessage: 'Password reset successfully! Please sign in with your new password.',
          toastType: 'success',
        },
      })
    } catch (err) {
      const msg = err.response?.data?.detail || 'Password reset failed.'
      setError(msg)
      logger.error('Auth', `❌ Password reset failed | Email=${email} | Reason=${msg}`)
    } finally {
      setLoading(false)
    }
  }

  if (!email) {
    navigate('/forgot-password', { replace: true })
    return null
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="hidden sm:block absolute -top-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] animate-pulse" />
        <div className="hidden sm:block absolute -bottom-40 -left-40 w-96 h-96 bg-pink-500/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25 mb-4 ring-1 ring-white/10">
            <KeyRound className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Expense Tracker</h1>
          <h2 className="text-lg font-semibold text-slate-300 mt-4">Reset Password</h2>
          <p className="text-sm text-slate-400 mt-1">Enter your new password</p>
          <p className="text-xs text-slate-500 mt-0.5">For: {email}</p>
        </div>

        <Card className="border-0 bg-slate-900/80 backdrop-blur-sm shadow-2xl ring-1 ring-white/10">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-slate-300 text-xs font-medium">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <Input id="new-password" type={showPassword ? 'text' : 'password'} required minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20"
                    placeholder="At least 6 characters" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={loading || password.length < 6}
                className="w-full h-10 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/20 font-medium">
                <KeyRound className="w-4 h-4 mr-2" />
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>

              <div className="text-center">
                <button type="button" onClick={() => navigate('/login')}
                  className="inline-flex items-center gap-1.5 text-sm text-purple-400 hover:text-purple-300 font-medium transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to login
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}