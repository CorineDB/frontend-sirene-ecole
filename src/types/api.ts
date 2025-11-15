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

export interface ApiUserData {
  id: string
  email: string | null
  telephone: string | null
  nom_utilisateur: string
  type: string // ADMIN, USER, ECOLE, TECHNICIEN
  role?: ApiRole
  role_id?: string
  doit_changer_mot_de_passe?: boolean
  mot_de_passe_change?: boolean
  created_at?: string
  updated_at?: string
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

export interface CreateUserRequest {
  nom_utilisateur: string
  email?: string | null
  telephone?: string | null
  mot_de_passe: string
  type: string
  role_id?: string
}

export interface UpdateUserRequest {
  nom_utilisateur?: string
  email?: string | null
  telephone?: string | null
  type?: string
  role_id?: string
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
