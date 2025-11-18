import apiClient from './api'

// Types
export interface Ville {
  id: string
  nom: string
  pays_id: string
  created_at?: string
  updated_at?: string
}

export interface Sirene {
  id: string
  numero_serie: string
  modele_id?: string
  statut?: string
  ecole_id?: string
  site_id?: string
  created_at?: string
  updated_at?: string
}

export interface Site {
  id: string
  nom: string
  adresse: string
  ville_id: string
  ville?: Ville
  latitude?: number
  longitude?: number
  ecole_principale_id: string
  est_principale: boolean
  sirene_id?: string
  sirene?: Sirene
  created_at?: string
  updated_at?: string
}

export interface Abonnement {
  id: string
  numero_abonnement: string
  ecole_id: string
  site_id: string
  sirene_id: string
  date_debut: string
  date_fin: string
  montant: number
  statut: string
  auto_renouvellement: boolean
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface UserInfo {
  id: string
  user_id: string
  nom: string
  prenom?: string
  telephone: string
  email?: string
  created_at?: string
  updated_at?: string
}

export interface User {
  id: string
  nom_utilisateur: string
  type: string
  user_account_type_id: string
  user_account_type_type: string
  role_id: string
  actif: boolean
  doit_changer_mot_de_passe: boolean
  mot_de_passe_change: boolean
  statut: number
  userInfo?: UserInfo
  created_at?: string
  updated_at?: string
}

export interface Ecole {
  id: string
  reference: string
  nom: string
  nom_complet: string
  telephone_contact: string
  email_contact?: string
  types_etablissement: string[]
  code_etablissement: string
  responsable_nom: string
  responsable_prenom: string
  responsable_telephone: string
  statut: 'actif' | 'inactif' | 'suspendu'
  date_inscription: string
  sites?: Site[]
  sitePrincipal?: Site
  abonnements?: Abonnement[]
  abonnementActif?: Abonnement
  user?: User
  mot_de_passe_temporaire?: string
  created_at?: string
  updated_at?: string
  deleted_at?: string
}

export interface SireneRequest {
  numero_serie: string
}

export interface SitePrincipalRequest {
  adresse: string
  ville_id: string
  latitude?: number
  longitude?: number
  sirene: SireneRequest
}

export interface SiteAnnexeRequest {
  nom: string
  adresse?: string
  ville_id?: string
  latitude?: number
  longitude?: number
  sirene: SireneRequest
}

export interface InscriptionEcoleRequest {
  nom: string
  nom_complet: string
  telephone_contact: string
  email_contact?: string
  types_etablissement: string[]
  responsable_nom: string
  responsable_prenom: string
  responsable_telephone: string
  site_principal: SitePrincipalRequest
  sites_annexe?: SiteAnnexeRequest[]
}

export interface UpdateEcoleRequest {
  nom?: string
  nom_complet?: string
  telephone_contact?: string
  email_contact?: string
  responsable_nom?: string
  responsable_prenom?: string
  responsable_telephone?: string
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

class EcoleService {
  /**
   * Inscrire une nouvelle école (public endpoint)
   */
  async inscrire(data: InscriptionEcoleRequest): Promise<ApiResponse<Ecole>> {
    const response = await apiClient.post('/ecoles/inscription', data)
    return response.data
  }

  /**
   * Get all schools (admin only)
   */
  async getAll(perPage: number = 15): Promise<ApiResponse<PaginatedResponse<Ecole>>> {
    const response = await apiClient.get('/ecoles', {
      params: { per_page: perPage }
    })
    return response.data
  }

  /**
   * Get a specific school by ID (admin only)
   */
  async getById(id: string): Promise<ApiResponse<Ecole>> {
    const response = await apiClient.get(`/ecoles/${id}`)
    return response.data
  }

  /**
   * Get authenticated school details
   */
  async getMe(): Promise<ApiResponse<Ecole>> {
    const response = await apiClient.get('/ecoles/me')
    return response.data
  }

  /**
   * Update authenticated school details
   */
  async updateMe(data: UpdateEcoleRequest): Promise<ApiResponse<Ecole>> {
    const response = await apiClient.put('/ecoles/me', data)
    return response.data
  }

  /**
   * Update a school by ID (admin only)
   */
  async update(id: string, data: UpdateEcoleRequest): Promise<ApiResponse<Ecole>> {
    const response = await apiClient.put(`/ecoles/${id}`, data)
    return response.data
  }

  /**
   * Delete a school by ID (admin only)
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/ecoles/${id}`)

    // Handle 204 No Content response
    if (response.status === 204) {
      return {
        success: true,
        message: 'École supprimée avec succès'
      }
    }

    return response.data
  }

  /**
   * Get school calendar with holidays
   */
  async getCalendrierWithHolidays(filters?: Record<string, any>): Promise<ApiResponse<any>> {
    const response = await apiClient.get('/ecoles/me/calendrier-scolaire/with-ecole-holidays', {
      params: filters
    })
    return response.data
  }

  /**
   * Get holidays for a specific school
   */
  async getJoursFeries(ecoleId: string): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get(`/ecoles/${ecoleId}/jours-feries`)
    return response.data
  }

  /**
   * Create a holiday for a specific school
   */
  async createJourFerie(ecoleId: string, data: any): Promise<ApiResponse<any>> {
    const response = await apiClient.post(`/ecoles/${ecoleId}/jours-feries`, data)
    return response.data
  }

  /**
   * Get abonnements for a specific school
   */
  async getAbonnements(ecoleId: string): Promise<ApiResponse<Abonnement[]>> {
    const response = await apiClient.get(`/ecoles/${ecoleId}/abonnements`)
    return response.data
  }
}

export default new EcoleService()
