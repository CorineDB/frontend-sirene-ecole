import apiClient from './api'

// Types
export interface PeriodeVacances {
  id: string
  nom: string
  date_debut: string
  date_fin: string
  ecole_id: string
  created_at?: string
  updated_at?: string
}

export interface CalendrierScolaire {
  id: string
  annee_scolaire: string
  ecole_id: string
  periodes_vacances: PeriodeVacances[]
  created_at?: string
  updated_at?: string
}

export interface CreatePeriodeVacancesRequest {
  nom: string
  date_debut: string
  date_fin: string
  ecole_id: string
}

export interface UpdatePeriodeVacancesRequest {
  nom?: string
  date_debut?: string
  date_fin?: string
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

class CalendrierService {
  /**
   * Obtenir le calendrier scolaire d'une école
   */
  async getCalendrier(ecoleId: string): Promise<ApiResponse<CalendrierScolaire>> {
    const response = await apiClient.get(`/calendriers/ecole/${ecoleId}`)
    return response.data
  }

  /**
   * Obtenir toutes les périodes de vacances d'une école
   */
  async getPeriodeVacances(ecoleId: string): Promise<ApiResponse<PeriodeVacances[]>> {
    const response = await apiClient.get(`/periodes-vacances/ecole/${ecoleId}`)
    return response.data
  }

  /**
   * Créer une nouvelle période de vacances
   */
  async createPeriodeVacances(data: CreatePeriodeVacancesRequest): Promise<ApiResponse<PeriodeVacances>> {
    const response = await apiClient.post('/periodes-vacances', data)
    return response.data
  }

  /**
   * Mettre à jour une période de vacances
   */
  async updatePeriodeVacances(id: string, data: UpdatePeriodeVacancesRequest): Promise<ApiResponse<PeriodeVacances>> {
    const response = await apiClient.put(`/periodes-vacances/${id}`, data)
    return response.data
  }

  /**
   * Supprimer une période de vacances
   */
  async deletePeriodeVacances(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/periodes-vacances/${id}`)

    if (response.status === 204) {
      return {
        success: true,
        message: 'Période de vacances supprimée avec succès'
      }
    }

    return response.data
  }

  /**
   * Vérifier les chevauchements de périodes
   */
  async verifierChevauchement(ecoleId: string, dateDebut: string, dateFin: string, excludeId?: string): Promise<ApiResponse<{ has_overlap: boolean, overlapping_periods: PeriodeVacances[] }>> {
    const response = await apiClient.post('/periodes-vacances/verifier-chevauchement', {
      ecole_id: ecoleId,
      date_debut: dateDebut,
      date_fin: dateFin,
      exclude_id: excludeId
    })
    return response.data
  }
}

export default new CalendrierService()
