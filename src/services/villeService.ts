import apiClient from './api'

export interface Pays {
  id: string;
  nom: string;
  code: string;
  code_iso: string;
  indicatif_tel: string;
  devise: string;
  fuseau_horaire: string;
  created_at?: string;
  updated_at?: string;
}

export interface Ville {
  id: string
  nom: string
  code: string
  pays_id: string
  latitude: string
  longitude: string
  pays?: Pays
  created_at?: string
  updated_at?: string
}

export interface CreateVilleRequest {
  nom: string
  pays_id: string
  latitude: string
  longitude: string
}

export interface UpdateVilleRequest {
  nom?: string
  pays_id?: string
  latitude?: string
  longitude?: string
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

class VilleService {
  /**
   * Get all cities
   */
  async getAll(perPage: number = 100): Promise<ApiResponse<PaginatedResponse<Ville>>> {
    const response = await apiClient.get('/villes', {
      params: { per_page: perPage }
    })
    return response.data
  }

  /**
   * Get all cities without pagination
   */
  async getAllVilles(): Promise<ApiResponse<Ville[]>> {
    try {
      // First request to get total pages
      const firstPage = await apiClient.get('/villes', {
        params: { page: 1, per_page: 100 }
      })

      const firstPageData = firstPage.data

      // Check if response is paginated
      if (firstPageData.success && firstPageData.data?.data && firstPageData.data?.last_page) {
        const paginatedData = firstPageData.data as PaginatedResponse<Ville>
        let allVilles = [...paginatedData.data]

        // If there are more pages, load them all in parallel
        if (paginatedData.last_page > 1) {
          const remainingPages = Array.from(
            { length: paginatedData.last_page - 1 },
            (_, i) => i + 2
          )

          const remainingRequests = remainingPages.map(page =>
            apiClient.get('/villes', {
              params: { page, per_page: 100 }
            })
          )

          const remainingResponses = await Promise.all(remainingRequests)

          remainingResponses.forEach(response => {
            if (response.data.success && response.data.data?.data) {
              allVilles = [...allVilles, ...response.data.data.data]
            }
          })
        }

        return {
          success: true,
          message: firstPageData.message,
          data: allVilles
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
   * Get a specific city by ID
   */
  async getById(id: string): Promise<ApiResponse<Ville>> {
    const response = await apiClient.get(`/villes/${id}`)
    return response.data
  }

  /**
   * Create a new city
   */
  async create(data: CreateVilleRequest): Promise<ApiResponse<Ville>> {
    const response = await apiClient.post('/villes', data)
    return response.data
  }

  /**
   * Update a city
   */
  async update(id: string, data: UpdateVilleRequest): Promise<ApiResponse<Ville>> {
    const response = await apiClient.put(`/villes/${id}`, data)
    return response.data
  }

  /**
   * Delete a city
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/villes/${id}`)

    // Handle 204 No Content response
    if (response.status === 204) {
      return {
        success: true,
        message: 'Ville supprimée avec succès'
      }
    }

    return response.data
  }
}

export default new VilleService()
