import apiClient from './api'
import type {
  ApiPanne,
  ApiIntervention,
  ApiOrdreMission,
  ApiResponse
} from '@/types/api'

/**
 * Types pour les statistiques du dashboard
 */
export interface DashboardEcoleStats {
  total_pannes: number
  pannes_actives: number
  pannes_resolues: number
  total_interventions: number
  interventions_terminees: number
  temps_resolution_moyen: number
  total_sirenes: number
  total_sites: number
}

export interface DashboardTechnicienStats {
  interventions_du_jour: number
  interventions_en_cours: number
  interventions_a_venir: number
  interventions_terminees: number
  ordres_mission_disponibles: number
  candidatures_en_attente: number
  taux_reussite: number
  note_moyenne: number
}

/**
 * Filtres pour les interventions
 */
export interface InterventionFilters {
  ecole_id?: string
  site_id?: string
  technicien_id?: string
  statut?: string // en_attente, planifiee, en_cours, terminee, annulee
  date_debut?: string // Format: YYYY-MM-DD
  date_fin?: string // Format: YYYY-MM-DD
  per_page?: number
}

/**
 * Filtres pour les ordres de mission
 */
export interface OrdreMissionFilters {
  ecole_id?: string
  ville_id?: string
  priorite?: string // faible, moyenne, haute
  per_page?: number
}

/**
 * Helper pour construire les query parameters
 */
function buildQueryString(filters: Record<string, any>): string {
  const params = new URLSearchParams()

  Object.keys(filters).forEach(key => {
    const value = filters[key]
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value))
    }
  })

  const queryString = params.toString()
  return queryString ? `?${queryString}` : ''
}

/**
 * Service pour gérer les données des dashboards
 */
class DashboardService {
  /**
   * Récupérer les pannes actives
   */
  async getPannesActives(): Promise<ApiResponse<ApiPanne[]>> {
    const response = await apiClient.get<ApiResponse<ApiPanne[]>>('/pannes-actives')
    return response.data
  }

  /**
   * Récupérer les statistiques du dashboard école
   */
  async getStatistiquesEcole(): Promise<ApiResponse<DashboardEcoleStats>> {
    const response = await apiClient.get<ApiResponse<DashboardEcoleStats>>('/statistiques-dashboard-ecole')
    return response.data
  }

  /**
   * Récupérer les statistiques du dashboard technicien
   */
  async getStatistiquesTechnicien(): Promise<ApiResponse<DashboardTechnicienStats>> {
    const response = await apiClient.get<ApiResponse<DashboardTechnicienStats>>('/statistiques-dashboard-technicien')
    return response.data
  }

  /**
   * Récupérer les interventions en cours
   */
  async getInterventionsEnCours(filters?: InterventionFilters): Promise<ApiResponse<ApiIntervention[]>> {
    const queryString = filters ? buildQueryString(filters) : ''
    const response = await apiClient.get<ApiResponse<ApiIntervention[]>>(`/interventions-en-cours${queryString}`)
    return response.data
  }

  /**
   * Récupérer les interventions du jour
   */
  async getInterventionsDuJour(filters?: InterventionFilters): Promise<ApiResponse<ApiIntervention[]>> {
    const queryString = filters ? buildQueryString(filters) : ''
    const response = await apiClient.get<ApiResponse<ApiIntervention[]>>(`/interventions-du-jour${queryString}`)
    return response.data
  }

  /**
   * Récupérer les interventions à venir
   */
  async getInterventionsAVenir(filters?: InterventionFilters): Promise<ApiResponse<ApiIntervention[]>> {
    const queryString = filters ? buildQueryString(filters) : ''
    const response = await apiClient.get<ApiResponse<ApiIntervention[]>>(`/interventions-a-venir${queryString}`)
    return response.data
  }

  /**
   * Récupérer les ordres de mission disponibles
   */
  async getOrdresMissionDisponibles(filters?: OrdreMissionFilters): Promise<ApiResponse<ApiOrdreMission[]>> {
    const queryString = filters ? buildQueryString(filters) : ''
    const response = await apiClient.get<ApiResponse<ApiOrdreMission[]>>(`/ordres-mission-disponibles${queryString}`)
    return response.data
  }
}

export default new DashboardService()
