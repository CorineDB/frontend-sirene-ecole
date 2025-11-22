/**
 * Types TypeScript pour les réponses API
 * Centralise toutes les interfaces pour éviter les types 'any'
 */

import type { AxiosError } from 'axios'

// ==================== Error Types ====================

export interface ApiErrorData {
  message?: string
  errors?: Record<string, string[]>
  error?: string
}

export type ApiAxiosError = AxiosError<ApiErrorData>

// ==================== Permissions & Roles ====================

export interface ApiPermission {
  id: string
  slug: string
  nom: string
  description?: string | null
  created_at?: string
  updated_at?: string
}

export interface ApiRole {
  id: string
  slug: string
  nom: string
  description?: string | null
  permissions?: ApiPermission[]
  created_at?: string
  updated_at?: string
}

// ==================== Géographie (Pays & Ville) ====================

export interface ApiPays {
  id: string
  nom: string
  code_iso: string
  indicatif_tel: string
  devise: string
  fuseau_horaire: string
  actif: boolean
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export interface ApiVille {
  id: string
  pays_id: string
  nom: string
  code: string
  latitude: number | null
  longitude: number | null
  actif: boolean
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
  pays?: ApiPays
}

// ==================== User ====================

export interface ApiUser {
  id: string
  email: string | null
  telephone: string | null
  nom_utilisateur: string
  type: string // ADMIN, USER, ECOLE, TECHNICIEN
  role?: ApiRole
  doit_changer_mot_de_passe?: boolean
  mot_de_passe_change?: boolean
  created_at?: string
  updated_at?: string
}

export interface ApiUserResponse {
  success: boolean
  message?: string
  data?: ApiUser
}

// ==================== Auth Responses ====================

export interface ApiAuthTokenData {
  access_token: string
  token_type: string
  expires_in: number
  user?: ApiUser
}

export interface ApiAuthResponse {
  success: boolean
  message: string
  data?: ApiAuthTokenData
}

export interface ApiMeResponse {
  success: boolean
  message?: string
  data?: ApiUser
}

// ==================== Roles & Permissions Management ====================

export interface ApiRoleData {
  id: string
  slug: string
  nom: string
  description?: string | null
  permissions?: ApiPermission[]
  created_at?: string
  updated_at?: string
}

export interface ApiRolesListResponse {
  success: boolean
  message?: string
  data?: {
    roles: ApiRoleData[]
    pagination?: {
      current_page: number
      last_page: number
      per_page: number
      total: number
      from: number
      to: number
    }
  }
}

export interface ApiRoleResponse {
  success: boolean
  message?: string
  data?: ApiRoleData
}

export interface ApiPermissionsListResponse {
  success: boolean
  message?: string
  data?: {
    permissions: ApiPermission[]
    pagination?: {
      current_page: number
      last_page: number
      per_page: number
      total: number
      from: number
      to: number
    }
  }
}

// ==================== Generic API Response ====================

export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
}

export interface ApiErrorResponse {
  success: false
  message: string
  errors?: Record<string, string[]>
}

export interface ApiPagination {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

export interface ApiPaginatedResponse<T> {
  success: boolean
  message?: string
  data?: {
    items: T[]
    pagination: ApiPagination
  }
}

// ==================== Users Management ====================

export interface ApiUserInfo {
  id: string
  user_id: string
  nom: string
  prenom: string
  telephone: string
  email: string | null
  ville_id: string | null
  adresse: string | null
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
  ville?: ApiVille | null
}

export interface ApiUserData {
  id: string
  nom_utilisateur: string
  identifiant: string
  type: string // ADMIN, USER, ECOLE, TECHNICIEN
  user_account_type_id: string | null
  user_account_type_type: string | null
  role?: ApiRole
  role_id?: string
  actif: boolean
  statut: number
  doit_changer_mot_de_passe?: boolean
  mot_de_passe_change?: boolean
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
  user_info?: ApiUserInfo
  // Anciens champs pour compatibilité ascendante
  email?: string | null
  telephone?: string | null
}

export interface ApiUsersListResponse {
  success: boolean
  message?: string | null
  data?: {
    current_page: number
    data: ApiUserData[] // This is the array of users
    first_page_url?: string
    from?: number | null
    last_page: number
    last_page_url?: string
    links?: {
      url: string | null
      label: string
      active: boolean
    }[]
    next_page_url?: string | null
    path?: string
    per_page: number
    prev_page_url?: string | null
    to?: number | null
    total: number
  }
}

export interface ApiUserDetailResponse {
  success: boolean
  message?: string
  data?: ApiUserData
}

// Format avec userInfoData imbriqué (nouveau format backend)
export interface UserInfoData {
  nom: string
  prenom: string
  telephone: string
}

export interface CreateUserRequest {
  nom_utilisateur?: string
  email?: string | null
  telephone?: string | null
  mot_de_passe?: string
  type?: string
  role_id?: string
  // Nouveau format avec userInfoData
  userInfoData?: UserInfoData
}

export interface UpdateUserRequest {
  nom_utilisateur?: string
  email?: string | null
  telephone?: string | null
  type?: string
  role_id?: string
  // Nouveau format avec userInfoData
  userInfoData?: UserInfoData
}

export interface UpdateProfileRequest {
  nom_utilisateur?: string
  email?: string | null
  telephone?: string | null
}

export interface ChangePasswordRequest {
  ancien_mot_de_passe: string
  nouveau_mot_de_passe: string
  confirmation_mot_de_passe: string
}

export interface AssignRoleRequest {
  role_id: string
}

// ==================== Sirènes ====================

export interface ApiSirenModel {
  id: string
  nom: string
  reference: string
  description?: string | null
  specifications?: Record<string, any>
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export interface ApiEcole {
  id: string
  nom: string
  nom_complet: string
  ville_id?: string | null
  ville?: ApiVille | null
  // Add other fields from the JSON if needed for display elsewhere
}

export interface ApiSite {
  id: string
  nom: string
  adresse: string
  ville_id?: string | null
  ville?: ApiVille | null
  // Add other fields from the JSON if needed for display elsewhere
}

export interface ApiSiren {
  id: string
  modele_id: string
  ecole_id?: string | null // Added based on JSON
  site_id?: string | null // Added based on JSON
  numero_serie?: string
  date_fabrication: string
  status?: 'en_stock' | 'reserve' | 'installe' | 'en_panne' | 'hors_service'
  notes?: string | null
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
  modele_sirene?: ApiSirenModel // Added based on JSON
  ecole?: ApiEcole // Added based on JSON
  site?: ApiSite // Added based on JSON
}

export interface CreateSirenRequest {
  modele_id?: string
  date_fabrication: string
  status: 'en_stock' | 'reserve' | 'installe' | 'en_panne' | 'hors_service'
  notes?: string | null
}

export interface UpdateSirenRequest {
  modele_id?: string
  date_fabrication?: string
  status?: 'en_stock' | 'reserve' | 'installe' | 'en_panne' | 'hors_service'
  notes?: string | null
}

export interface ApiSirensListResponse {
  success: boolean
  message?: string
  data?: {
    current_page: number
    data: ApiSiren[] // This is the array of sirens
    first_page_url?: string
    from?: number | null
    last_page: number
    last_page_url?: string
    links?: {
      url: string | null
      label: string
      active: boolean
    }[]
    next_page_url?: string | null
    path?: string
    per_page: number
    prev_page_url?: string | null
    to?: number | null
    total: number
  }
}

export interface ApiSirenResponse {
  success: boolean
  message?: string
  data?: ApiSiren
}

export interface ApiSirenModelsListResponse {
  success: boolean
  message?: string
  data?: {
    data: ApiSirenModel[] // Corrected from 'models' to 'data'
    pagination?: ApiPagination
  }
}

export interface ApiSirenModelResponse {
  success: boolean
  message?: string
  data?: ApiSirenModel
}

export interface CreateSirenModelRequest {
  model_name: string
  model_code: string
  description?: string | null
}

export interface UpdateSirenModelRequest {
  model_name?: string
  model_code?: string
  description?: string | null
}

// ==================== Affectation & Panne ====================

export interface AffecterSirenRequest {
  ecole_id?: string
  date_affectation?: string
  notes?: string | null
}

export interface DeclarerPanneRequest {
  description: string
  date_panne?: string
  gravite?: string // 'faible', 'moyenne', 'elevee'
}

// ==================== Programmations ====================

// Format horaire ESP8266
export interface HoraireSonnerie {
  heure: number // 0-23
  minute: number // 0-59
  jours: number[] // 0-6 (0=Dimanche, 1=Lundi, ..., 6=Samedi)
  duree_sonnerie?: number // Durée en secondes (optionnel)
  description?: string | null // Description de l'horaire (optionnel)
}

// Exception de jour férié
export interface JourFerieException {
  date: string // Format: YYYY-MM-DD
  action: 'include' | 'exclude'
  est_national?: boolean | null // Jour férié national (true) ou local (false)
  recurrent?: boolean | null // Récurrent/annuel (true) ou exceptionnel (false)
  intitule_journee?: string | null // Nom du jour férié (ex: "Noël", "Nouvel An")
}

// Calendrier scolaire (pour la relation)
export interface ApiCalendrierScolaire {
  id: string
  nom: string
  annee_scolaire: string
  date_debut: string
  date_fin: string
}

// Abonnement (pour la relation)
export interface ApiAbonnement {
  id: string
  nom: string
  date_debut: string
  date_fin: string
  actif: boolean
}

export interface ApiProgrammation {
  id: string
  ecole_id: string
  site_id?: string | null
  sirene_id: string
  abonnement_id?: string | null
  calendrier_id?: string | null
  nom_programmation: string
  horaires_sonneries: HoraireSonnerie[] // Format ESP8266
  jour_semaine?: number[] | null // Jours de la semaine globaux (optionnel)
  jours_feries_inclus: boolean
  jours_feries_exceptions?: JourFerieException[] | null
  chaine_programmee?: string | null // Chaîne programmée générée
  chaine_cryptee?: string | null // Chaîne cryptée pour ESP8266
  date_debut: string // Format: YYYY-MM-DD
  date_fin: string // Format: YYYY-MM-DD
  actif: boolean
  cree_par?: string | null
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
  // Relations (loaded optionally)
  ecole?: ApiEcole
  site?: ApiSite
  sirene?: ApiSiren
  abonnement?: ApiAbonnement
  calendrier?: ApiCalendrierScolaire
}

export interface CreateProgrammationRequest {
  nom_programmation: string
  date_debut: string // Format: YYYY-MM-DD
  date_fin: string // Format: YYYY-MM-DD
  actif?: boolean
  calendrier_id?: string | null
  horaires_sonneries: HoraireSonnerie[] // Requis, min 1
  jours_feries_inclus?: boolean
  jours_feries_exceptions?: JourFerieException[]
  abonnement_id?: string | null
}

export interface UpdateProgrammationRequest {
  nom_programmation?: string
  date_debut?: string
  date_fin?: string
  actif?: boolean
  calendrier_id?: string | null
  horaires_sonneries?: HoraireSonnerie[]
  jours_feries_inclus?: boolean
  jours_feries_exceptions?: JourFerieException[]
  abonnement_id?: string | null
}

export interface ApiProgrammationsListResponse {
  success: boolean
  message?: string
  data?: ApiProgrammation[] | {
    programmations?: ApiProgrammation[]
    data?: ApiProgrammation[]
    pagination?: ApiPagination
  }
}

export interface ApiProgrammationResponse {
  success: boolean
  message?: string
  data?: ApiProgrammation
}
