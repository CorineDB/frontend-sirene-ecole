import { ref, computed } from 'vue'
import panneService from '@/services/panneService'
import ordreMissionService from '@/services/ordreMissionService'
import type {
  ApiPanne,
  ApiOrdreMission,
  StatutPanne,
  PrioritePanne,
  DeclarerPanneRequest,
  ValiderPanneRequest
} from '@/types/api'

/**
 * Composable pour gérer les pannes et ordres de mission
 */
export function usePannes() {
  // État - Pannes
  const pannes = ref<ApiPanne[]>([])
  const panne = ref<ApiPanne | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // État - Ordres de mission
  const ordresMission = ref<ApiOrdreMission[]>([])
  const ordreMission = ref<ApiOrdreMission | null>(null)

  // Computed
  const hasError = computed(() => error.value !== null)
  const isLoading = computed(() => loading.value)
  const hasPannes = computed(() => pannes.value.length > 0)

  // Pannes par priorité
  const pannesUrgentes = computed(() =>
    pannes.value.filter(p => p.priorite === PrioritePanne.URGENTE)
  )

  const pannesNonResolues = computed(() =>
    pannes.value.filter(p =>
      p.statut !== StatutPanne.RESOLUE && p.statut !== StatutPanne.CLOTUREE
    )
  )

  // Méthodes utilitaires
  const clearError = () => {
    error.value = null
  }

  const handleError = (err: any) => {
    console.error('Erreur panne:', err)
    error.value = err.response?.data?.message || err.message || 'Une erreur est survenue'
  }

  // ==================== Pannes - CRUD ====================

  /**
   * Charger toutes les pannes
   */
  const fetchAllPannes = async (perPage: number = 15) => {
    loading.value = true
    error.value = null
    try {
      const response = await panneService.getAll(perPage)
      if (response.data?.data) {
        pannes.value = response.data.data
      }
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Charger une panne par ID
   */
  const fetchPanneById = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await panneService.getById(id)
      if (response.data) {
        panne.value = response.data
      }
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Déclarer une panne
   */
  const declarerPanne = async (sireneId: string, data: DeclarerPanneRequest) => {
    loading.value = true
    error.value = null
    try {
      const response = await panneService.declarer(sireneId, data)
      if (response.data) {
        pannes.value.unshift(response.data)
      }
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Valider une panne
   */
  const validerPanne = async (panneId: string, data: ValiderPanneRequest) => {
    loading.value = true
    error.value = null
    try {
      const response = await panneService.valider(panneId, data)
      if (response.data?.panne) {
        const index = pannes.value.findIndex(p => p.id === panneId)
        if (index !== -1) {
          pannes.value[index] = response.data.panne
        }
      }
      // L'ordre de mission a été créé
      if (response.data?.ordre_mission) {
        ordresMission.value.unshift(response.data.ordre_mission)
      }
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Clôturer une panne
   */
  const cloturerPanne = async (panneId: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await panneService.cloturer(panneId)
      if (response.data) {
        const index = pannes.value.findIndex(p => p.id === panneId)
        if (index !== -1) {
          pannes.value[index] = response.data
        }
      }
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // ==================== Pannes - Recherche ====================

  /**
   * Charger les pannes d'une école
   */
  const fetchPannesByEcole = async (ecoleId: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await panneService.getByEcole(ecoleId)
      if (response.data?.data) {
        pannes.value = response.data.data
      }
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Charger les pannes par statut
   */
  const fetchPannesByStatut = async (statut: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await panneService.getByStatut(statut)
      if (response.data?.data) {
        pannes.value = response.data.data
      }
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Charger les pannes par priorité
   */
  const fetchPannesByPriorite = async (priorite: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await panneService.getByPriorite(priorite)
      if (response.data?.data) {
        pannes.value = response.data.data
      }
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // ==================== Ordres de Mission ====================

  /**
   * Charger tous les ordres de mission
   */
  const fetchAllOrdresMission = async (perPage: number = 15) => {
    loading.value = true
    error.value = null
    try {
      const response = await ordreMissionService.getAll(perPage)
      if (response.data?.data) {
        ordresMission.value = response.data.data
      }
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Charger un ordre de mission par ID
   */
  const fetchOrdreMissionById = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await ordreMissionService.getById(id)
      if (response.data) {
        ordreMission.value = response.data
      }
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Charger les candidatures d'un ordre de mission
   */
  const fetchCandidatures = async (ordreMissionId: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await ordreMissionService.getCandidatures(ordreMissionId)
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Clôturer les candidatures
   */
  const cloturerCandidatures = async (ordreMissionId: string, adminId: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await ordreMissionService.cloturerCandidatures(ordreMissionId, adminId)
      if (response.data) {
        const index = ordresMission.value.findIndex(o => o.id === ordreMissionId)
        if (index !== -1) {
          ordresMission.value[index] = response.data
        }
      }
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Rouvrir les candidatures
   */
  const rouvrirCandidatures = async (ordreMissionId: string, adminId: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await ordreMissionService.rouvrirCandidatures(ordreMissionId, adminId)
      if (response.data) {
        const index = ordresMission.value.findIndex(o => o.id === ordreMissionId)
        if (index !== -1) {
          ordresMission.value[index] = response.data
        }
      }
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Charger les ordres de mission disponibles
   */
  const fetchOrdresDisponibles = async (villeId?: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await ordreMissionService.getDisponibles(villeId)
      if (response.data?.data) {
        ordresMission.value = response.data.data
      }
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // ==================== Helpers ====================

  /**
   * Obtenir le label d'un statut de panne
   */
  const getStatutPanneLabel = (statut: StatutPanne): string => {
    const labels: Record<StatutPanne, string> = {
      [StatutPanne.DECLAREE]: 'Déclarée',
      [StatutPanne.VALIDEE]: 'Validée',
      [StatutPanne.ASSIGNEE]: 'Assignée',
      [StatutPanne.EN_COURS]: 'En cours',
      [StatutPanne.RESOLUE]: 'Résolue',
      [StatutPanne.CLOTUREE]: 'Clôturée'
    }
    return labels[statut] || statut
  }

  /**
   * Obtenir la couleur d'un statut de panne
   */
  const getStatutPanneColor = (statut: StatutPanne): string => {
    const colors: Record<StatutPanne, string> = {
      [StatutPanne.DECLAREE]: 'blue',
      [StatutPanne.VALIDEE]: 'indigo',
      [StatutPanne.ASSIGNEE]: 'purple',
      [StatutPanne.EN_COURS]: 'yellow',
      [StatutPanne.RESOLUE]: 'green',
      [StatutPanne.CLOTUREE]: 'gray'
    }
    return colors[statut] || 'gray'
  }

  /**
   * Obtenir le label d'une priorité
   */
  const getPrioriteLabel = (priorite: PrioritePanne): string => {
    const labels: Record<PrioritePanne, string> = {
      [PrioritePanne.BASSE]: 'Basse',
      [PrioritePanne.MOYENNE]: 'Moyenne',
      [PrioritePanne.HAUTE]: 'Haute',
      [PrioritePanne.URGENTE]: 'Urgente'
    }
    return labels[priorite] || priorite
  }

  /**
   * Obtenir la couleur d'une priorité
   */
  const getPrioriteColor = (priorite: PrioritePanne): string => {
    const colors: Record<PrioritePanne, string> = {
      [PrioritePanne.BASSE]: 'gray',
      [PrioritePanne.MOYENNE]: 'yellow',
      [PrioritePanne.HAUTE]: 'orange',
      [PrioritePanne.URGENTE]: 'red'
    }
    return colors[priorite] || 'gray'
  }

  return {
    // État
    pannes,
    panne,
    ordresMission,
    ordreMission,
    loading,
    error,

    // Computed
    hasError,
    isLoading,
    hasPannes,
    pannesUrgentes,
    pannesNonResolues,

    // Méthodes - Pannes
    clearError,
    fetchAllPannes,
    fetchPanneById,
    declarerPanne,
    validerPanne,
    cloturerPanne,
    fetchPannesByEcole,
    fetchPannesByStatut,
    fetchPannesByPriorite,

    // Méthodes - Ordres de Mission
    fetchAllOrdresMission,
    fetchOrdreMissionById,
    fetchCandidatures,
    cloturerCandidatures,
    rouvrirCandidatures,
    fetchOrdresDisponibles,

    // Helpers
    getStatutPanneLabel,
    getStatutPanneColor,
    getPrioriteLabel,
    getPrioriteColor
  }
}
