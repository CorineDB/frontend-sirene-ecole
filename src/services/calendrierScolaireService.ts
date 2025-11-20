import apiClient from './api'

// Types
export interface PeriodeVacances {
  nom: string
  date_debut: string
  date_fin: string
}

export interface JourFerie {
  id: string
  calendrier_id: string
  ecole_id: string | null
  pays_id: string | null
  date: string
  recurrent: boolean
  actif: boolean
  intitule_journee: string
  est_national: boolean
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export interface CalendrierScolaire {
  id: string
  pays_id: string
  annee_scolaire: string
  description: string | null
  date_rentree: string
  date_fin_annee: string
  periodes_vacances: PeriodeVacances[]
  jours_feries_defaut: JourFerie[]
  actif: boolean
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export interface CreateCalendrierScolaireRequest {
  annee_scolaire: string
  date_rentree: string
  date_fin_annee: string
}

export interface UpdateCalendrierScolaireRequest {
  annee_scolaire?: string
  date_rentree?: string
  date_fin_annee?: string
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

class CalendrierScolaireService {
  /**
   * Obtenir tous les calendriers scolaires
   */
  async getAll(perPage: number = 15): Promise<ApiResponse<CalendrierScolaire[]>> {
    const response = await apiClient.get('/calendrier-scolaire', {
      params: { per_page: perPage }
    })
    return response.data
  }

  /**
   * Obtenir un calendrier scolaire spécifique
   */
  async getById(id: string): Promise<ApiResponse<CalendrierScolaire>> {
    const response = await apiClient.get(`/calendrier-scolaire/${id}`)
    return response.data
  }

  /**
   * Créer un nouveau calendrier scolaire
   */
  async create(data: CreateCalendrierScolaireRequest): Promise<ApiResponse<CalendrierScolaire>> {
    const response = await apiClient.post('/calendrier-scolaire', data)
    return response.data
  }

  /**
   * Mettre à jour un calendrier scolaire
   */
  async update(id: string, data: UpdateCalendrierScolaireRequest): Promise<ApiResponse<CalendrierScolaire>> {
    const response = await apiClient.put(`/calendrier-scolaire/${id}`, data)
    return response.data
  }

  /**
   * Supprimer un calendrier scolaire
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/calendrier-scolaire/${id}`)

    if (response.status === 204) {
      return {
        success: true,
        message: 'Calendrier scolaire supprimé avec succès'
      }
    }

    return response.data
  }

  /**
   * Obtenir les jours fériés d'un calendrier scolaire
   * Peut être filtré par école pour inclure les jours fériés spécifiques à l'école
   */
  async getJoursFeries(calendrierId: string): Promise<ApiResponse<JourFerie[]>> {
    const response = await apiClient.get(`/calendrier-scolaire/${calendrierId}/jours-feries`)
    return response.data
  }

  /**
   * Calculer le nombre de jours d'école
   * Peut être filtré par école pour tenir compte des jours fériés spécifiques
   */
  async calculateSchoolDays(calendrierId: string, ecoleId?: string): Promise<ApiResponse<{ school_days: number }>> {
    const params = ecoleId ? { ecole_id: ecoleId } : {}
    const response = await apiClient.get(`/calendrier-scolaire/${calendrierId}/calculate-school-days`, {
      params
    })
    return response.data
  }

  /**
   * Obtenir le calendrier de l'année en cours
   */
  async getCurrentYear(): Promise<ApiResponse<CalendrierScolaire>> {
    const response = await this.getAll(100)
    if (response.success && response.data) {
      // Trouver le calendrier de l'année en cours
      const now = new Date()
      const currentYear = now.getFullYear()

      // Une année scolaire commence en septembre et se termine en juin
      // Ex: 2024-2025 pour septembre 2024 à juin 2025
      const currentMonth = now.getMonth() + 1 // 1-12

      let targetYear: string
      if (currentMonth >= 9) {
        // Septembre à décembre: année scolaire YYYY-(YYYY+1)
        targetYear = `${currentYear}-${currentYear + 1}`
      } else {
        // Janvier à août: année scolaire (YYYY-1)-YYYY
        targetYear = `${currentYear - 1}-${currentYear}`
      }

      const currentCalendrier = response.data.find(c => c.annee_scolaire === targetYear)

      if (currentCalendrier) {
        return {
          success: true,
          data: currentCalendrier
        }
      }
    }

    return {
      success: false,
      message: 'Aucun calendrier trouvé pour l\'année en cours'
    }
  }
}

export default new CalendrierScolaireService()
