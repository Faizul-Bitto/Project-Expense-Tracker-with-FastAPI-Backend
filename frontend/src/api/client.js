import axios from 'axios'
import { logger } from '../utils/logger'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

const MODULE = 'API'

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    logger.info(MODULE, `📤 ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    logger.error(MODULE, `📤 Request Failed: ${error.message}`)
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  (response) => {
    logger.success(MODULE, `📥 ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`)
    return response
  },
  (error) => {
    const status = error.response?.status
    const detail = error.response?.data?.detail || error.message
    logger.error(MODULE, `📥 ${status || 'NETWORK ERROR'} ${error.config?.method?.toUpperCase()} ${error.config?.url}`, { status, detail })
    if (status === 401) {
      const currentPath = window.location.pathname
      if (currentPath !== '/login' && currentPath !== '/register' &&
          currentPath !== '/forgot-password' && currentPath !== '/verify-otp' &&
          currentPath !== '/reset-password') {
        logger.warn(MODULE, '🔐 401 — clearing auth')
        localStorage.removeItem('access_token')
        localStorage.removeItem('user_role')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient