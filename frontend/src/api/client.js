import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect if we're on login or register page
      const currentPath = window.location.pathname
      if (currentPath !== '/login' && currentPath !== '/register' &&
          currentPath !== '/forgot-password' && currentPath !== '/verify-otp' &&
          currentPath !== '/reset-password') {
        localStorage.removeItem('access_token')
        localStorage.removeItem('user_role')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient