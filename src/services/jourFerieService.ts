import apiClient from './api'

// Types
export interface JourFerie {
  id: string
  nom: string
  date: string
  type: 'national' | 'ecole' | 'mobile'
  recurrent: boolean
  ecole_id?: string
  created_at?: string
  updated_at?: string
}

export interface CreateJourFerieRequest {
  nom: string
  date: string
  type: 'national' | 'ecole' | 'mobile'
  recurrent?: boolean
  ecole_id?: string
}

export interface UpdateJourFerieRequest {
  nom?: string
  date?: string
  type?: 'national' | 'ecole' | 'mobile'
  recurrent?: boolean
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

class JourFerieService {
  /**
   * Obtenir tous les jours fériés (nationaux + école)
   */
  async getJoursFeries(ecoleId?: string): Promise<ApiResponse<JourFerie[]>> {
    const params = ecoleId ? { ecole_id: ecoleId } : {}
    const response = await apiClient.get('/jours-feries', { params })
    return response.data
  }

  /**
   * Obtenir uniquement les jours fériés nationaux
   */
  async getNationaux(): Promise<ApiResponse<JourFerie[]>> {
    const response = await apiClient.get('/jours-feries/nationaux')
    return response.data
  }

  /**
   * Obtenir les jours fériés d'une école spécifique
   */
  async getByEcole(ecoleId: string): Promise<ApiResponse<JourFerie[]>> {
    const response = await apiClient.get(`/jours-feries/ecole/${ecoleId}`)
    return response.data
  }

  /**
   * Créer un nouveau jour férié
   */
  async createJourFerie(data: CreateJourFerieRequest): Promise<ApiResponse<JourFerie>> {
    const response = await apiClient.post('/jours-feries', data)
    return response.data
  }

  /**
   * Mettre à jour un jour férié
   */
  async updateJourFerie(id: string, data: UpdateJourFerieRequest): Promise<ApiResponse<JourFerie>> {
    const response = await apiClient.put(`/jours-feries/${id}`, data)
    return response.data
  }

  /**
   * Supprimer un jour férié
   */
  async deleteJourFerie(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/jours-feries/${id}`)

    if (response.status === 204) {
      return {
        success: true,
        message: 'Jour férié supprimé avec succès'
      }
    }

    return response.data
  }
}

export default new JourFerieService()
