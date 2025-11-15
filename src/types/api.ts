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
  message?: string
  data?: {
    users: ApiUserData[]
    pagination?: ApiPagination
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
  model_name: string
  model_code: string
  description?: string | null
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export interface ApiSiren {
  id: string
  modele_id: string
  serial_number?: string
  date_fabrication: string
  status?: string
  notes?: string | null
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
  siren_models?: ApiSirenModel
}

export interface CreateSirenRequest {
  modele_id: string
  date_fabrication: string
  notes?: string | null
}

export interface UpdateSirenRequest {
  modele_id?: string
  date_fabrication?: string
  notes?: string | null
}

export interface ApiSirensListResponse {
  success: boolean
  message?: string
  data?: {
    sirens: ApiSiren[]
    pagination?: ApiPagination
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
    models: ApiSirenModel[]
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

export interface ApiProgrammation {
  id: string
  sirene_id: string
  nom: string
  heure_debut: string
  heure_fin?: string | null
  jours_semaine?: string[] | null // ['lundi', 'mardi', ...]
  actif: boolean
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export interface CreateProgrammationRequest {
  nom: string
  heure_debut: string
  heure_fin?: string | null
  jours_semaine?: string[] | null
  actif?: boolean
}

export interface UpdateProgrammationRequest {
  nom?: string
  heure_debut?: string
  heure_fin?: string | null
  jours_semaine?: string[] | null
  actif?: boolean
}

export interface ApiProgrammationsListResponse {
  success: boolean
  message?: string
  data?: {
    programmations: ApiProgrammation[]
    pagination?: ApiPagination
  }
}

export interface ApiProgrammationResponse {
  success: boolean
  message?: string
  data?: ApiProgrammation
}
