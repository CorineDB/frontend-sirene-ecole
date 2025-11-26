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
 * Filtres pour les pannes
 */
export interface PanneFilters {
  ecole_id?: string
  site_id?: string
  sirene_id?: string
  statut?: string // en_attente, validee, en_cours, resolue, rejetee, cloturee
  priorite?: string // faible, moyenne, haute, urgente
  date_debut?: string // Format: YYYY-MM-DD
  date_fin?: string // Format: YYYY-MM-DD
  est_cloture?: boolean
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
   * Mettre à jour une panne (placeholder)
   */
  async update(panneId: string, data: Partial<DeclarerPanneRequest>): Promise<ApiPanneResponse> {
    console.warn("PanneService.update is a placeholder and does not call a real API endpoint yet.");
    // Simulate API call
    // const response = await apiClient.put(`/pannes/${panneId}`, data);
    // return response.data;

    // For now, let's just return a mock response
    return Promise.resolve({
      success: true,
      data: {
        id: panneId,
        ...data
      } as ApiPanne,
      message: "Panne updated successfully (mocked).",
    });
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
   * Lister toutes les pannes avec filtres optionnels
   */
  async getAll(filters?: PanneFilters): Promise<ApiPannesListResponse> {
    const queryString = filters ? buildQueryString(filters) : '?per_page=15'
    const response = await apiClient.get(`/pannes${queryString}`)
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
  async getByPriorite(priorite: string, perPage?: number): Promise<ApiPannesListResponse> {
    const queryString = perPage ? `?per_page=${perPage}` : ''
    const response = await apiClient.get(`/pannes/priorite/${priorite}${queryString}`)
    return response.data
  }
}

export default new PanneService()
