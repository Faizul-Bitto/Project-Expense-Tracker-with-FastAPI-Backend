import { createContext, useState, useEffect, useCallback } from 'react'
import { usersApi } from '../api/users.api'
import { authApi } from '../api/auth.api'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem('access_token')
  const isAuthenticated = !!token
  const isAdmin = localStorage.getItem('user_role') === 'admin'

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    let cancelled = false
    usersApi.getProfile()
      .then((res) => {
        if (!cancelled) {
          const userData = res.data.user
          setUser(userData)
          localStorage.setItem('user_role', userData.role)
        }
      })
      .catch(() => {
        if (!cancelled) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('user_role')
          setUser(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const login = useCallback(async (credentials) => {
    // Clear any old/broken token before trying to log in
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_role')

    const res = await authApi.login(credentials)
    const { access_token } = res.data

    if (!access_token) {
      throw new Error('No access token received')
    }

    localStorage.setItem('access_token', access_token)

    // Fetch profile to get user info and role
    const profileRes = await usersApi.getProfile()
    const userData = profileRes.data.user

    if (!userData) {
      throw new Error('No user data received from profile')
    }

    setUser(userData)
    localStorage.setItem('user_role', userData.role)
    return userData
  }, [])

  const register = useCallback(async (data) => {
    return authApi.register(data)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_role')
    setUser(null)
    window.location.href = '/login'
  }, [])

  const updateUser = useCallback((userData) => {
    setUser(userData)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, isAdmin, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}