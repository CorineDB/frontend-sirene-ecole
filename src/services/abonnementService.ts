import apiClient from './api'

// Types
export interface RegenerateQrCodeResponse {
  success: boolean
  message: string
  data?: {
    qr_code_path: string
    qr_code_url: string
  }
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

class AbonnementService {
  /**
   * Régénérer le QR code d'un abonnement en attente
   */
  async regenererQrCode(abonnementId: string): Promise<RegenerateQrCodeResponse> {
    const response = await apiClient.post(`/abonnements/${abonnementId}/regenerer-qr-code`)
    return response.data
  }

  /**
   * Obtenir les détails d'un abonnement
   */
  async getById(id: string): Promise<ApiResponse<any>> {
    const response = await apiClient.get(`/abonnements/${id}`)
    return response.data
  }

  /**
   * Obtenir les abonnements d'une école
   */
  async getByEcole(ecoleId: string): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get(`/ecoles/${ecoleId}/abonnements`)
    return response.data
  }

  /**
   * Obtenir les abonnements d'une sirène
   */
  async getBySirene(sireneId: string): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get(`/abonnements/sirene/${sireneId}`)
    return response.data
  }

  /**
   * Renouveler un abonnement
   */
  async renouveler(abonnementId: string): Promise<ApiResponse<any>> {
    const response = await apiClient.post(`/abonnements/${abonnementId}/renouveler`)
    return response.data
  }

  /**
   * Suspendre un abonnement
   */
  async suspendre(abonnementId: string): Promise<ApiResponse<any>> {
    const response = await apiClient.post(`/abonnements/${abonnementId}/suspendre`)
    return response.data
  }

  /**
   * Réactiver un abonnement suspendu
   */
  async reactiver(abonnementId: string): Promise<ApiResponse<any>> {
    const response = await apiClient.post(`/abonnements/${abonnementId}/reactiver`)
    return response.data
  }

  /**
   * Annuler un abonnement
   */
  async annuler(abonnementId: string): Promise<ApiResponse<any>> {
    const response = await apiClient.post(`/abonnements/${abonnementId}/annuler`)
    return response.data
  }

  /**
   * Télécharger le QR code d'un abonnement
   */
  async telechargerQrCode(abonnementId: string): Promise<Blob> {
    const response = await apiClient.get(`/abonnements/${abonnementId}/qr-code`, {
      responseType: 'blob'
    })
    return response.data
  }

  /**
   * Obtenir l'URL signée du QR code
   */
  async getQrCodeUrl(id: string): Promise<ApiResponse<{ qr_code_url: string, expires_at: string }>> {
    const response = await apiClient.get(`/abonnements/${id}/qr-code-url`)
    return response.data
  }
}

export default new AbonnementService()
