<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-y-auto"
    @click.self="close"
  >
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" @click="close"></div>

      <!-- Modal panel -->
      <div class="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
        <!-- Header -->
        <div class="flex items-start justify-between mb-6">
          <div>
            <h3 class="text-2xl font-bold text-gray-900">
              Gérer le rôle
            </h3>
            <p class="text-sm text-gray-600 mt-1">
              Assigner un rôle à {{ user?.nom_utilisateur }}
            </p>
          </div>
          <button
            @click="close"
            class="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
            aria-label="Fermer le modal"
          >
            <X :size="24" aria-hidden="true" />
          </button>
        </div>

        <!-- Content -->
        <div class="space-y-4">
          <!-- Current Role -->
          <div v-if="user?.role" class="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p class="text-sm font-semibold text-blue-900 mb-1">Rôle actuel</p>
            <p class="text-blue-700">{{ user.role.nom }}</p>
            <p v-if="user.role.description" class="text-sm text-blue-600 mt-1">{{ user.role.description }}</p>
          </div>

          <div v-else class="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p class="text-sm text-gray-600">Aucun rôle assigné</p>
          </div>

          <!-- Role Selection -->
          <div>
            <label for="role_select" class="block text-sm font-semibold text-gray-700 mb-2">
              Sélectionner un nouveau rôle
            </label>
            <div v-if="loadingRoles" class="text-center py-4">
              <span class="text-gray-500">Chargement des rôles...</span>
            </div>
            <select
              v-else
              id="role_select"
              v-model="selectedRoleId"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <option value="">Aucun rôle</option>
              <option
                v-for="role in availableRoles"
                :key="role.id"
                :value="role.id"
              >
                {{ role.nom }}
              </option>
            </select>
          </div>

          <!-- Selected Role Details -->
          <div v-if="selectedRole" class="p-4 bg-green-50 rounded-lg border border-green-200">
            <p class="text-sm font-semibold text-green-900 mb-1">Nouveau rôle</p>
            <p class="text-green-700">{{ selectedRole.nom }}</p>
            <p v-if="selectedRole.description" class="text-sm text-green-600 mt-1">{{ selectedRole.description }}</p>
            <div v-if="selectedRole.permissions && selectedRole.permissions.length > 0" class="mt-3">
              <p class="text-xs font-semibold text-green-800 mb-2">Permissions incluses :</p>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="permission in selectedRole.permissions.slice(0, 5)"
                  :key="permission.id"
                  class="text-xs px-2 py-1 bg-green-100 text-green-700 rounded"
                >
                  {{ permission.nom }}
                </span>
                <span
                  v-if="selectedRole.permissions.length > 5"
                  class="text-xs px-2 py-1 bg-green-100 text-green-700 rounded"
                >
                  +{{ selectedRole.permissions.length - 5 }} autres
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between gap-3 pt-6 border-t border-gray-200 mt-6">
          <button
            v-if="user?.role"
            type="button"
            @click="handleRemoveRole"
            :disabled="loading"
            class="px-4 py-2 text-red-600 bg-red-50 rounded-lg font-semibold hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Retirer le rôle
          </button>
          <div class="flex-1"></div>
          <div class="flex gap-3">
            <button
              type="button"
              @click="close"
              class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              @click="handleAssignRole"
              :disabled="loading || !selectedRoleId || selectedRoleId === user?.role?.id"
              class="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span v-if="loading" class="animate-spin">⏳</span>
              {{ loading ? 'Assignation...' : 'Assigner' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { X } from 'lucide-vue-next'
import { useUsers } from '@/composables/useUsers'
import roleService, { type Role } from '@/services/roleService'
import type { ApiUserData } from '@/types/api'
import type { ApiAxiosError } from '@/types/api'
import { useNotificationStore } from '@/stores/notifications'

interface Props {
  isOpen: boolean
  user: ApiUserData | null
}

interface Emits {
  (e: 'close'): void
  (e: 'updated'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const notificationStore = useNotificationStore()
const { assignRole, removeRole } = useUsers()

const selectedRoleId = ref<string>('')
const loading = ref(false)
const loadingRoles = ref(false)
const availableRoles = ref<Role[]>([])

const selectedRole = computed(() => {
  if (!selectedRoleId.value) return null
  return availableRoles.value.find(r => r.id === selectedRoleId.value)
})

const loadRoles = async () => {
  loadingRoles.value = true
  try {
    const response = await roleService.getAllRoles()
    if (response.success && response.data) {
      availableRoles.value = response.data
    }
  } catch (error) {
    const axiosError = error as ApiAxiosError
    console.error('Failed to load roles:', axiosError)
    notificationStore.error('Erreur', 'Impossible de charger les rôles')
  } finally {
    loadingRoles.value = false
  }
}

const handleAssignRole = async () => {
  if (!props.user || !selectedRoleId.value) return

  loading.value = true
  try {
    const result = await assignRole(props.user.id, selectedRoleId.value)
    if (result?.success) {
      emit('updated')
      close()
    }
  } finally {
    loading.value = false
  }
}

const handleRemoveRole = async () => {
  if (!props.user) return

  const confirmRemove = confirm(
    `Êtes-vous sûr de vouloir retirer le rôle de ${props.user.nom_utilisateur} ?`
  )

  if (!confirmRemove) return

  loading.value = true
  try {
    const result = await removeRole(props.user.id)
    if (result?.success) {
      emit('updated')
      close()
    }
  } finally {
    loading.value = false
  }
}

const close = () => {
  emit('close')
}

// Watch for modal opening/closing
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    await loadRoles()
    // Set current role as selected
    selectedRoleId.value = props.user?.role?.id || ''
  } else {
    selectedRoleId.value = ''
    loading.value = false
    loadingRoles.value = false
  }
})
</script>
