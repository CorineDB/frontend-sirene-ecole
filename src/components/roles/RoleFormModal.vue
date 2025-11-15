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
      <div class="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
        <!-- Header -->
        <div class="flex items-start justify-between mb-6">
          <div>
            <h3 class="text-2xl font-bold text-gray-900">
              {{ isEditMode ? 'Modifier le rôle' : 'Créer un nouveau rôle' }}
            </h3>
            <p class="text-sm text-gray-600 mt-1">
              {{ isEditMode ? 'Modifiez les informations du rôle' : 'Remplissez les informations du nouveau rôle' }}
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

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Nom -->
          <div>
            <label for="nom" class="block text-sm font-semibold text-gray-700 mb-2">
              Nom du rôle <span class="text-red-500">*</span>
            </label>
            <input
              id="nom"
              v-model="formData.nom"
              type="text"
              required
              placeholder="Ex: Administrateur"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus-visible:ring-2 focus-visible:ring-blue-600"
              :class="{ 'border-red-500': errors.nom }"
              :aria-invalid="!!errors.nom"
              :aria-describedby="errors.nom ? 'nom-error' : undefined"
            />
            <p v-if="errors.nom" id="nom-error" class="text-sm text-red-600 mt-1" role="alert">{{ errors.nom }}</p>
          </div>

          <!-- Description -->
          <div>
            <label for="description" class="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              v-model="formData.description"
              rows="3"
              placeholder="Description du rôle et de ses responsabilités"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus-visible:ring-2 focus-visible:ring-blue-600 resize-none"
              :class="{ 'border-red-500': errors.description }"
              :aria-invalid="!!errors.description"
              :aria-describedby="errors.description ? 'description-error' : undefined"
            ></textarea>
            <p v-if="errors.description" id="description-error" class="text-sm text-red-600 mt-1" role="alert">{{ errors.description }}</p>
          </div>

          <!-- Permissions -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Permissions
            </label>
            <div v-if="loadingPermissions" class="text-center py-4">
              <span class="text-gray-500">Chargement des permissions...</span>
            </div>
            <div v-else>
              <!-- Select All button -->
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
                <span class="text-sm font-semibold text-gray-700">
                  {{ selectedPermissions.length }} / {{ allPermissions.length }} permissions sélectionnées
                </span>
                <button
                  type="button"
                  @click="toggleSelectAll"
                  class="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  {{ isAllSelected ? 'Tout désélectionner' : 'Tout sélectionner' }}
                </button>
              </div>

              <!-- Permissions list -->
              <div class="max-h-64 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
                <label
                  v-for="permission in allPermissions"
                  :key="permission.id"
                  class="flex items-start gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    :value="permission.id"
                    v-model="selectedPermissions"
                    class="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div class="flex-1">
                    <span class="text-sm font-medium text-gray-900">{{ permission.nom }}</span>
                    <p v-if="permission.description" class="text-xs text-gray-600">{{ permission.description }}</p>
                  </div>
                </label>
                <div v-if="allPermissions.length === 0" class="text-center py-4 text-gray-500 text-sm">
                  Aucune permission disponible
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              @click="close"
              class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span v-if="loading" class="animate-spin">⏳</span>
              {{ loading ? 'Enregistrement...' : (isEditMode ? 'Mettre à jour' : 'Créer') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { X } from 'lucide-vue-next'
import roleService, { type Role, type Permission, type CreateRoleData, type UpdateRoleData } from '../../services/roleService'
import { useNotificationStore } from '../../stores/notifications'
import type { ApiAxiosError } from '../../types/api'

interface Props {
  isOpen: boolean
  role?: Role | null
}

interface Emits {
  (e: 'close'): void
  (e: 'created', role: Role): void
  (e: 'updated', role: Role): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const notificationStore = useNotificationStore()

const isEditMode = computed(() => !!props.role)

const formData = ref<CreateRoleData>({
  nom: '',
  slug: '',
  description: ''
})

const errors = ref<Record<string, string>>({})

const isAllSelected = computed(() => {
  return allPermissions.value.length > 0 &&
    allPermissions.value.every(p => selectedPermissions.value.includes(p.id))
})
const loading = ref(false)
const loadingPermissions = ref(false)
const allPermissions = ref<Permission[]>([])
const selectedPermissions = ref<string[]>([])

const formatSlug = () => {
  formData.value.slug = formData.value.slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

const loadPermissions = async () => {
  loadingPermissions.value = true
  try {
    const response = await roleService.getAllPermissions()
    if (response.success && response.data) {
      allPermissions.value = response.data
    }
  } catch (error) {
    const axiosError = error as ApiAxiosError
    console.error('Failed to load permissions:', axiosError)
    notificationStore.error('Erreur', 'Impossible de charger les permissions')
  } finally {
    loadingPermissions.value = false
  }
}

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    // Deselect all
    selectedPermissions.value = []
  } else {
    // Select all
    selectedPermissions.value = allPermissions.value.map(p => p.id)
  }
}

const validateForm = (): boolean => {
  errors.value = {}

  if (!formData.value.nom.trim()) {
    errors.value.nom = 'Le nom est requis'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    // Auto-generate slug from nom
    const autoSlug = formData.value.nom
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    if (isEditMode.value && props.role) {
      // Update existing role
      const updateData: UpdateRoleData = {
        nom: formData.value.nom,
        slug: autoSlug,
        description: formData.value.description
      }

      const response = await roleService.updateRole(props.role.id, updateData)

      if (response.success && response.data) {
        // Sync permissions separately for update
        if (selectedPermissions.value.length > 0) {
          await roleService.syncPermissions(props.role.id, selectedPermissions.value)
        }
        notificationStore.success('Rôle mis à jour', `Le rôle "${response.data.nom}" a été mis à jour avec succès`)
        close()
        emit('updated', response.data)
      } else {
        notificationStore.error('Erreur', response.message || 'Impossible de mettre à jour le rôle')
      }
    } else {
      // Create new role with permissions
      const createData: CreateRoleData = {
        nom: formData.value.nom,
        slug: autoSlug,
        description: formData.value.description,
        permission_ids: selectedPermissions.value
      }

      const response = await roleService.createRole(createData)

      if (response.success && response.data) {
        notificationStore.success('Rôle créé', `Le rôle "${response.data.nom}" a été créé avec succès`)
        close()
        emit('created', response.data)
      } else {
        notificationStore.error('Erreur', response.message || 'Impossible de créer le rôle')
      }
    }
  } catch (error) {
    const axiosError = error as ApiAxiosError
    console.error('Failed to save role:', axiosError)
    const message = axiosError.response?.data?.message || (isEditMode.value ? 'Impossible de mettre à jour le rôle' : 'Impossible de créer le rôle')
    notificationStore.error('Erreur', message)

    // Handle validation errors from backend
    if (axiosError.response?.data?.errors) {
      errors.value = axiosError.response.data.errors
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
    // Load permissions when modal opens
    await loadPermissions()

    if (props.role) {
      // Populate form with role data for editing
      formData.value = {
        nom: props.role.nom,
        slug: props.role.slug,
        description: props.role.description || ''
      }
      // Set selected permissions from role
      selectedPermissions.value = props.role.permissions?.map(p => p.id) || []
    } else {
      // Reset form for creating
      formData.value = {
        nom: '',
        slug: '',
        description: ''
      }
      selectedPermissions.value = []
    }
    errors.value = {}
  } else {
    // Reset all form states when modal closes
    formData.value = {
      nom: '',
      slug: '',
      description: ''
    }
    errors.value = {}
    selectedPermissions.value = []
    loading.value = false
    loadingPermissions.value = false
  }
})

// Auto-generate slug from nom
watch(() => formData.value.nom, (newNom) => {
  if (!isEditMode.value && newNom && !formData.value.slug) {
    formData.value.slug = newNom
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }
})
</script>
