import { ref } from 'vue'
import userService from '@/services/userService'
import { useNotificationStore } from '@/stores/notifications'
import { useAsyncAction } from './useAsyncAction'
import type { ApiUserData, CreateUserRequest, UpdateUserRequest } from '@/types/api'

/**
 * Composable pour gérer les utilisateurs
 * Fournit des méthodes réactives pour interagir avec l'API utilisateurs
 */
export function useUsers() {
  const users = ref<ApiUserData[]>([])
  const currentUser = ref<ApiUserData | null>(null)
  const totalUsers = ref(0)
  const currentPage = ref(1)
  const perPage = ref(10)
  const lastPage = ref(1)

  const { loading, error, execute } = useAsyncAction()
  const notificationStore = useNotificationStore()

  /**
   * Charger la liste des utilisateurs
   */
  const loadUsers = async (params?: {
    page?: number
    per_page?: number
    search?: string
    role?: string
    type?: string
  }) => {
    const result = await execute(
      () => userService.getAllUsers(params),
      {
        errorTitle: 'Erreur de chargement',
        errorMessage: 'Impossible de charger la liste des utilisateurs',
      }
    )

    if (result?.success && result.data) {
      users.value = result.data.users || []
      if (result.data.pagination) {
        currentPage.value = result.data.pagination.current_page
        perPage.value = result.data.pagination.per_page
        lastPage.value = result.data.pagination.last_page
        totalUsers.value = result.data.pagination.total
      } else {
        totalUsers.value = result.data.users?.length || 0
      }
    }

    return result
  }

  /**
   * Charger un utilisateur par son ID
   */
  const loadUserById = async (userId: string) => {
    const result = await execute(
      () => userService.getUserById(userId),
      {
        errorTitle: 'Erreur de chargement',
        errorMessage: "Impossible de charger les détails de l'utilisateur",
      }
    )

    if (result?.success && result.data) {
      currentUser.value = result.data
    }

    return result
  }

  /**
   * Créer un nouvel utilisateur
   */
  const createUser = async (userData: CreateUserRequest) => {
    const result = await execute(
      () => userService.createUser(userData),
      {
        errorTitle: 'Erreur de création',
        errorMessage: "Impossible de créer l'utilisateur",
      }
    )

    if (result?.success) {
      notificationStore.success(
        'Utilisateur créé',
        "L'utilisateur a été créé avec succès"
      )
      // Recharger la liste après création
      await loadUsers({ page: currentPage.value, per_page: perPage.value })
    }

    return result
  }

  /**
   * Mettre à jour un utilisateur
   */
  const updateUser = async (userId: string, userData: UpdateUserRequest) => {
    const result = await execute(
      () => userService.updateUser(userId, userData),
      {
        errorTitle: 'Erreur de modification',
        errorMessage: "Impossible de modifier l'utilisateur",
      }
    )

    if (result?.success) {
      notificationStore.success(
        'Utilisateur modifié',
        "L'utilisateur a été modifié avec succès"
      )
      // Recharger la liste après modification
      await loadUsers({ page: currentPage.value, per_page: perPage.value })
    }

    return result
  }

  /**
   * Supprimer un utilisateur
   */
  const deleteUser = async (userId: string) => {
    const result = await execute(
      () => userService.deleteUser(userId),
      {
        errorTitle: 'Erreur de suppression',
        errorMessage: "Impossible de supprimer l'utilisateur",
      }
    )

    if (result?.success) {
      notificationStore.success(
        'Utilisateur supprimé',
        "L'utilisateur a été supprimé avec succès"
      )
      // Recharger la liste après suppression
      await loadUsers({ page: currentPage.value, per_page: perPage.value })
    }

    return result
  }

  /**
   * Assigner un rôle à un utilisateur
   */
  const assignRole = async (userId: string, roleId: string) => {
    const result = await execute(
      () => userService.assignRole(userId, { role_id: roleId }),
      {
        errorTitle: "Erreur d'assignation",
        errorMessage: "Impossible d'assigner le rôle",
      }
    )

    if (result?.success) {
      notificationStore.success(
        'Rôle assigné',
        "Le rôle a été assigné avec succès"
      )
      // Recharger la liste après assignation
      await loadUsers({ page: currentPage.value, per_page: perPage.value })
    }

    return result
  }

  /**
   * Retirer le rôle d'un utilisateur
   */
  const removeRole = async (userId: string) => {
    const result = await execute(
      () => userService.removeRole(userId),
      {
        errorTitle: 'Erreur de retrait',
        errorMessage: 'Impossible de retirer le rôle',
      }
    )

    if (result?.success) {
      notificationStore.success(
        'Rôle retiré',
        'Le rôle a été retiré avec succès'
      )
      // Recharger la liste après retrait
      await loadUsers({ page: currentPage.value, per_page: perPage.value })
    }

    return result
  }

  /**
   * Activer un utilisateur
   */
  const activateUser = async (userId: string) => {
    const result = await execute(
      () => userService.activateUser(userId),
      {
        errorTitle: 'Erreur d\'activation',
        errorMessage: "Impossible d'activer l'utilisateur",
      }
    )

    if (result?.success) {
      notificationStore.success(
        'Utilisateur activé',
        "L'utilisateur a été activé avec succès"
      )
      await loadUsers({ page: currentPage.value, per_page: perPage.value })
    }

    return result
  }

  /**
   * Désactiver un utilisateur
   */
  const deactivateUser = async (userId: string) => {
    const result = await execute(
      () => userService.deactivateUser(userId),
      {
        errorTitle: 'Erreur de désactivation',
        errorMessage: "Impossible de désactiver l'utilisateur",
      }
    )

    if (result?.success) {
      notificationStore.success(
        'Utilisateur désactivé',
        "L'utilisateur a été désactivé avec succès"
      )
      await loadUsers({ page: currentPage.value, per_page: perPage.value })
    }

    return result
  }

  /**
   * Réinitialiser le mot de passe d'un utilisateur
   */
  const resetPassword = async (userId: string) => {
    const result = await execute(
      () => userService.resetPassword(userId),
      {
        errorTitle: 'Erreur de réinitialisation',
        errorMessage: 'Impossible de réinitialiser le mot de passe',
      }
    )

    if (result?.success) {
      notificationStore.success(
        'Mot de passe réinitialisé',
        'Le mot de passe a été réinitialisé avec succès'
      )
    }

    return result
  }

  /**
   * Rechercher des utilisateurs
   */
  const searchUsers = async (query: string) => {
    const result = await execute(
      () => userService.searchUsers(query),
      {
        errorTitle: 'Erreur de recherche',
        errorMessage: 'Impossible de rechercher les utilisateurs',
      }
    )

    if (result?.success && result.data) {
      users.value = result.data.users
    }

    return result
  }

  return {
    // État
    users,
    currentUser,
    totalUsers,
    currentPage,
    perPage,
    lastPage,
    loading,
    error,

    // Méthodes
    loadUsers,
    loadUserById,
    createUser,
    updateUser,
    deleteUser,
    assignRole,
    removeRole,
    activateUser,
    deactivateUser,
    resetPassword,
    searchUsers,
  }
}
