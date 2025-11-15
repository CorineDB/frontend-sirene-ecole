import { ref } from 'vue'
import sirenService from '@/services/sirenService'
import { useNotificationStore } from '@/stores/notifications'
import { useAsyncAction } from './useAsyncAction'
import type {
  ApiSiren,
  ApiSirenModel,
  CreateSirenRequest,
  UpdateSirenRequest,
} from '@/types/api'

/**
 * Composable pour gérer les sirènes
 * Fournit des méthodes réactives pour interagir avec l'API sirènes
 */
export function useSirens() {
  const sirens = ref<ApiSiren[]>([])
  const sirenModels = ref<ApiSirenModel[]>([])
  const currentSiren = ref<ApiSiren | null>(null)
  const totalSirens = ref(0)
  const currentPage = ref(1)
  const perPage = ref(10)
  const lastPage = ref(1)

  const { loading, error, execute } = useAsyncAction()
  const notificationStore = useNotificationStore()

  /**
   * Charger la liste des sirènes
   */
  const loadSirens = async (params?: {
    page?: number
    per_page?: number
    search?: string
    status?: string
    modele_id?: string
  }) => {
    const result = await execute(() => sirenService.getAllSirens(params), {
      errorTitle: 'Erreur de chargement',
      errorMessage: 'Impossible de charger la liste des sirènes',
    })

    if (result?.success && result.data) {
      sirens.value = result.data.sirens || []
      console.log('✅ Sirènes chargées:', sirens.value.length)

      if (result.data.pagination) {
        currentPage.value = result.data.pagination.current_page
        perPage.value = result.data.pagination.per_page
        lastPage.value = result.data.pagination.last_page
        totalSirens.value = result.data.pagination.total
      } else {
        totalSirens.value = result.data.sirens?.length || 0
      }
    } else {
      console.warn('Aucune sirène chargée - Vérifier la réponse API:', result)
    }

    return result
  }

  /**
   * Charger une sirène par son ID
   */
  const loadSirenById = async (sirenId: string) => {
    const result = await execute(() => sirenService.getSirenById(sirenId), {
      errorTitle: 'Erreur de chargement',
      errorMessage: 'Impossible de charger les détails de la sirène',
    })

    if (result?.success && result.data) {
      currentSiren.value = result.data
    }

    return result
  }

  /**
   * Créer une nouvelle sirène
   */
  const createSiren = async (sirenData: CreateSirenRequest) => {
    const result = await execute(() => sirenService.createSiren(sirenData), {
      errorTitle: 'Erreur de création',
      errorMessage: 'Impossible de créer la sirène',
    })

    if (result?.success) {
      notificationStore.success(
        'Sirène créée',
        'La sirène a été créée avec succès'
      )
      // Recharger la liste après création
      await loadSirens({ page: currentPage.value, per_page: perPage.value })
    }

    return result
  }

  /**
   * Mettre à jour une sirène
   */
  const updateSiren = async (
    sirenId: string,
    sirenData: UpdateSirenRequest
  ) => {
    const result = await execute(
      () => sirenService.updateSiren(sirenId, sirenData),
      {
        errorTitle: 'Erreur de modification',
        errorMessage: 'Impossible de modifier la sirène',
      }
    )

    if (result?.success) {
      notificationStore.success(
        'Sirène modifiée',
        'La sirène a été modifiée avec succès'
      )
      // Recharger la liste après modification
      await loadSirens({ page: currentPage.value, per_page: perPage.value })
    }

    return result
  }

  /**
   * Supprimer une sirène
   */
  const deleteSiren = async (sirenId: string) => {
    const result = await execute(() => sirenService.deleteSiren(sirenId), {
      errorTitle: 'Erreur de suppression',
      errorMessage: 'Impossible de supprimer la sirène',
    })

    if (result?.success) {
      notificationStore.success(
        'Sirène supprimée',
        'La sirène a été supprimée avec succès'
      )
      // Recharger la liste après suppression
      await loadSirens({ page: currentPage.value, per_page: perPage.value })
    }

    return result
  }

  /**
   * Charger la liste des modèles de sirènes
   */
  const loadSirenModels = async (params?: {
    page?: number
    per_page?: number
    search?: string
  }) => {
    const result = await execute(
      () => sirenService.getAllSirenModels(params),
      {
        errorTitle: 'Erreur de chargement',
        errorMessage: 'Impossible de charger la liste des modèles de sirènes',
      }
    )

    if (result?.success && result.data) {
      sirenModels.value = result.data.models || []
      console.log('✅ Modèles de sirènes chargés:', sirenModels.value.length)
    } else {
      console.warn(
        'Aucun modèle de sirène chargé - Vérifier la réponse API:',
        result
      )
    }

    return result
  }

  return {
    // État
    sirens,
    sirenModels,
    currentSiren,
    totalSirens,
    currentPage,
    perPage,
    lastPage,
    loading,
    error,

    // Méthodes
    loadSirens,
    loadSirenById,
    createSiren,
    updateSiren,
    deleteSiren,
    loadSirenModels,
  }
}
