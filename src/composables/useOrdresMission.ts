import { ref, computed } from 'vue'
import ordreMissionService from '@/services/ordreMissionService'
import type {
  ApiOrdreMission,
  ApiMissionTechnicien,
  CreateOrdreMissionRequest
} from '@/types/api'

/**
 * Composable pour la gestion des ordres de mission
 */
export function useOrdresMission() {
  // State
  const ordresMission = ref<ApiOrdreMission[]>([])
  const ordreMission = ref<ApiOrdreMission | null>(null)
  const candidatures = ref<ApiMissionTechnicien[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const hasError = computed(() => error.value !== null)
  const hasOrdresMission = computed(() => ordresMission.value.length > 0)
  const hasCandidatures = computed(() => candidatures.value.length > 0)

  // Helper pour gérer les erreurs
  const handleError = (err: any) => {
    console.error('Ordre de mission error:', err)
    error.value = err?.response?.data?.message || err?.message || 'Une erreur est survenue'
  }

  // Actions de base

  /**
   * Récupérer tous les ordres de mission
   */
  const fetchAll = async () => {
    try {
      isLoading.value = true
      error.value = null
      const response = await ordreMissionService.getAll()
      if (response.success && response.data) {
        ordresMission.value = response.data.data || []
      }
    } catch (err) {
      handleError(err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Récupérer un ordre de mission par ID
   */
  const fetchById = async (id: string) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await ordreMissionService.getById(id)
      if (response.success && response.data) {
        ordreMission.value = response.data
      }
    } catch (err) {
      handleError(err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Créer un ordre de mission
   */
  const create = async (data: CreateOrdreMissionRequest) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await ordreMissionService.create(data)
      if (response.success) {
        await fetchAll()
      }
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Mettre à jour un ordre de mission
   */
  const update = async (id: string, data: Partial<ApiOrdreMission>) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await ordreMissionService.update(id, data)
      if (response.success) {
        await fetchById(id)
      }
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Supprimer un ordre de mission
   */
  const deleteOrdreMission = async (id: string) => {
    try {
      isLoading.value = true
      error.value = null
      await ordreMissionService.delete(id)
      await fetchAll()
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Gestion des candidatures

  /**
   * Récupérer les candidatures d'un ordre de mission
   */
  const fetchCandidatures = async (id: string) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await ordreMissionService.getCandidatures(id)
      if (response.success && response.data) {
        candidatures.value = response.data
      }
    } catch (err) {
      handleError(err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Clôturer les candidatures
   */
  const cloturerCandidatures = async (id: string, adminId: string) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await ordreMissionService.cloturerCandidatures(id, adminId)
      if (response.success) {
        await fetchById(id)
      }
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Rouvrir les candidatures
   */
  const rouvrirCandidatures = async (id: string, adminId: string) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await ordreMissionService.rouvrirCandidatures(id, adminId)
      if (response.success) {
        await fetchById(id)
      }
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Filtres et recherche

  /**
   * Récupérer les ordres de mission par ville
   */
  const fetchByVille = async (villeId: string) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await ordreMissionService.getByVille(villeId)
      if (response.success && response.data) {
        ordresMission.value = response.data.data || []
      }
    } catch (err) {
      handleError(err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Récupérer les ordres de mission par statut
   */
  const fetchByStatut = async (statut: string) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await ordreMissionService.getByStatut(statut)
      if (response.success && response.data) {
        ordresMission.value = response.data.data || []
      }
    } catch (err) {
      handleError(err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Récupérer les ordres de mission disponibles
   */
  const fetchDisponibles = async (villeId?: string) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await ordreMissionService.getDisponibles(villeId)
      if (response.success && response.data) {
        ordresMission.value = response.data.data || []
      }
    } catch (err) {
      handleError(err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    ordresMission,
    ordreMission,
    candidatures,
    isLoading,
    error,
    hasError,
    hasOrdresMission,
    hasCandidatures,

    // Actions
    fetchAll,
    fetchById,
    create,
    update,
    deleteOrdreMission,
    fetchCandidatures,
    cloturerCandidatures,
    rouvrirCandidatures,
    fetchByVille,
    fetchByStatut,
    fetchDisponibles
  }
}
