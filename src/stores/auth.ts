import { defineStore } from 'pinia'
import { ref } from 'vue'
import authService, { type RequestOtpData, type VerifyOtpData, type ChangePasswordData } from '../services/authService'
import type { ApiUser, ApiAxiosError } from '../types/api'
import { AUTH_CONFIG } from '../config/api'
import router from '../router'
import { useNotificationStore } from './notifications'

export interface Permission {
  id: string
  slug: string
  nom: string
  description?: string
}

export interface Role {
  id: string
  slug: string
  nom: string
  description?: string
  permissions: Permission[]
}

export interface User {
  id: string
  email: string | null
  telephone: string | null
  nom_utilisateur: string
  type: string // Le type de l'utilisateur depuis l'API (ADMIN, ECOLE, etc.)
  role: Role // Le rôle avec ses permissions depuis l'API
  roleSlug?: string // Le slug du rôle pour compatibilité
  doit_changer_mot_de_passe: boolean
  mot_de_passe_change: boolean
  created_at?: string
}

/**
 * Mapper le type utilisateur de l'API vers les rôles de l'interface
 *
 * Types possibles du backend:
 * - ADMIN -> admin
 * - USER -> user
 * - ECOLE -> ecole
 * - TECHNICIEN -> technicien
 */
const mapUserTypeToRole = (type: string): string => {
  const typeMapping: { [key: string]: string } = {
    'ADMIN': 'admin',
    'USER': 'user',
    'ECOLE': 'ecole',
    'TECHNICIEN': 'technicien',
  }

  const mappedRole = typeMapping[type.toUpperCase()] || 'user'
  console.log('Mapping type:', type, 'to role:', mappedRole)
  return mappedRole
}

/**
 * Transformer les données utilisateur de l'API vers le format frontend
 */
const transformApiUser = (apiUser: ApiUser): User => {
  return {
    id: apiUser.id,
    email: apiUser.email,
    telephone: apiUser.telephone,
    nom_utilisateur: apiUser.nom_utilisateur,
    type: apiUser.type,
    role: apiUser.role || { id: '', slug: mapUserTypeToRole(apiUser.type), nom: '', permissions: [] },
    roleSlug: apiUser.role?.slug || mapUserTypeToRole(apiUser.type),
    doit_changer_mot_de_passe: apiUser.doit_changer_mot_de_passe || false,
    mot_de_passe_change: apiUser.mot_de_passe_change || false,
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const otpRequested = ref(false)
  const phoneNumber = ref<string>('')

  /**
   * Initialize auth state from localStorage
   */
  const initAuth = () => {
    const token = localStorage.getItem(AUTH_CONFIG.tokenKey)
    const savedUser = localStorage.getItem(AUTH_CONFIG.userKey)

    if (token && savedUser) {
      try {
        user.value = JSON.parse(savedUser)
        isAuthenticated.value = true
      } catch (e) {
        console.error('Failed to parse saved user:', e)
        clearAuth()
      }
    }
  }

  /**
   * Clear authentication data
   */
  const clearAuth = () => {
    localStorage.removeItem(AUTH_CONFIG.tokenKey)
    localStorage.removeItem(AUTH_CONFIG.userKey)
    user.value = null
    isAuthenticated.value = false
    otpRequested.value = false
    phoneNumber.value = ''
  }

  /**
   * Request OTP code for phone authentication
   */
  const requestOtp = async (data: RequestOtpData) => {
    loading.value = true
    error.value = null

    try {
      const response = await authService.requestOtp(data)

      if (response.success) {
        otpRequested.value = true
        phoneNumber.value = data.telephone
        const notificationStore = useNotificationStore()
        notificationStore.success('Code OTP envoyé', response.message)
        return { success: true, message: response.message }
      } else {
        error.value = response.message
        const notificationStore = useNotificationStore()
        notificationStore.error('Erreur', response.message)
        return { success: false, message: response.message }
      }
    } catch (err) {
      const axiosError = err as ApiAxiosError
      const message = axiosError.response?.data?.message || 'Erreur lors de la demande OTP'
      error.value = message
      const notificationStore = useNotificationStore()
      notificationStore.error('Erreur', message)
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Verify OTP code and authenticate user
   */
  const verifyOtp = async (data: VerifyOtpData) => {
    loading.value = true
    error.value = null

    try {
      const response = await authService.verifyOtp(data)
      console.log('VerifyOtp response:', response)

      if (response.success && response.data) {
        // Save token first
        if (response.data.access_token) {
          localStorage.setItem(AUTH_CONFIG.tokenKey, response.data.access_token)
          console.log('Token saved:', response.data.access_token)
        }

        // Fetch complete user data with permissions from /api/auth/me
        let userLoaded = false
        try {
          console.log('About to call fetchUser()...')
          await fetchUser()
          userLoaded = true
          console.log('fetchUser() completed. User loaded from /me:', user.value)
          console.log('Token still in localStorage?', localStorage.getItem(AUTH_CONFIG.tokenKey))
        } catch (meError) {
          console.error('CATCH: Error fetching user details from /me:', meError)
          // Si échec, utiliser les données de base
          if (response.data.user) {
            console.log('Using fallback: response.data.user:', response.data.user)
            const transformedUser = transformApiUser(response.data.user)
            user.value = transformedUser
            localStorage.setItem(AUTH_CONFIG.userKey, JSON.stringify(transformedUser))
            isAuthenticated.value = true
            userLoaded = true
            console.log('User loaded from OTP response (fallback):', user.value)
          } else {
            console.error('No user data in OTP response!', response.data)
          }
        }

        if (!userLoaded) {
          error.value = 'Erreur lors du chargement des données utilisateur'
          return { success: false, message: 'Erreur lors du chargement des données utilisateur' }
        }

        // Reset OTP state
        otpRequested.value = false
        phoneNumber.value = ''

        // Show success notification
        const notificationStore = useNotificationStore()
        notificationStore.success('Connexion réussie', 'Bienvenue dans votre espace')

        console.log('=== BEFORE REDIRECT ===')
        console.log('user.value:', user.value)
        console.log('isAuthenticated.value:', isAuthenticated.value)
        console.log('Token in localStorage:', localStorage.getItem(AUTH_CONFIG.tokenKey))
        console.log('User in localStorage:', localStorage.getItem(AUTH_CONFIG.userKey))
        console.log('About to redirect to /dashboard...')

        // Redirect to dashboard
        await router.push('/dashboard')

        console.log('=== AFTER REDIRECT ===')
        console.log('Current route:', router.currentRoute.value.path)

        return { success: true, message: response.message }
      } else {
        error.value = response.message
        return { success: false, message: response.message }
      }
    } catch (err) {
      const axiosError = err as ApiAxiosError
      const message = axiosError.response?.data?.message || 'Code OTP invalide'
      error.value = message
      const notificationStore = useNotificationStore()
      notificationStore.error('Erreur de connexion', message)
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Login with email and password (alternative method)
   */
  const login = async (email: string, password: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await authService.login({ email, password })

      if (response.success && response.data) {
        // Save token first
        if (response.data.access_token) {
          localStorage.setItem(AUTH_CONFIG.tokenKey, response.data.access_token)
        }

        // Fetch complete user data with permissions from /api/auth/me
        try {
          await fetchUser()
        } catch (meError) {
          console.error('Error fetching user details:', meError)
          // Si échec, utiliser les données de base
          if (response.data.user) {
            const transformedUser = transformApiUser(response.data.user)
            user.value = transformedUser
            localStorage.setItem(AUTH_CONFIG.userKey, JSON.stringify(transformedUser))
            isAuthenticated.value = true
          }
        }

        // Redirect to dashboard
        router.push('/dashboard')

        return { success: true, message: response.message }
      } else {
        error.value = response.message
        return { success: false, message: response.message }
      }
    } catch (err) {
      const axiosError = err as ApiAxiosError
      const message = axiosError.response?.data?.message || 'Erreur de connexion'
      error.value = message
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch current user data
   */
  const fetchUser = async () => {
    loading.value = true
    error.value = null

    try {
      const token = localStorage.getItem(AUTH_CONFIG.tokenKey)
      console.log('=== fetchUser() START ===')
      console.log('Fetching user from /api/auth/me...')
      console.log('Current token:', token)
      console.log('Token length:', token?.length)
      console.log('Token starts with:', token?.substring(0, 20) + '...')

      const userData = await authService.me()
      console.log('✓ /me request succeeded!')
      console.log('Raw response from /me:', userData)

      // L'API me() peut retourner directement l'utilisateur ou dans data
      const apiUser = userData.data || userData
      console.log('apiUser extracted:', apiUser)
      console.log('apiUser.type:', apiUser?.type)
      console.log('apiUser.role:', apiUser?.role)

      const transformedUser = transformApiUser(apiUser)
      console.log('transformedUser:', transformedUser)
      console.log('transformedUser.roleSlug:', transformedUser.roleSlug)

      user.value = transformedUser
      console.log('user.value after assignment:', user.value)
      console.log('user.value is null?', user.value === null)

      localStorage.setItem(AUTH_CONFIG.userKey, JSON.stringify(transformedUser))
      isAuthenticated.value = true
      console.log('✓ User successfully loaded and saved. isAuthenticated:', isAuthenticated.value)
      console.log('=== fetchUser() END SUCCESS ===')
      return { success: true }
    } catch (err) {
      const axiosError = err as ApiAxiosError
      console.error('=== fetchUser() ERROR ===')
      console.error('Error type:', axiosError.name)
      console.error('Error message:', axiosError.message)
      console.error('HTTP Status:', axiosError.response?.status)
      console.error('Error response data:', axiosError.response?.data)
      console.error('Full error:', axiosError)

      const message = axiosError.response?.data?.message || 'Erreur lors du chargement du profil'
      error.value = message

      // NE PAS appeler clearAuth() ici car on est en train de se connecter
      throw err // Lancer l'erreur pour que le appelant puisse gérer
    } finally {
      loading.value = false
    }
  }

  /**
   * Logout current user
   */
  const logout = async () => {
    loading.value = true

    try {
      await authService.logout()
      const notificationStore = useNotificationStore()
      notificationStore.info('Déconnexion', 'À bientôt!')
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      clearAuth()
      router.push('/login')
      loading.value = false
    }
  }

  /**
   * Change password
   */
  const changerMotDePasse = async (data: ChangePasswordData) => {
    loading.value = true
    error.value = null

    try {
      const response = await authService.changerMotDePasse(data)

      if (response.success) {
        return { success: true, message: response.message }
      } else {
        error.value = response.message
        return { success: false, message: response.message }
      }
    } catch (err) {
      const axiosError = err as ApiAxiosError
      const message = axiosError.response?.data?.message || 'Erreur lors du changement de mot de passe'
      error.value = message
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  // Initialize auth state on store creation
  initAuth()

  return {
    user,
    isAuthenticated,
    loading,
    error,
    otpRequested,
    phoneNumber,
    requestOtp,
    verifyOtp,
    login,
    logout,
    fetchUser,
    changerMotDePasse
  }
})
