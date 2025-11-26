import apiClient from './api'
import type {
  ApiResponse,
  ApiOrdreMission,
  ApiOrdresMissionListResponse,
  ApiOrdreMissionResponse,
  CreateOrdreMissionRequest,
  ApiMissionTechnicien
} from '@/types/api'

/**
 * Service de gestion des ordres de mission
 */
class OrdreMissionService {
  // ==================== CRUD Basique ====================

  /**
   * Lister tous les ordres de mission
   */
  async getAll(perPage: number = 15): Promise<ApiOrdresMissionListResponse> {
    const response = await apiClient.get(`/ordres-mission?per_page=${perPage}`)
    return response.data
  }

  /**
   * Obtenir les détails d'un ordre de mission
   */
  async getById(id: string): Promise<ApiOrdreMissionResponse> {
    const response = await apiClient.get(`/ordres-mission/${id}`)
    return response.data
  }

  /**
   * Créer un ordre de mission
   */
  async create(data: CreateOrdreMissionRequest): Promise<ApiOrdreMissionResponse> {
    const response = await apiClient.post('/ordres-mission', data)
    return response.data
  }

  /**
   * Assigner un technicien à un ordre de mission (placeholder)
   */
  async assignerTechnicien(ordreMissionId: string, technicienId: string, role?: string): Promise<ApiResponse> {
    console.warn("OrdreMissionService.assignerTechnicien is a placeholder and does not call a real API endpoint yet.");
    // Simulate API call
    // const response = await apiClient.post(`/ordres-mission/${ordreMissionId}/assigner-technicien`, { technicien_id: technicienId, role });
    // return response.data;

    // For now, let's just return a mock success response
    return Promise.resolve({
      success: true,
      message: `Technicien ${technicienId} assigned to mission ${ordreMissionId} (mocked).`,
    });
  }

  /**
   * Mettre à jour un ordre de mission
   */
  async update(id: string, data: Partial<ApiOrdreMission>): Promise<ApiOrdreMissionResponse> {
    const response = await apiClient.put(`/ordres-mission/${id}`, data)
    return response.data
  }

  /**
   * Supprimer un ordre de mission
   */
  async delete(id: string): Promise<ApiResponse> {
    const response = await apiClient.delete(`/ordres-mission/${id}`)
    return response.data
  }

  // ==================== Candidatures ====================

  /**
   * Obtenir les candidatures d'un ordre de mission
   */
  async getCandidatures(id: string): Promise<ApiResponse<ApiMissionTechnicien[]>> {
    const response = await apiClient.get(`/ordres-mission/${id}/candidatures`)
    return response.data
  }

  /**
   * Clôturer les candidatures
   */
  async cloturerCandidatures(id: string): Promise<ApiOrdreMissionResponse> {
    const response = await apiClient.put(`/ordres-mission/${id}/cloturer-candidatures`, { })
    return response.data
  }

  /**
   * Rouvrir les candidatures
   */
  async rouvrirCandidatures(id: string): Promise<ApiOrdreMissionResponse> {
    const response = await apiClient.put(`/ordres-mission/${id}/rouvrir-candidatures`, { })
    return response.data
  }

  // ==================== Recherche et Filtrage ====================

  /**
   * Obtenir les ordres de mission d'une ville
   */
  async getByVille(villeId: string): Promise<ApiOrdresMissionListResponse> {
    const response = await apiClient.get(`/ordres-mission/ville/${villeId}`)
    return response.data
  }

  /**
   * Obtenir les ordres de mission par statut
   */
  async getByStatut(statut: string): Promise<ApiOrdresMissionListResponse> {
    const response = await apiClient.get(`/ordres-mission/statut/${statut}`)
    return response.data
  }

  /**
   * Obtenir les ordres de mission disponibles (candidatures ouvertes)
   */
  async getDisponibles(villeId?: string): Promise<ApiOrdresMissionListResponse> {
    const url = villeId
      ? `/ordres-mission/disponibles?ville_id=${villeId}`
      : '/ordres-mission/disponibles'
    const response = await apiClient.get(url)
    return response.data
  }
}

export default new OrdreMissionService()
