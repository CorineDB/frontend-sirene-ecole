import apiClient from './api'
import type {
  ApiResponse,
  ApiPanne,
  ApiPannesListResponse,
  ApiPanneResponse,
  DeclarerPanneRequest,
  ValiderPanneRequest
} from '@/types/api'

/**
 * Service de gestion des pannes
 */
class PanneService {
  /**
   * Déclarer une panne pour une sirène
   */
  async declarer(sireneId: string, data: DeclarerPanneRequest): Promise<ApiPanneResponse> {
    const response = await apiClient.post(`/sirenes/${sireneId}/declarer-panne`, data)
    return response.data
  }

  /**
   * Valider une panne et créer un ordre de mission
   */
  async valider(panneId: string, data: ValiderPanneRequest): Promise<ApiResponse<{
    panne: ApiPanne
    ordre_mission: any
  }>> {
    const response = await apiClient.put(`/pannes/${panneId}/valider`, data)
    return response.data
  }

  /**
   * Clôturer une panne
   */
  async cloturer(panneId: string): Promise<ApiPanneResponse> {
    const response = await apiClient.put(`/pannes/${panneId}/cloturer`)
    return response.data
  }

  /**
   * Lister toutes les pannes
   */
  async getAll(perPage: number = 15): Promise<ApiPannesListResponse> {
    const response = await apiClient.get(`/pannes?per_page=${perPage}`)
    return response.data
  }

  /**
   * Obtenir les détails d'une panne
   */
  async getById(id: string): Promise<ApiPanneResponse> {
    const response = await apiClient.get(`/pannes/${id}`)
    return response.data
  }

  /**
   * Obtenir les pannes d'une école
   */
  async getByEcole(ecoleId: string): Promise<ApiPannesListResponse> {
    const response = await apiClient.get(`/pannes/ecole/${ecoleId}`)
    return response.data
  }

  /**
   * Obtenir les pannes d'une sirène
   */
  async getBySirene(sireneId: string): Promise<ApiPannesListResponse> {
    const response = await apiClient.get(`/pannes/sirene/${sireneId}`)
    return response.data
  }

  /**
   * Obtenir les pannes par statut
   */
  async getByStatut(statut: string): Promise<ApiPannesListResponse> {
    const response = await apiClient.get(`/pannes/statut/${statut}`)
    return response.data
  }

  /**
   * Obtenir les pannes par priorité
   */
  async getByPriorite(priorite: string): Promise<ApiPannesListResponse> {
    const response = await apiClient.get(`/pannes/priorite/${priorite}`)
    return response.data
  }
}

export default new PanneService()
