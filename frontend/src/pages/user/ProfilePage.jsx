import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { usersApi } from '../../api/users.api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Lock, Save, KeyRound, LogOut, Eye, EyeOff } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth()
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' })
  const [passwordForm, setPasswordForm] = useState({ password: '', new_password: '' })
  const [profileMsg, setProfileMsg] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [error, setError] = useState('')
  const [showReauth, setShowReauth] = useState(false)
  const [reauthMessage, setReauthMessage] = useState('')
  const [showCurrentPwd, setShowCurrentPwd] = useState(false)
  const [showNewPwd, setShowNewPwd] = useState(false)

  const handleReauthConfirm = () => {
    setShowReauth(false)
    logout()
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setError('')
    setProfileMsg('')
    setProfileLoading(true)
    try {
      const res = await usersApi.updateProfile(profileForm)
      updateUser(res.data.user)
      setProfileMsg('Profile updated successfully.')
      toast.success('Profile updated successfully.')
      if (profileForm.email !== user?.email) {
        setReauthMessage('Your email has been changed. Please login again for security purposes.')
        setShowReauth(true)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile')
      toast.error(err.response?.data?.detail || 'Failed to update profile')
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    setError('')
    setPasswordMsg('')
    setPasswordLoading(true)
    try {
      await usersApi.updatePassword(passwordForm)
      toast.success('Password changed successfully. Please login again.')
      setReauthMessage('Your password has been changed successfully. Please login again with your new password.')
      setShowReauth(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update password')
      toast.error(err.response?.data?.detail || 'Failed to update password')
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your account settings</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 dark:bg-red-950/50 dark:border-red-800 rounded-lg px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <Dialog open={showReauth} onOpenChange={setShowReauth}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                <LogOut className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <DialogTitle className="text-lg text-slate-800 dark:text-white">Security Update</DialogTitle>
                <DialogDescription className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {reauthMessage}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-3 mt-4">
            <Button onClick={handleReauthConfirm}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white min-w-[120px]">
              <LogOut className="w-4 h-4 mr-2" /> Login Again
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
              <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <CardTitle className="text-slate-800 dark:text-slate-200">Profile Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700 dark:text-slate-300 text-sm">Name</Label>
              <Input id="name" type="text" required minLength={2}
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 text-sm">Email</Label>
              <Input id="email" type="email" required
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200" />
            </div>
            <Button type="submit" disabled={profileLoading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white">
              <Save className="w-4 h-4 mr-2" />
              {profileLoading ? 'Saving...' : 'Update Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 flex items-center justify-center">
              <Lock className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <CardTitle className="text-slate-800 dark:text-slate-200">Change Password</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password" className="text-slate-700 dark:text-slate-300 text-sm">Current Password</Label>
              <div className="relative">
                <Input id="current-password" type={showCurrentPwd ? 'text' : 'password'} required
                  value={passwordForm.password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                  className="pr-10 border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200" />
                <button type="button" onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  {showCurrentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-slate-700 dark:text-slate-300 text-sm">New Password</Label>
              <div className="relative">
                <Input id="new-password" type={showNewPwd ? 'text' : 'password'} required minLength={6}
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  className="pr-10 border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200" />
                <button type="button" onClick={() => setShowNewPwd(!showNewPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={passwordLoading}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white">
              <KeyRound className="w-4 h-4 mr-2" />
              {passwordLoading ? 'Updating...' : 'Change Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}