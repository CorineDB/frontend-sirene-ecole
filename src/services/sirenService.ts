import apiClient from './api'
import type {
  ApiSirensListResponse,
  ApiSirenResponse,
  ApiSirenModelsListResponse,
  ApiSirenModelResponse,
  CreateSirenRequest,
  UpdateSirenRequest,
  CreateSirenModelRequest,
  UpdateSirenModelRequest,
  AffecterSirenRequest,
  DeclarerPanneRequest,
  ApiProgrammationsListResponse,
  ApiProgrammationResponse,
  CreateProgrammationRequest,
  UpdateProgrammationRequest,
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

  /**
   * Récupérer la liste des sirènes disponibles
   */
  async getSirensDisponibles(params?: {
    page?: number
    per_page?: number
  }): Promise<ApiSirensListResponse> {
    const response = await apiClient.get<ApiSirensListResponse>(
      `${this.basePath}/disponibles`,
      { params }
    )
    return response.data
  }

  /**
   * Récupérer une sirène par son numéro de série
   * @param numeroSerie - Numéro de série de la sirène
   */
  async getSirenByNumeroSerie(numeroSerie: string): Promise<ApiSirenResponse> {
    const response = await apiClient.get<ApiSirenResponse>(
      `${this.basePath}/numero-serie/${numeroSerie}`
    )
    return response.data
  }

  /**
   * Affecter une sirène à une école
   * @param sirenId - ID de la sirène
   * @param affectationData - Données d'affectation
   */
  async affecterSiren(
    sirenId: string,
    affectationData: AffecterSirenRequest
  ): Promise<ApiSirenResponse> {
    const response = await apiClient.post<ApiSirenResponse>(
      `${this.basePath}/${sirenId}/affecter`,
      affectationData
    )
    return response.data
  }

  /**
   * Déclarer une panne pour une sirène
   * @param sirenId - ID de la sirène
   * @param panneData - Données de la panne
   */
  async declarerPanne(
    sirenId: string,
    panneData: DeclarerPanneRequest
  ): Promise<ApiResponse> {
    const response = await apiClient.post<ApiResponse>(
      `${this.basePath}/${sirenId}/declarer-panne`,
      panneData
    )
    return response.data
  }

  // ==================== Modèles de sirènes (CRUD complet) ====================

  /**
   * Récupérer un modèle de sirène par son ID
   * @param modelId - ID du modèle
   */
  async getSirenModelById(modelId: string): Promise<ApiSirenModelResponse> {
    const response = await apiClient.get<ApiSirenModelResponse>(
      `${this.modelsPath}/${modelId}`
    )
    return response.data
  }

  /**
   * Créer un nouveau modèle de sirène
   * @param modelData - Données du modèle à créer
   */
  async createSirenModel(
    modelData: CreateSirenModelRequest
  ): Promise<ApiSirenModelResponse> {
    const response = await apiClient.post<ApiSirenModelResponse>(
      this.modelsPath,
      modelData
    )
    return response.data
  }

  /**
   * Mettre à jour un modèle de sirène
   * @param modelId - ID du modèle
   * @param modelData - Données à mettre à jour
   */
  async updateSirenModel(
    modelId: string,
    modelData: UpdateSirenModelRequest
  ): Promise<ApiSirenModelResponse> {
    const response = await apiClient.put<ApiSirenModelResponse>(
      `${this.modelsPath}/${modelId}`,
      modelData
    )
    return response.data
  }

  /**
   * Supprimer un modèle de sirène
   * @param modelId - ID du modèle à supprimer
   */
  async deleteSirenModel(modelId: string): Promise<ApiResponse> {
    const response = await apiClient.delete<ApiResponse>(
      `${this.modelsPath}/${modelId}`
    )
    return response.data
  }

  // ==================== Programmations ====================

  /**
   * Récupérer la liste des programmations d'une sirène
   * @param sirenId - ID de la sirène
   * @param params - Paramètres de pagination et de filtrage optionnels
   */
  async getProgrammations(
    sirenId: string,
    params?: {
      page?: number
      per_page?: number
    }
  ): Promise<ApiProgrammationsListResponse> {
    const response = await apiClient.get<ApiProgrammationsListResponse>(
      `${this.basePath}/${sirenId}/programmations`,
      { params }
    )
    return response.data
  }

  /**
   * Récupérer une programmation par son ID
   * @param sirenId - ID de la sirène
   * @param programmationId - ID de la programmation
   */
  async getProgrammationById(
    sirenId: string,
    programmationId: string
  ): Promise<ApiProgrammationResponse> {
    const response = await apiClient.get<ApiProgrammationResponse>(
      `${this.basePath}/${sirenId}/programmations/${programmationId}`
    )
    return response.data
  }

  /**
   * Créer une nouvelle programmation pour une sirène
   * @param sirenId - ID de la sirène
   * @param programmationData - Données de la programmation à créer
   */
  async createProgrammation(
    sirenId: string,
    programmationData: CreateProgrammationRequest
  ): Promise<ApiProgrammationResponse> {
    const response = await apiClient.post<ApiProgrammationResponse>(
      `${this.basePath}/${sirenId}/programmations`,
      programmationData
    )
    return response.data
  }

  /**
   * Mettre à jour une programmation
   * @param sirenId - ID de la sirène
   * @param programmationId - ID de la programmation
   * @param programmationData - Données à mettre à jour
   */
  async updateProgrammation(
    sirenId: string,
    programmationId: string,
    programmationData: UpdateProgrammationRequest
  ): Promise<ApiProgrammationResponse> {
    const response = await apiClient.put<ApiProgrammationResponse>(
      `${this.basePath}/${sirenId}/programmations/${programmationId}`,
      programmationData
    )
    return response.data
  }

  /**
   * Supprimer une programmation
   * @param sirenId - ID de la sirène
   * @param programmationId - ID de la programmation à supprimer
   */
  async deleteProgrammation(
    sirenId: string,
    programmationId: string
  ): Promise<ApiResponse> {
    const response = await apiClient.delete<ApiResponse>(
      `${this.basePath}/${sirenId}/programmations/${programmationId}`
    )
    return response.data
  }
}

// Export une instance unique du service
export default new SirenService()
