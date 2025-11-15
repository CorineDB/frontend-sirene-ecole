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
              {{ isEditMode ? 'Modifier le modèle de sirène' : 'Ajouter un nouveau modèle' }}
            </h3>
            <p class="text-sm text-gray-600 mt-1">
              {{ isEditMode ? 'Modifiez les informations du modèle' : 'Remplissez les informations du nouveau modèle' }}
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
          <!-- Nom du modèle -->
          <div>
            <label for="model_name" class="block text-sm font-semibold text-gray-700 mb-2">
              Nom du modèle <span class="text-red-500">*</span>
            </label>
            <input
              id="model_name"
              v-model="formData.model_name"
              type="text"
              required
              placeholder="Ex: SchoolBell Pro"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus-visible:ring-2 focus-visible:ring-blue-600"
              :class="{ 'border-red-500': errors.model_name }"
              :aria-invalid="!!errors.model_name"
              :aria-describedby="errors.model_name ? 'model-name-error' : undefined"
            />
            <p v-if="errors.model_name" id="model-name-error" class="text-sm text-red-600 mt-1" role="alert">{{ errors.model_name }}</p>
          </div>

          <!-- Code du modèle -->
          <div>
            <label for="model_code" class="block text-sm font-semibold text-gray-700 mb-2">
              Code du modèle <span class="text-red-500">*</span>
            </label>
            <input
              id="model_code"
              v-model="formData.model_code"
              type="text"
              required
              placeholder="Ex: SBP-100"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus-visible:ring-2 focus-visible:ring-blue-600"
              :class="{ 'border-red-500': errors.model_code }"
              :aria-invalid="!!errors.model_code"
              :aria-describedby="errors.model_code ? 'model-code-error' : undefined"
            />
            <p v-if="errors.model_code" id="model-code-error" class="text-sm text-red-600 mt-1" role="alert">{{ errors.model_code }}</p>
          </div>

          <!-- Description -->
          <div>
            <label for="description" class="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              v-model="formData.description"
              rows="4"
              placeholder="Ajoutez une description du modèle (optionnel)"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus-visible:ring-2 focus-visible:ring-blue-600 resize-none"
              :class="{ 'border-red-500': errors.description }"
              :aria-invalid="!!errors.description"
              :aria-describedby="errors.description ? 'description-error' : undefined"
            />
            <p v-if="errors.description" id="description-error" class="text-sm text-red-600 mt-1" role="alert">{{ errors.description }}</p>
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
import sirenService from '@/services/sirenService'
import type {
  ApiSirenModel,
  CreateSirenModelRequest,
  UpdateSirenModelRequest,
} from '@/types/api'
import type { ApiAxiosError } from '@/types/api'
import { useNotificationStore } from '@/stores/notifications'

interface Props {
  isOpen: boolean
  model?: ApiSirenModel | null
}

interface Emits {
  (e: 'close'): void
  (e: 'created', model: ApiSirenModel): void
  (e: 'updated', model: ApiSirenModel): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const notificationStore = useNotificationStore()

const isEditMode = computed(() => !!props.model)

const formData = ref<CreateSirenModelRequest & UpdateSirenModelRequest>({
  model_name: '',
  model_code: '',
  description: ''
})

const errors = ref<Record<string, string>>({})
const loading = ref(false)

const validateForm = (): boolean => {
  errors.value = {}

  if (!formData.value.model_name?.trim()) {
    errors.value.model_name = 'Le nom du modèle est requis'
  }

  if (!formData.value.model_code?.trim()) {
    errors.value.model_code = 'Le code du modèle est requis'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    if (isEditMode.value && props.model) {
      // Update existing model
      const updateData: UpdateSirenModelRequest = {
        model_name: formData.value.model_name,
        model_code: formData.value.model_code,
        description: formData.value.description || null
      }

      const response = await sirenService.updateSirenModel(props.model.id, updateData)

      if (response?.success && response.data) {
        notificationStore.success(
          'Modèle modifié',
          'Le modèle de sirène a été modifié avec succès'
        )
        emit('updated', response.data)
        close()
      }
    } else {
      // Create new model
      const createData: CreateSirenModelRequest = {
        model_name: formData.value.model_name,
        model_code: formData.value.model_code,
        description: formData.value.description || null
      }

      const response = await sirenService.createSirenModel(createData)

      if (response?.success && response.data) {
        notificationStore.success(
          'Modèle créé',
          'Le modèle de sirène a été créé avec succès'
        )
        emit('created', response.data)
        close()
      }
    }
  } catch (error) {
    const axiosError = error as ApiAxiosError
    console.error('Failed to save siren model:', axiosError)

    // Handle validation errors from backend
    if (axiosError.response?.data?.errors) {
      errors.value = axiosError.response.data.errors as Record<string, string>
    } else {
      notificationStore.error(
        'Erreur',
        isEditMode.value
          ? 'Impossible de modifier le modèle de sirène'
          : 'Impossible de créer le modèle de sirène'
      )
    }
  } finally {
    loading.value = false
  }
}

const close = () => {
  emit('close')
}

// Watch for modal opening/closing
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    if (props.model) {
      // Populate form with model data for editing
      formData.value = {
        model_name: props.model.model_name,
        model_code: props.model.model_code,
        description: props.model.description || ''
      }
    } else {
      // Reset form for creating
      formData.value = {
        model_name: '',
        model_code: '',
        description: ''
      }
    }
    errors.value = {}
  } else {
    // Reset all form states when modal closes
    formData.value = {
      model_name: '',
      model_code: '',
      description: ''
    }
    errors.value = {}
    loading.value = false
  }
})
</script>
