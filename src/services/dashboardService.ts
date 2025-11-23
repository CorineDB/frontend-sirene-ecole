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
  async getInterventionsEnCours(): Promise<ApiResponse<ApiIntervention[]>> {
    const response = await apiClient.get<ApiResponse<ApiIntervention[]>>('/interventions-en-cours')
    return response.data
  }

  /**
   * Récupérer les interventions du jour
   */
  async getInterventionsDuJour(): Promise<ApiResponse<ApiIntervention[]>> {
    const response = await apiClient.get<ApiResponse<ApiIntervention[]>>('/interventions-du-jour')
    return response.data
  }

  /**
   * Récupérer les interventions à venir
   */
  async getInterventionsAVenir(): Promise<ApiResponse<ApiIntervention[]>> {
    const response = await apiClient.get<ApiResponse<ApiIntervention[]>>('/interventions-a-venir')
    return response.data
  }

  /**
   * Récupérer les ordres de mission disponibles
   */
  async getOrdresMissionDisponibles(): Promise<ApiResponse<ApiOrdreMission[]>> {
    const response = await apiClient.get<ApiResponse<ApiOrdreMission[]>>('/ordres-mission-disponibles')
    return response.data
  }
}

export default new DashboardService()
