<template>
  <DashboardLayout>
    <div class="p-6 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Rôles et permissions</h1>
          <p class="text-gray-600 mt-1">Gérer les rôles et leurs autorisations</p>
        </div>
        <Can permission="manage_roles">
          <button
            @click="openCreateModal"
            class="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all"
          >
            <Plus :size="20" />
            Créer un rôle
          </button>
        </Can>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Empty state -->
      <div v-else-if="roles.length === 0" class="text-center py-12">
        <Shield :size="64" class="mx-auto text-gray-300 mb-4" />
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Aucun rôle trouvé</h3>
        <p class="text-gray-600">Créez votre premier rôle pour commencer</p>
      </div>

      <!-- Roles grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          v-for="role in roles"
          :key="role.id"
          class="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all"
        >
          <div class="flex items-start justify-between mb-4">
            <div :class="`w-12 h-12 bg-gradient-to-br ${getRoleColor(role.slug)} rounded-xl flex items-center justify-center`">
              <Shield :size="24" class="text-white" />
            </div>
            <span class="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
              {{ role.users_count || 0 }} utilisateur{{ (role.users_count || 0) > 1 ? 's' : '' }}
            </span>
          </div>

          <h3 class="text-lg font-bold text-gray-900 mb-1">{{ role.nom }}</h3>
          <p class="text-sm text-gray-600 mb-2">{{ role.description || 'Aucune description' }}</p>
          <code class="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">{{ role.slug }}</code>

          <div class="pt-4 mt-4 border-t border-gray-100">
            <div class="flex items-center justify-between mb-3">
              <p class="text-xs font-semibold text-gray-600">
                {{ role.permissions.length }} permission{{ role.permissions.length > 1 ? 's' : '' }}
              </p>
            </div>

            <div class="space-y-2 max-h-32 overflow-y-auto">
              <div
                v-for="perm in role.permissions.slice(0, 5)"
                :key="perm.id"
                class="flex items-center gap-2 text-sm text-gray-700"
              >
                <Check :size="16" class="text-green-600 flex-shrink-0" />
                <span class="truncate">{{ perm.nom }}</span>
              </div>
              <p v-if="role.permissions.length > 5" class="text-xs text-gray-500 italic pl-6">
                +{{ role.permissions.length - 5 }} autres...
              </p>
            </div>
          </div>

          <Can permission="manage_roles">
            <div class="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
              <button
                @click="openPermissionsModal(role)"
                class="flex-1 text-sm text-blue-600 hover:text-blue-700 font-semibold py-2 hover:bg-blue-50 rounded transition-colors"
              >
                <Settings :size="16" class="inline mr-1" />
                Permissions
              </button>
              <button
                @click="openEditModal(role)"
                class="flex-1 text-sm text-gray-600 hover:text-gray-700 font-semibold py-2 hover:bg-gray-50 rounded transition-colors"
              >
                <Edit :size="16" class="inline mr-1" />
                Modifier
              </button>
              <button
                @click="confirmDelete(role)"
                class="text-sm text-red-600 hover:text-red-700 font-semibold py-2 px-3 hover:bg-red-50 rounded transition-colors"
              >
                <Trash2 :size="16" />
              </button>
            </div>
          </Can>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <RoleFormModal
      :is-open="isFormModalOpen"
      :role="selectedRole"
      @close="closeFormModal"
      @created="handleRoleCreated"
      @updated="handleRoleUpdated"
    />

    <RolePermissionsModal
      :is-open="isPermissionsModalOpen"
      :role="selectedRole"
      @close="closePermissionsModal"
      @updated="loadRoles"
    />
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DashboardLayout from '../components/layout/DashboardLayout.vue'
import RoleFormModal from '../components/roles/RoleFormModal.vue'
import RolePermissionsModal from '../components/roles/RolePermissionsModal.vue'
import Can from '../components/permissions/Can.vue'
import { Shield, Plus, Check, Settings, Edit, Trash2 } from 'lucide-vue-next'
import roleService, { type Role } from '../services/roleService'
import { useNotificationStore } from '../stores/notifications'

const notificationStore = useNotificationStore()

const loading = ref(false)
const roles = ref<Role[]>([])

const isFormModalOpen = ref(false)
const isPermissionsModalOpen = ref(false)
const selectedRole = ref<Role | null>(null)

const roleColors: Record<string, string> = {
  admin: 'from-red-500 to-red-600',
  user: 'from-gray-500 to-gray-600',
  ecole: 'from-blue-500 to-blue-600',
  technicien: 'from-green-500 to-green-600',
}

const getRoleColor = (slug: string): string => {
  return roleColors[slug] || 'from-purple-500 to-purple-600'
}

const loadRoles = async () => {
  loading.value = true
  try {
    const response = await roleService.getAllRoles()
    if (response.success && response.data) {
      roles.value = response.data
    } else {
      notificationStore.error('Erreur', response.message || 'Impossible de charger les rôles')
    }
  } catch (error: any) {
    console.error('Failed to load roles:', error)
    notificationStore.error('Erreur', error.response?.data?.message || 'Impossible de charger les rôles')
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  selectedRole.value = null
  isFormModalOpen.value = true
}

const openEditModal = (role: Role) => {
  selectedRole.value = role
  isFormModalOpen.value = true
}

const openPermissionsModal = (role: Role) => {
  selectedRole.value = role
  isPermissionsModalOpen.value = true
}

const closeFormModal = () => {
  isFormModalOpen.value = false
  selectedRole.value = null
}

const closePermissionsModal = () => {
  isPermissionsModalOpen.value = false
  selectedRole.value = null
}

const handleRoleCreated = (role: Role) => {
  roles.value.push(role)
}

const handleRoleUpdated = (updatedRole: Role) => {
  const index = roles.value.findIndex(r => r.id === updatedRole.id)
  if (index !== -1) {
    roles.value[index] = updatedRole
  }
}

const confirmDelete = async (role: Role) => {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer le rôle "${role.nom}" ?\n\nCette action est irréversible.`)) {
    return
  }

  try {
    const response = await roleService.deleteRole(role.id)
    if (response.success) {
      notificationStore.success('Rôle supprimé', `Le rôle "${role.nom}" a été supprimé`)
      roles.value = roles.value.filter(r => r.id !== role.id)
    } else {
      notificationStore.error('Erreur', response.message || 'Impossible de supprimer le rôle')
    }
  } catch (error: any) {
    console.error('Failed to delete role:', error)
    notificationStore.error('Erreur', error.response?.data?.message || 'Impossible de supprimer le rôle')
  }
}

onMounted(() => {
  loadRoles()
})
</script>
