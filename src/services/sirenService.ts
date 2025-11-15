import apiClient from './api'
import type {
  ApiSirensListResponse,
  ApiSirenResponse,
  ApiSirenModelsListResponse,
  CreateSirenRequest,
  UpdateSirenRequest,
  ApiResponse,
} from '@/types/api'

/**
 * Service pour la gestion des sirènes
 * Centralise tous les appels API liés aux sirènes
 */
class SirenService {
  private readonly basePath = '/sirens'
  private readonly modelsPath = '/siren-models'

  /**
   * Récupérer la liste de toutes les sirènes
   * @param params - Paramètres de pagination et de filtrage optionnels
   */
  async getAllSirens(params?: {
    page?: number
    per_page?: number
    search?: string
    status?: string
    modele_id?: string
  }): Promise<ApiSirensListResponse> {
    const response = await apiClient.get<ApiSirensListResponse>(this.basePath, {
      params,
    })
    return response.data
  }

  /**
   * Récupérer une sirène par son ID
   * @param sirenId - ID de la sirène
   */
  async getSirenById(sirenId: string): Promise<ApiSirenResponse> {
    const response = await apiClient.get<ApiSirenResponse>(
      `${this.basePath}/${sirenId}`
    )
    return response.data
  }

  /**
   * Créer une nouvelle sirène
   * @param sirenData - Données de la sirène à créer
   */
  async createSiren(sirenData: CreateSirenRequest): Promise<ApiSirenResponse> {
    const response = await apiClient.post<ApiSirenResponse>(
      this.basePath,
      sirenData
    )
    return response.data
  }

  /**
   * Mettre à jour une sirène
   * @param sirenId - ID de la sirène
   * @param sirenData - Données à mettre à jour
   */
  async updateSiren(
    sirenId: string,
    sirenData: UpdateSirenRequest
  ): Promise<ApiSirenResponse> {
    const response = await apiClient.put<ApiSirenResponse>(
      `${this.basePath}/${sirenId}`,
      sirenData
    )
    return response.data
  }

  /**
   * Supprimer une sirène
   * @param sirenId - ID de la sirène à supprimer
   */
  async deleteSiren(sirenId: string): Promise<ApiResponse> {
    const response = await apiClient.delete<ApiResponse>(
      `${this.basePath}/${sirenId}`
    )
    return response.data
  }

  /**
   * Récupérer la liste de tous les modèles de sirènes
   * @param params - Paramètres de pagination et de filtrage optionnels
   */
  async getAllSirenModels(params?: {
    page?: number
    per_page?: number
    search?: string
  }): Promise<ApiSirenModelsListResponse> {
    const response = await apiClient.get<ApiSirenModelsListResponse>(
      this.modelsPath,
      {
        params,
      }
    )
    return response.data
  }

  /**
   * Obtenir les statistiques des sirènes
   */
  async getSirenStats(): Promise<
    ApiResponse<{
      total: number
      by_status: Record<string, number>
      by_model: Record<string, number>
    }>
  > {
    const response = await apiClient.get<
      ApiResponse<{
        total: number
        by_status: Record<string, number>
        by_model: Record<string, number>
      }>
    >(`${this.basePath}/stats`)
    return response.data
  }
}

// Export une instance unique du service
export default new SirenService()
