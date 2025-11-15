import apiClient from './api'
import type {
  ApiUsersListResponse,
  ApiUserDetailResponse,
  ApiUserData,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
  AssignRoleRequest,
  ApiResponse,
} from '@/types/api'

/**
 * Service pour la gestion des utilisateurs
 * Centralise tous les appels API liés aux utilisateurs
 */
class UserService {
  private readonly basePath = '/users'

  /**
   * Récupérer la liste de tous les utilisateurs
   * @param params - Paramètres de pagination et de filtrage optionnels
   */
  async getAllUsers(params?: {
    page?: number
    per_page?: number
    search?: string
    role?: string
    type?: string
  }): Promise<ApiUsersListResponse> {
    const response = await apiClient.get<ApiUsersListResponse>(this.basePath, {
      params,
    })
    return response.data
  }

  /**
   * Récupérer un utilisateur par son ID
   * @param userId - ID de l'utilisateur
   */
  async getUserById(userId: string): Promise<ApiUserDetailResponse> {
    const response = await apiClient.get<ApiUserDetailResponse>(
      `${this.basePath}/${userId}`
    )
    return response.data
  }

  /**
   * Créer un nouvel utilisateur
   * @param userData - Données de l'utilisateur à créer
   */
  async createUser(userData: CreateUserRequest): Promise<ApiUserDetailResponse> {
    const response = await apiClient.post<ApiUserDetailResponse>(
      this.basePath,
      userData
    )
    return response.data
  }

  /**
   * Mettre à jour un utilisateur
   * @param userId - ID de l'utilisateur
   * @param userData - Données à mettre à jour
   */
  async updateUser(
    userId: string,
    userData: UpdateUserRequest
  ): Promise<ApiUserDetailResponse> {
    const response = await apiClient.put<ApiUserDetailResponse>(
      `${this.basePath}/${userId}`,
      userData
    )
    return response.data
  }

  /**
   * Supprimer un utilisateur
   * @param userId - ID de l'utilisateur à supprimer
   */
  async deleteUser(userId: string): Promise<ApiResponse> {
    const response = await apiClient.delete<ApiResponse>(
      `${this.basePath}/${userId}`
    )
    return response.data
  }

  /**
   * Assigner un rôle à un utilisateur
   * @param userId - ID de l'utilisateur
   * @param roleData - Données du rôle à assigner
   */
  async assignRole(
    userId: string,
    roleData: AssignRoleRequest
  ): Promise<ApiUserDetailResponse> {
    const response = await apiClient.post<ApiUserDetailResponse>(
      `${this.basePath}/${userId}/assign-role`,
      roleData
    )
    return response.data
  }

  /**
   * Retirer le rôle d'un utilisateur
   * @param userId - ID de l'utilisateur
   */
  async removeRole(userId: string): Promise<ApiUserDetailResponse> {
    const response = await apiClient.delete<ApiUserDetailResponse>(
      `${this.basePath}/${userId}/remove-role`
    )
    return response.data
  }

  /**
   * Mettre à jour le profil de l'utilisateur connecté
   * @param profileData - Données du profil à mettre à jour
   */
  async updateProfile(
    profileData: UpdateProfileRequest
  ): Promise<ApiUserDetailResponse> {
    const response = await apiClient.put<ApiUserDetailResponse>(
      '/profile',
      profileData
    )
    return response.data
  }

  /**
   * Changer le mot de passe de l'utilisateur connecté
   * @param passwordData - Données de changement de mot de passe
   */
  async changePassword(
    passwordData: ChangePasswordRequest
  ): Promise<ApiResponse> {
    const response = await apiClient.post<ApiResponse>(
      '/auth/changerMotDePasse',
      passwordData
    )
    return response.data
  }

  /**
   * Activer un utilisateur
   * @param userId - ID de l'utilisateur à activer
   */
  async activateUser(userId: string): Promise<ApiUserDetailResponse> {
    const response = await apiClient.post<ApiUserDetailResponse>(
      `${this.basePath}/${userId}/activate`
    )
    return response.data
  }

  /**
   * Désactiver un utilisateur
   * @param userId - ID de l'utilisateur à désactiver
   */
  async deactivateUser(userId: string): Promise<ApiUserDetailResponse> {
    const response = await apiClient.post<ApiUserDetailResponse>(
      `${this.basePath}/${userId}/deactivate`
    )
    return response.data
  }

  /**
   * Réinitialiser le mot de passe d'un utilisateur
   * @param userId - ID de l'utilisateur
   */
  async resetPassword(userId: string): Promise<ApiResponse> {
    const response = await apiClient.post<ApiResponse>(
      `${this.basePath}/${userId}/reset-password`
    )
    return response.data
  }

  /**
   * Rechercher des utilisateurs
   * @param query - Terme de recherche
   */
  async searchUsers(query: string): Promise<ApiUsersListResponse> {
    const response = await apiClient.get<ApiUsersListResponse>(
      `${this.basePath}/search`,
      {
        params: { q: query },
      }
    )
    return response.data
  }

  /**
   * Obtenir les statistiques des utilisateurs
   */
  async getUserStats(): Promise<
    ApiResponse<{
      total: number
      active: number
      inactive: number
      by_type: Record<string, number>
      by_role: Record<string, number>
    }>
  > {
    const response = await apiClient.get<
      ApiResponse<{
        total: number
        active: number
        inactive: number
        by_type: Record<string, number>
        by_role: Record<string, number>
      }>
    >(`${this.basePath}/stats`)
    return response.data
  }
}

// Export une instance unique du service
export default new UserService()
