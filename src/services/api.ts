import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { API_CONFIG, AUTH_CONFIG } from '../config/api'
import router from '../router'
import { logger } from '../utils/logger'

/**
 * Create Axios instance with default configuration
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers
})

/**
 * Request interceptor to add authentication token
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add JWT token to Authorization header
    const token = localStorage.getItem(AUTH_CONFIG.tokenKey)
    if (token && config.headers) {
      config.headers.Authorization = `${AUTH_CONFIG.tokenPrefix} ${token}`
    }

    // For non-GET requests, attempt to retrieve and set the X-CSRF-Token header
    if (config.method && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
      const csrfTokenMeta = document.querySelector('meta[name="csrf-token"]')
      if (csrfTokenMeta && csrfTokenMeta.getAttribute('content')) {
        config.headers['X-CSRF-TOKEN'] = csrfTokenMeta.getAttribute('content')
      } else {
        logger.warn('CSRF token meta tag not found. CSRF protection might be incomplete.')
      }
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

/**
 * Response interceptor to handle errors globally
 */
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error: AxiosError) => {
    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401) {
      // Check if this is a config with skipAuthRedirect flag (for login flows)
      const config = error.config as InternalAxiosRequestConfig & { skipAuthRedirect?: boolean }

      if (!config?.skipAuthRedirect) {
        // Only clear auth and redirect if not during login flow
        const currentPath = router.currentRoute.value.path
        const isAuthRoute = currentPath.includes('/login') || currentPath.includes('/auth/otp')

        if (!isAuthRoute) {
          logger.debug('401 Error: Clearing auth and redirecting to login')
          localStorage.removeItem(AUTH_CONFIG.tokenKey)
          localStorage.removeItem(AUTH_CONFIG.userKey)
          router.push('/login')
        } else {
          logger.debug('401 Error during auth flow: Not clearing tokens')
        }
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      logger.error('Access forbidden:', error.response.data)
    }

    // Handle 500 Server Error
    if (error.response?.status === 500) {
      logger.error('Server error:', error.response.data)
    }

    return Promise.reject(error)
  }
)

export default apiClient
