import apiClient from './api'

export interface Permission {
  id: string
  slug: string
  nom: string
  description?: string
  created_at?: string
}

export interface Role {
  id: string
  slug: string
  nom: string
  description?: string
  permissions: Permission[]
  users_count?: number
  created_at?: string
  updated_at?: string
}

export interface CreateRoleData {
  nom: string
  slug: string
  description?: string
}

export interface UpdateRoleData {
  nom?: string
  slug?: string
  description?: string
}

export interface PaginatedResponse<T> {
  current_page: number
  data: T[]
  first_page_url: string
  from: number
  last_page: number
  last_page_url: string
  links: Array<{ url: string | null; label: string; active: boolean }>
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number
  total: number
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
}

/**
 * Role Service
 * Handles all role-related API calls
 */
class RoleService {
  /**
   * Get all roles with pagination
   */
  async getRoles(page: number = 1, perPage: number = 15): Promise<ApiResponse<PaginatedResponse<Role>>> {
    const response = await apiClient.get('/roles', {
      params: { page, per_page: perPage }
    })
    return response.data
  }

  /**
   * Get all roles without pagination (for backward compatibility)
   */
  async getAllRoles(): Promise<ApiResponse<Role[]>> {
    const response = await apiClient.get('/roles', {
      params: { per_page: 1000 } // Get a large number to simulate "all"
    })
    // Extract roles from paginated response
    if (response.data.success && response.data.data) {
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data.data // Extract roles array from pagination
      }
    }
    return response.data
  }

  /**
   * Get a specific role by ID
   */
  async getRole(id: string): Promise<ApiResponse<Role>> {
    const response = await apiClient.get(`/roles/${id}`)
    return response.data
  }

  /**
   * Create a new role
   */
  async createRole(data: CreateRoleData): Promise<ApiResponse<Role>> {
    const response = await apiClient.post('/roles', data)
    return response.data
  }

  /**
   * Update an existing role
   */
  async updateRole(id: string, data: UpdateRoleData): Promise<ApiResponse<Role>> {
    const response = await apiClient.put(`/roles/${id}`, data)
    return response.data
  }

  /**
   * Delete a role
   */
  async deleteRole(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/roles/${id}`)
    return response.data
  }

  /**
   * Assign permissions to a role
   */
  async assignPermissions(roleId: string, permissionIds: string[]): Promise<ApiResponse<Role>> {
    const response = await apiClient.post(`/roles/${roleId}/permissions/assign`, {
      permission_ids: permissionIds
    })
    return response.data
  }

  /**
   * Remove permissions from a role
   */
  async removePermissions(roleId: string, permissionIds: string[]): Promise<ApiResponse<Role>> {
    const response = await apiClient.post(`/roles/${roleId}/permissions/remove`, {
      permission_ids: permissionIds
    })
    return response.data
  }

  /**
   * Sync permissions for a role (replace all permissions)
   */
  async syncPermissions(roleId: string, permissionIds: string[]): Promise<ApiResponse<Role>> {
    const response = await apiClient.post(`/roles/${roleId}/permissions/sync`, {
      permission_ids: permissionIds
    })
    return response.data
  }

  /**
   * Get all available permissions
   */
  async getPermissions(): Promise<ApiResponse<Permission[]>> {
    const response = await apiClient.get('/permissions')
    return response.data
  }
}

export default new RoleService()
