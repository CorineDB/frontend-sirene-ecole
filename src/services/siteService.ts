import apiClient from './api'

export interface SireneRequest {
  numero_serie: string
}

export interface SiteRequest {
  nom?: string
  adresse: string
  ville_id: string
  latitude?: number
  longitude?: number
  types_etablissement: string[]
  sirene: SireneRequest
  ecole_principale_id?: string
  est_principale?: boolean
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

class SiteService {
  /**
   * Create a new site (annexe)
   */
  async create(data: SiteRequest): Promise<ApiResponse<any>> {
    const response = await apiClient.post('/sites', data)
    return response.data
  }

  /**
   * Update a site by ID
   */
  async update(id: string, data: SiteRequest): Promise<ApiResponse<any>> {
    const response = await apiClient.put(`/sites/${id}`, data)
    return response.data
  }

  /**
   * Delete a site by ID
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/sites/${id}`)

    // Handle 204 No Content response
    if (response.status === 204) {
      return {
        success: true,
        message: 'Site supprimé avec succès'
      }
    }

    return response.data
  }
}

export default new SiteService()
