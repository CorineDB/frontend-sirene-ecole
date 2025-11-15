import { ref } from 'vue'
import { useNotificationStore } from '../stores/notifications'
import type { ApiAxiosError } from '../types/api'

/**
 * Composable pour gérer les actions asynchrones avec gestion d'erreur standardisée
 * Réduit la duplication de code pour les patterns try/catch/finally
 */
export function useAsyncAction() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const notificationStore = useNotificationStore()

  /**
   * Exécute une fonction asynchrone avec gestion automatique des erreurs
   * @param fn - La fonction asynchrone à exécuter
   * @param errorTitle - Titre de la notification d'erreur (défaut: "Erreur")
   * @param errorMessage - Message d'erreur par défaut si non fourni par l'API
   * @param showNotification - Afficher une notification en cas d'erreur (défaut: true)
   * @returns Le résultat de la fonction ou undefined en cas d'erreur
   */
  const execute = async <T>(
    fn: () => Promise<T>,
    options: {
      errorTitle?: string
      errorMessage?: string
      showNotification?: boolean
    } = {}
  ): Promise<T | undefined> => {
    const {
      errorTitle = 'Erreur',
      errorMessage = 'Une erreur est survenue',
      showNotification = true
    } = options

    loading.value = true
    error.value = null

    try {
      const result = await fn()
      return result
    } catch (err) {
      const axiosError = err as ApiAxiosError
      const message = axiosError.response?.data?.message || errorMessage
      error.value = message

      if (showNotification) {
        notificationStore.error(errorTitle, message)
      }

      console.error(`${errorTitle}:`, axiosError)
      return undefined
    } finally {
      loading.value = false
    }
  }

  /**
   * Réinitialise l'état d'erreur
   */
  const clearError = () => {
    error.value = null
  }

  return {
    loading,
    error,
    execute,
    clearError
  }
}
