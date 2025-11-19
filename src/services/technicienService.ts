import apiClient from './api'

// Types
export interface Pays {
  id: string
  nom: string
  code_iso: string
  indicatif_tel: string
  created_at?: string
  updated_at?: string
}

export interface Ville {
  id: string
  nom: string
  pays_id: string
  pays?: Pays
  created_at?: string
  updated_at?: string
}

export interface UserInfo {
  id: string
  user_id: string
  nom: string
  prenom?: string
  telephone: string
  email?: string | null
  ville_id: string
  adresse: string
  nom_ville?: string
  nom_complet?: string
  ville?: Ville
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export interface User {
  id: string
  nom_utilisateur: string
  identifiant: string
  type: string
  user_account_type_id: string
  user_account_type_type: string
  role_id: string
  actif: boolean
  doit_changer_mot_de_passe: boolean
  mot_de_passe_change: boolean
  statut: number
  user_info?: UserInfo
  userInfo?: UserInfo // Support both snake_case and camelCase
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export interface Technicien {
  id: string
  review: string
  specialite: string
  disponibilite: boolean
  date_inscription: string
  statut: 'actif' | 'inactif' | 'suspendu'
  date_embauche: string | null
  user?: User
  created_at?: string
  updated_at?: string
  deleted_at?: string
}

export interface UserCreateRequest {
  nom_utilisateur: string
  identifiant: string
  mot_de_passe: string
  type: 'TECHNICIEN'
  role_id: string
}

export interface InscriptionTechnicienRequest {
  user: UserCreateRequest
  ville_id: string
  specialite: string
  disponibilite: boolean
  date_embauche: string
}

export interface UpdateTechnicienRequest {
  ville_id?: string
  specialite?: string
  disponibilite?: boolean
  date_embauche?: string
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

class TechnicienService {
  /**
   * Inscrire un nouveau technicien (public endpoint)
   */
  async inscrire(data: InscriptionTechnicienRequest): Promise<ApiResponse<Technicien>> {
    const response = await apiClient.post('/techniciens/inscription', data)
    return response.data
  }

  /**
   * Get all technicians (admin only)
   */
  async getAll(perPage: number = 15): Promise<ApiResponse<PaginatedResponse<Technicien>>> {
    const response = await apiClient.get('/techniciens', {
      params: { per_page: perPage }
    })
    return response.data
  }

  /**
   * Get a specific technician by ID (admin only)
   */
  async getById(id: string): Promise<ApiResponse<Technicien>> {
    const response = await apiClient.get(`/techniciens/${id}`)
    return response.data
  }

  /**
   * Get authenticated technician details
   */
  async getMe(): Promise<ApiResponse<Technicien>> {
    const response = await apiClient.get('/techniciens/me')
    return response.data
  }

  /**
   * Update authenticated technician details
   */
  async updateMe(data: UpdateTechnicienRequest): Promise<ApiResponse<Technicien>> {
    const response = await apiClient.put('/techniciens/me', data)
    return response.data
  }

  /**
   * Update a technician by ID (admin only)
   */
  async update(id: string, data: UpdateTechnicienRequest): Promise<ApiResponse<Technicien>> {
    const response = await apiClient.put(`/techniciens/${id}`, data)
    return response.data
  }

  /**
   * Delete a technician by ID (admin only)
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/techniciens/${id}`)

    // Handle 204 No Content response
    if (response.status === 204) {
      return {
        success: true,
        message: 'Technicien supprimé avec succès'
      }
    }

    return response.data
  }

  /**
   * Get available technicians for a specific city
   */
  async getAvailableByCity(cityId: string): Promise<ApiResponse<Technicien[]>> {
    const response = await apiClient.get('/techniciens/available', {
      params: { city_id: cityId }
    })
    return response.data
  }

  /**
   * Get technician interventions
   */
  async getInterventions(technicienId: string): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get(`/techniciens/${technicienId}/interventions`)
    return response.data
  }
}

export default new TechnicienService()
