import { ref, computed } from 'vue'
import interventionService from '@/services/interventionService'
import type {
  ApiIntervention,
  ApiRapportIntervention,
  StatutIntervention,
  TypeIntervention,
  ResultatIntervention,
  SoumettreCandidatureRequest,
  CreateInterventionRequest,
  PlanifierInterventionRequest,
  RedigerRapportRequest,
  NoterInterventionRequest
} from '@/types/api'

/**
 * Composable pour gérer les interventions
 */
export function useInterventions() {
  // État - Interventions
  const interventions = ref<ApiIntervention[]>([])
  const intervention = ref<ApiIntervention | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // État - Rapports
  const rapports = ref<ApiRapportIntervention[]>([])
  const rapport = ref<ApiRapportIntervention | null>(null)

  // Computed
  const hasError = computed(() => error.value !== null)
  const isLoading = computed(() => loading.value)
  const hasInterventions = computed(() => interventions.value.length > 0)

  // Interventions par statut
  const interventionsEnCours = computed(() =>
    interventions.value.filter(i => i.statut === StatutIntervention.EN_COURS)
  )

  const interventionsDuJour = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return interventions.value.filter(i =>
      i.date_intervention?.startsWith(today)
    )
  })

  const interventionsAVenir = computed(() => {
    const today = new Date().toISOString()
    return interventions.value.filter(i =>
      i.date_intervention && i.date_intervention > today &&
      (i.statut === StatutIntervention.PLANIFIEE || i.statut === StatutIntervention.ASSIGNEE)
    )
  })

  // Méthodes utilitaires
  const clearError = () => {
    error.value = null
  }

  const handleError = (err: any) => {
    console.error('Erreur intervention:', err)
    error.value = err.response?.data?.message || err.message || 'Une erreur est survenue'
  }

  // ==================== CRUD ====================

  /**
   * Charger toutes les interventions
   */
  const fetchAll = async (perPage: number = 15) => {
    loading.value = true
    error.value = null
    try {
      const response = await interventionService.getAll(perPage)
      if (response.data?.data) {
        interventions.value = response.data.data
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
   * Charger une intervention par ID
   */
  const fetchById = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await interventionService.getById(id)
      if (response.data) {
        intervention.value = response.data
      }
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // ==================== Candidatures ====================

  /**
   * Soumettre une candidature
   */
  const soumettreCandidature = async (
    ordreMissionId: string,
    data: SoumettreCandidatureRequest
  ) => {
    loading.value = true
    error.value = null
    try {
      const response = await interventionService.soumettreCandidature(ordreMissionId, data)
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Accepter une candidature
   */
  const accepterCandidature = async (missionTechnicienId: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await interventionService.accepterCandidature(missionTechnicienId, { })
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Refuser une candidature
   */
  const refuserCandidature = async (missionTechnicienId: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await interventionService.refuserCandidature(missionTechnicienId, { })
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Retirer une candidature
   */
  const retirerCandidature = async (missionTechnicienId: string, motif: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await interventionService.retirerCandidature(missionTechnicienId, { motif_retrait: motif })
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // ==================== Création & Gestion ====================

  /**
   * Créer une intervention manuellement
   */
  const creer = async (ordreMissionId: string, data: CreateInterventionRequest) => {
    loading.value = true
    error.value = null
    try {
      const response = await interventionService.creerIntervention(ordreMissionId, data)
      if (response.data) {
        interventions.value.unshift(response.data)
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
   * Planifier une intervention
   */
  const planifier = async (interventionId: string, data: PlanifierInterventionRequest) => {
    loading.value = true
    error.value = null
    try {
      const response = await interventionService.planifier(interventionId, data)
      if (response.data) {
        const index = interventions.value.findIndex(i => i.id === interventionId)
        if (index !== -1) {
          interventions.value[index] = response.data
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
   * Assigner un technicien
   */
  const assignerTechnicien = async (interventionId: string, technicienId: string, role?: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await interventionService.assignerTechnicien(interventionId, { technicien_id: technicienId, role })
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Retirer un technicien
   */
  const retirerTechnicien = async (interventionId: string, technicienId: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await interventionService.retirerTechnicien(interventionId, { technicien_id: technicienId })
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // ==================== Cycle de Vie ====================

  /**
   * Démarrer une intervention
   */
  const demarrer = async (interventionId: string, technicienId: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await interventionService.demarrer(interventionId, { technicien_id: technicienId })
      if (response.data) {
        const index = interventions.value.findIndex(i => i.id === interventionId)
        if (index !== -1) {
          interventions.value[index] = response.data
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
   * Terminer une intervention
   */
  const terminer = async (interventionId: string, technicienId: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await interventionService.terminer(interventionId, { technicien_id: technicienId })
      if (response.data) {
        const index = interventions.value.findIndex(i => i.id === interventionId)
        if (index !== -1) {
          interventions.value[index] = response.data
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
   * Retirer de la mission (annuler)
   */
  const retirerMission = async (interventionId: string, adminId: string, raison: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await interventionService.retirerMission(interventionId, { admin_id: adminId, raison })
      if (response.data) {
        const index = interventions.value.findIndex(i => i.id === interventionId)
        if (index !== -1) {
          interventions.value[index] = response.data
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

  // ==================== Rapports ====================

  /**
   * Rédiger un rapport
   */
  const redigerRapport = async (interventionId: string, data: RedigerRapportRequest) => {
    loading.value = true
    error.value = null
    try {
      const response = await interventionService.redigerRapport(interventionId, data)
      if (response.data) {
        rapports.value.unshift(response.data)
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
   * Charger les rapports d'une intervention
   */
  const fetchRapports = async (interventionId: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await interventionService.getRapports(interventionId)
      if (response.data?.data) {
        rapports.value = response.data.data
      }
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // ==================== Notations ====================

  /**
   * Noter une intervention (école)
   */
  const noterIntervention = async (interventionId: string, data: NoterInterventionRequest) => {
    loading.value = true
    error.value = null
    try {
      const response = await interventionService.noterIntervention(interventionId, data)
      if (response.data) {
        const index = interventions.value.findIndex(i => i.id === interventionId)
        if (index !== -1) {
          interventions.value[index] = response.data
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
   * Noter un rapport (admin)
   */
  const noterRapport = async (rapportId: string, reviewNote: number, reviewAdmin?: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await interventionService.noterRapport(rapportId, { review_note: reviewNote, review_admin: reviewAdmin })
      if (response.data) {
        const index = rapports.value.findIndex(r => r.id === rapportId)
        if (index !== -1) {
          rapports.value[index] = response.data
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

  // ==================== Recherche ====================

  /**
   * Charger les interventions d'un technicien
   */
  const fetchByTechnicien = async (technicienId: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await interventionService.getByTechnicien(technicienId)
      if (response.data?.data) {
        interventions.value = response.data.data
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
   * Charger les interventions d'une école
   */
  const fetchByEcole = async (ecoleId: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await interventionService.getByEcole(ecoleId)
      if (response.data?.data) {
        interventions.value = response.data.data
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
   * Charger les interventions du jour
   */
  const fetchDuJour = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await interventionService.getDuJour()
      if (response.data?.data) {
        interventions.value = response.data.data
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
   * Charger les interventions à venir
   */
  const fetchAVenir = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await interventionService.getAVenir()
      if (response.data?.data) {
        interventions.value = response.data.data
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
   * Obtenir le label d'un statut d'intervention
   */
  const getStatutLabel = (statut: StatutIntervention): string => {
    const labels: Record<StatutIntervention, string> = {
      [StatutIntervention.PLANIFIEE]: 'Planifiée',
      [StatutIntervention.ASSIGNEE]: 'Assignée',
      [StatutIntervention.ACCEPTEE]: 'Acceptée',
      [StatutIntervention.EN_COURS]: 'En cours',
      [StatutIntervention.TERMINEE]: 'Terminée',
      [StatutIntervention.ANNULEE]: 'Annulée'
    }
    return labels[statut] || statut
  }

  /**
   * Obtenir la couleur d'un statut d'intervention
   */
  const getStatutColor = (statut: StatutIntervention): string => {
    const colors: Record<StatutIntervention, string> = {
      [StatutIntervention.PLANIFIEE]: 'blue',
      [StatutIntervention.ASSIGNEE]: 'indigo',
      [StatutIntervention.ACCEPTEE]: 'purple',
      [StatutIntervention.EN_COURS]: 'yellow',
      [StatutIntervention.TERMINEE]: 'green',
      [StatutIntervention.ANNULEE]: 'red'
    }
    return colors[statut] || 'gray'
  }

  /**
   * Obtenir le label d'un type d'intervention
   */
  const getTypeLabel = (type: TypeIntervention): string => {
    const labels: Record<TypeIntervention, string> = {
      [TypeIntervention.INSPECTION]: 'Inspection',
      [TypeIntervention.CONSTAT]: 'Constat',
      [TypeIntervention.REPARATION]: 'Réparation',
      [TypeIntervention.INSTALLATION]: 'Installation',
      [TypeIntervention.MAINTENANCE]: 'Maintenance',
      [TypeIntervention.AUTRE]: 'Autre'
    }
    return labels[type] || type
  }

  /**
   * Obtenir le label d'un résultat
   */
  const getResultatLabel = (resultat: ResultatIntervention): string => {
    const labels: Record<ResultatIntervention, string> = {
      [ResultatIntervention.RESOLU]: 'Résolu',
      [ResultatIntervention.PARTIELLEMENT_RESOLU]: 'Partiellement résolu',
      [ResultatIntervention.NON_RESOLU]: 'Non résolu'
    }
    return labels[resultat] || resultat
  }

  /**
   * Obtenir la couleur d'un résultat
   */
  const getResultatColor = (resultat: ResultatIntervention): string => {
    const colors: Record<ResultatIntervention, string> = {
      [ResultatIntervention.RESOLU]: 'green',
      [ResultatIntervention.PARTIELLEMENT_RESOLU]: 'yellow',
      [ResultatIntervention.NON_RESOLU]: 'red'
    }
    return colors[resultat] || 'gray'
  }

  return {
    // État
    interventions,
    intervention,
    rapports,
    rapport,
    loading,
    error,

    // Computed
    hasError,
    isLoading,
    hasInterventions,
    interventionsEnCours,
    interventionsDuJour,
    interventionsAVenir,

    // Méthodes - CRUD
    clearError,
    fetchAll,
    fetchById,

    // Méthodes - Candidatures
    soumettreCandidature,
    accepterCandidature,
    refuserCandidature,
    retirerCandidature,

    // Méthodes - Création & Gestion
    creer,
    planifier,
    assignerTechnicien,
    retirerTechnicien,

    // Méthodes - Cycle de vie
    demarrer,
    terminer,
    retirerMission,

    // Méthodes - Rapports
    redigerRapport,
    fetchRapports,

    // Méthodes - Notations
    noterIntervention,
    noterRapport,

    // Méthodes - Recherche
    fetchByTechnicien,
    fetchByEcole,
    fetchDuJour,
    fetchAVenir,

    // Helpers
    getStatutLabel,
    getStatutColor,
    getTypeLabel,
    getResultatLabel,
    getResultatColor
  }
}
