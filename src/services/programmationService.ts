import apiClient from './api'
import type {
  ApiProgrammationsListResponse,
  ApiProgrammationResponse,
  CreateProgrammationRequest,
  UpdateProgrammationRequest,
  ApiResponse,
} from '@/types/api'

/**
 * Service pour la gestion des programmations de sirènes
 * Centralise tous les appels API liés aux programmations
 */
class ProgrammationService {
  private readonly basePath = '/sirenes'

  /**
   * Récupérer la liste des programmations d'une sirène
   * @param sireneId - ID de la sirène
   * @param params - Paramètres de pagination et de filtrage optionnels
   */
  async getProgrammations(
    sireneId: string,
    params?: {
      page?: number
      per_page?: number
      search?: string
    }
  ): Promise<ApiProgrammationsListResponse> {
    const response = await apiClient.get<ApiProgrammationsListResponse>(
      `${this.basePath}/${sireneId}/programmations`,
      { params }
    )
    return response.data
  }

  /**
   * Récupérer une programmation par son ID
   * @param sireneId - ID de la sirène
   * @param programmationId - ID de la programmation
   */
  async getProgrammationById(
    sireneId: string,
    programmationId: string
  ): Promise<ApiProgrammationResponse> {
    const response = await apiClient.get<ApiProgrammationResponse>(
      `${this.basePath}/${sireneId}/programmations/${programmationId}`
    )
    return response.data
  }

  /**
   * Créer une nouvelle programmation pour une sirène
   * @param sireneId - ID de la sirène
   * @param programmationData - Données de la programmation à créer
   */
  async createProgrammation(
    sireneId: string,
    programmationData: CreateProgrammationRequest
  ): Promise<ApiProgrammationResponse> {
    const response = await apiClient.post<ApiProgrammationResponse>(
      `${this.basePath}/${sireneId}/programmations`,
      programmationData
    )
    return response.data
  }

  /**
   * Mettre à jour une programmation
   * @param sireneId - ID de la sirène
   * @param programmationId - ID de la programmation
   * @param programmationData - Données à mettre à jour
   */
  async updateProgrammation(
    sireneId: string,
    programmationId: string,
    programmationData: UpdateProgrammationRequest
  ): Promise<ApiProgrammationResponse> {
    const response = await apiClient.put<ApiProgrammationResponse>(
      `${this.basePath}/${sireneId}/programmations/${programmationId}`,
      programmationData
    )
    return response.data
  }

  /**
   * Supprimer une programmation
   * @param sireneId - ID de la sirène
   * @param programmationId - ID de la programmation à supprimer
   */
  async deleteProgrammation(
    sireneId: string,
    programmationId: string
  ): Promise<ApiResponse> {
    const response = await apiClient.delete<ApiResponse>(
      `${this.basePath}/${sireneId}/programmations/${programmationId}`
    )
    return response.data
  }

  /**
   * Générer la chaîne cryptée pour une programmation
   * @param sireneId - ID de la sirène
   * @param programmationId - ID de la programmation
   */
  async genererChaineCryptee(
    sireneId: string,
    programmationId: string
  ): Promise<ApiResponse<{ chaine_cryptee: string; longueur: number }>> {
    const response = await apiClient.post<
      ApiResponse<{ chaine_cryptee: string; longueur: number }>
    >(`${this.basePath}/${sireneId}/programmations/${programmationId}/generer-chaine`)
    return response.data
  }

  /**
   * Envoyer la programmation à la sirène
   * @param sireneId - ID de la sirène
   * @param programmationId - ID de la programmation
   */
  async envoyerSirene(
    sireneId: string,
    programmationId: string
  ): Promise<ApiResponse<{ statut: string; message: string }>> {
    const response = await apiClient.post<
      ApiResponse<{ statut: string; message: string }>
    >(`${this.basePath}/${sireneId}/programmations/${programmationId}/envoyer`)
    return response.data
  }

  /**
   * Activer/Désactiver une programmation
   * @param sireneId - ID de la sirène
   * @param programmationId - ID de la programmation
   * @param actif - Statut actif/inactif
   */
  async toggleActif(
    sireneId: string,
    programmationId: string,
    actif: boolean
  ): Promise<ApiProgrammationResponse> {
    return this.updateProgrammation(sireneId, programmationId, { actif })
  }

  /**
   * Récupérer les statistiques des programmations d'une sirène
   * @param sireneId - ID de la sirène
   */
  async getStatsProgrammations(
    sireneId: string
  ): Promise<
    ApiResponse<{
      total: number
      actives: number
      inactives: number
    }>
  > {
    const response = await apiClient.get<
      ApiResponse<{
        total: number
        actives: number
        inactives: number
      }>
    >(`${this.basePath}/${sireneId}/programmations/stats`)
    return response.data
  }
}

// Export une instance unique du service
export default new ProgrammationService()
