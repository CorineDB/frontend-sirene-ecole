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
   * Démarrer un ordre de mission
   */
  async demarrer(id: string): Promise<ApiOrdreMissionResponse> {
    const response = await apiClient.post(`/ordres-mission/${id}/demarrer`)
    return response.data
  }

  /**
   * Terminer un ordre de mission
   */
  async terminer(id: string): Promise<ApiOrdreMissionResponse> {
    const response = await apiClient.post(`/ordres-mission/${id}/terminer`)
    return response.data
  }

  /**
   * Clôturer un ordre de mission
   */
  async cloturer(id: string): Promise<ApiOrdreMissionResponse> {
    const response = await apiClient.post(`/ordres-mission/${id}/cloturer`)
    return response.data
  }

  /**
   * Donner un avis sur un ordre de mission
   */
  async donnerAvis(
    id: string,
    data: {
      avis: string
      note?: number
    }
  ): Promise<ApiResponse> {
    const response = await apiClient.post(`/ordres-mission/${id}/avis`, data)
    return response.data
  }

  /**
   * Ajouter un technicien à un ordre de mission
   */
  async ajouterTechnicien(ordreMissionId: string, technicienId: string): Promise<ApiResponse> {
    const response = await apiClient.post(`/ordres-mission/${ordreMissionId}/techniciens`, {
      technicien_id: technicienId
    })
    return response.data
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
