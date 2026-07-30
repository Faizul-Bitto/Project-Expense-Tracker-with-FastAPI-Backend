import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { authApi } from '../../api/auth.api'
import { ShieldCheck, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

export default function VerifyOTPPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authApi.verifyOTP({ email, otp })
      navigate('/reset-password', { state: { email, otpVerified: true } })
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid or expired OTP.')
    } finally {
      setLoading(false)
    }
  }

  if (!email) {
    navigate('/forgot-password', { replace: true })
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-500/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25 mb-4 ring-1 ring-white/10">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Verify OTP</h1>
          <p className="text-sm text-slate-400 mt-1">Enter the code sent to</p>
          <p className="text-sm font-medium text-purple-300 mt-0.5">{email}</p>
        </div>

        <Card className="border-0 bg-white/5 backdrop-blur-2xl shadow-2xl ring-1 ring-white/10">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-slate-300 text-xs font-medium block text-center">6-Digit OTP Code</Label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full text-center text-3xl tracking-[0.5em] font-bold h-14 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-slate-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition"
                  placeholder="000000"
                  autoFocus
                  inputMode="numeric"
                  autoComplete="one-time-code"
                />
                <p className="text-xs text-slate-500 text-center mt-2">Enter the 6-digit code from your email</p>
              </div>

              <Button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full h-10 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/20 font-medium disabled:opacity-40"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="inline-flex items-center gap-1.5 text-sm text-purple-400 hover:text-purple-300 font-medium transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Try again with a different email
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}