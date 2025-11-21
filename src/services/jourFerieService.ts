import apiClient from './api'

// Types
export interface JourFerie {
  id: string
  calendrier_id: string
  ecole_id: string | null
  pays_id: string | null
  intitule_journee: string
  date: string
  type?: string
  recurrent: boolean
  actif: boolean
  est_national?: boolean
  created_at?: string
  updated_at?: string
}

export interface CreateJourFerieRequest {
  calendrier_id?: string | null
  ecole_id?: string | null
  pays_id?: string | null
  intitule_journee: string
  date: string
  est_national?: boolean
  recurrent?: boolean
  actif?: boolean
}

export interface UpdateJourFerieRequest {
  intitule_journee?: string
  date?: string
  type?: string
  recurrent?: boolean
  actif?: boolean
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
  async getJoursFeries(params?: { ecole_id?: string; pays_id?: string }): Promise<ApiResponse<JourFerie[]>> {
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
