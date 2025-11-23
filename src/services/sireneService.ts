import apiClient from './api'

export interface ModeleSirene {
  id: string
  nom: string
  description?: string
  specifications?: any
  created_at?: string
  updated_at?: string
}

export interface Sirene {
  id: string
  numero_serie: string
  modele_id?: string
  modele?: ModeleSirene
  statut: string
  ecole_id?: string
  site_id?: string
  date_installation?: string
  created_at?: string
  updated_at?: string
}

export interface CreateSireneRequest {
  numero_serie: string
  modele_id?: string
  statut?: string
  date_installation?: string
}

export interface UpdateSireneRequest {
  numero_serie?: string
  modele_id?: string
  statut?: string
  date_installation?: string
}

export interface AffecterSireneRequest {
  site_id: string
  ecole_id: string
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

export interface PaginatedResponse<T> {
  current_page: number
  data: T[]
  first_page_url: string
  from: number
  last_page: number
  last_page_url: string
  links: Array<{
    url: string | null
    label: string
    active: boolean
  }>
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number
  total: number
}

class SireneService {
  /**
   * Get all sirenes
   */
  async getAll(perPage: number = 15): Promise<ApiResponse<PaginatedResponse<Sirene>>> {
    const response = await apiClient.get('/sirenes', {
      params: { per_page: perPage }
    })
    return response.data
  }

  /**
   * Get available sirenes (not assigned to any school/site)
   */
  async getDisponibles(): Promise<ApiResponse<Sirene[]>> {
    const response = await apiClient.get('/sirenes/disponibles')
    return response.data
  }

  /**
   * Get sirenes installées (assigned to schools)
   */
  async getSirenesInstallees(ecoleId?: string): Promise<ApiResponse<Sirene[]>> {
    const params = ecoleId ? { ecole_id: ecoleId } : {}
    const response = await apiClient.get('/sirenes-installees', { params })
    return response.data
  }

  /**
   * Get all sirenes without pagination
   */
  async getAllSirenes(): Promise<ApiResponse<Sirene[]>> {
    try {
      // First request to get total pages
      const firstPage = await apiClient.get('/sirenes', {
        params: { page: 1, per_page: 50 }
      })

      const firstPageData = firstPage.data

      // Check if response is paginated
      if (firstPageData.success && firstPageData.data?.data && firstPageData.data?.last_page) {
        const paginatedData = firstPageData.data as PaginatedResponse<Sirene>
        let allSirenes = [...paginatedData.data]

        // If there are more pages, load them all in parallel
        if (paginatedData.last_page > 1) {
          const remainingPages = Array.from(
            { length: paginatedData.last_page - 1 },
            (_, i) => i + 2
          )

          const remainingRequests = remainingPages.map(page =>
            apiClient.get('/sirenes', {
              params: { page, per_page: 50 }
            })
          )

          const remainingResponses = await Promise.all(remainingRequests)

          remainingResponses.forEach(response => {
            if (response.data.success && response.data.data?.data) {
              allSirenes = [...allSirenes, ...response.data.data.data]
            }
          })
        }

        return {
          success: true,
          message: firstPageData.message,
          data: allSirenes
        }
      }

      // If not paginated, return as is
      if (firstPageData.success && Array.isArray(firstPageData.data)) {
        return {
          success: true,
          message: firstPageData.message,
          data: firstPageData.data
        }
      }

      return firstPageData
    } catch (error) {
      throw error
    }
  }

  /**
   * Get a sirene by ID
   */
  async getById(id: string): Promise<ApiResponse<Sirene>> {
    const response = await apiClient.get(`/sirenes/${id}`)
    return response.data
  }

  /**
   * Get a sirene by serial number
   */
  async getByNumeroSerie(numeroSerie: string): Promise<ApiResponse<Sirene>> {
    const response = await apiClient.get(`/sirenes/numero-serie/${numeroSerie}`)
    return response.data
  }

  /**
   * Create a new sirene
   */
  async create(data: CreateSireneRequest): Promise<ApiResponse<Sirene>> {
    const response = await apiClient.post('/sirenes', data)
    return response.data
  }

  /**
   * Update a sirene
   */
  async update(id: string, data: UpdateSireneRequest): Promise<ApiResponse<Sirene>> {
    const response = await apiClient.put(`/sirenes/${id}`, data)
    return response.data
  }

  /**
   * Affecter une sirène à un site
   */
  async affecter(id: string, data: AffecterSireneRequest): Promise<ApiResponse<Sirene>> {
    const response = await apiClient.post(`/sirenes/${id}/affecter`, data)
    return response.data
  }

  /**
   * Delete a sirene
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/sirenes/${id}`)

    // Handle 204 No Content response
    if (response.status === 204) {
      return {
        success: true,
        message: 'Sirène supprimée avec succès'
      }
    }

    return response.data
  }

  /**
   * Déclarer une panne pour une sirène
   */
  async declarerPanne(id: string, data: any): Promise<ApiResponse<any>> {
    const response = await apiClient.post(`/sirenes/${id}/declarer-panne`, data)
    return response.data
  }
}

export default new SireneService()
