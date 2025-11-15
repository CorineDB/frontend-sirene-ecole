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
              {{ isEditMode ? 'Modifier la sirène' : 'Ajouter une nouvelle sirène' }}
            </h3>
            <p class="text-sm text-gray-600 mt-1">
              {{ isEditMode ? 'Modifiez les informations de la sirène' : 'Remplissez les informations de la nouvelle sirène' }}
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
          <!-- Modèle de sirène -->
          <div>
            <label for="modele_id" class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              Modèle de sirène <span class="text-red-500">*</span>
              <Loader2 v-if="loadingModels" :size="16" class="animate-spin text-blue-600" aria-label="Chargement des modèles" />
            </label>
            <select
              id="modele_id"
              v-model="formData.modele_id"
              required
              :disabled="loadingModels"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus-visible:ring-2 focus-visible:ring-blue-600"
              :class="{ 'border-red-500': errors.modele_id, 'opacity-50 cursor-not-allowed': loadingModels }"
              :aria-invalid="!!errors.modele_id"
              :aria-describedby="errors.modele_id ? 'modele-error' : undefined"
            >
              <option value="">{{ loadingModels ? 'Chargement des modèles...' : 'Sélectionnez un modèle' }}</option>
              <option
                v-for="model in availableModels"
                :key="model.id"
                :value="model.id"
              >
                {{ model.model_name }} ({{ model.model_code }})
              </option>
            </select>
            <p v-if="errors.modele_id" id="modele-error" class="text-sm text-red-600 mt-1" role="alert">{{ errors.modele_id }}</p>
          </div>

          <!-- Date de fabrication -->
          <div>
            <label for="date_fabrication" class="block text-sm font-semibold text-gray-700 mb-2">
              Date de fabrication <span class="text-red-500">*</span>
            </label>
            <input
              id="date_fabrication"
              v-model="formData.date_fabrication"
              type="date"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus-visible:ring-2 focus-visible:ring-blue-600"
              :class="{ 'border-red-500': errors.date_fabrication }"
              :aria-invalid="!!errors.date_fabrication"
              :aria-describedby="errors.date_fabrication ? 'date-error' : undefined"
            />
            <p v-if="errors.date_fabrication" id="date-error" class="text-sm text-red-600 mt-1" role="alert">{{ errors.date_fabrication }}</p>
          </div>

          <!-- Notes -->
          <div>
            <label for="notes" class="block text-sm font-semibold text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              id="notes"
              v-model="formData.notes"
              rows="4"
              placeholder="Ajoutez des notes ou commentaires (optionnel)"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus-visible:ring-2 focus-visible:ring-blue-600 resize-none"
              :class="{ 'border-red-500': errors.notes }"
              :aria-invalid="!!errors.notes"
              :aria-describedby="errors.notes ? 'notes-error' : undefined"
            />
            <p v-if="errors.notes" id="notes-error" class="text-sm text-red-600 mt-1" role="alert">{{ errors.notes }}</p>
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
import { X, Loader2 } from 'lucide-vue-next'
import { useSirens } from '@/composables/useSirens'
import type {
  ApiSiren,
  ApiSirenModel,
  CreateSirenRequest,
  UpdateSirenRequest,
} from '@/types/api'
import type { ApiAxiosError } from '@/types/api'
import { useNotificationStore } from '@/stores/notifications'

interface Props {
  isOpen: boolean
  siren?: ApiSiren | null
}

interface Emits {
  (e: 'close'): void
  (e: 'created', siren: ApiSiren): void
  (e: 'updated', siren: ApiSiren): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const notificationStore = useNotificationStore()
const { createSiren, updateSiren, loadSirenModels, sirenModels } = useSirens()

const isEditMode = computed(() => !!props.siren)

const formData = ref<CreateSirenRequest & UpdateSirenRequest>({
  modele_id: '',
  date_fabrication: '',
  notes: ''
})

const errors = ref<Record<string, string>>({})
const loading = ref(false)
const loadingModels = ref(false)
const availableModels = ref<ApiSirenModel[]>([])

const loadModels = async () => {
  loadingModels.value = true
  try {
    await loadSirenModels()
    availableModels.value = sirenModels.value
  } catch (error) {
    const axiosError = error as ApiAxiosError
    console.error('Failed to load siren models:', axiosError)
    notificationStore.error('Erreur', 'Impossible de charger les modèles de sirènes')
  } finally {
    loadingModels.value = false
  }
}

const validateForm = (): boolean => {
  errors.value = {}

  if (!formData.value.modele_id?.trim()) {
    errors.value.modele_id = 'Le modèle de sirène est requis'
  }

  if (!formData.value.date_fabrication?.trim()) {
    errors.value.date_fabrication = 'La date de fabrication est requise'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    if (isEditMode.value && props.siren) {
      // Update existing siren
      const updateData: UpdateSirenRequest = {
        modele_id: formData.value.modele_id,
        date_fabrication: formData.value.date_fabrication,
        notes: formData.value.notes || null
      }

      const response = await updateSiren(props.siren.id, updateData)

      if (response?.success && response.data) {
        emit('updated', response.data)
        close()
      }
    } else {
      // Create new siren
      const createData: CreateSirenRequest = {
        modele_id: formData.value.modele_id,
        date_fabrication: formData.value.date_fabrication,
        notes: formData.value.notes || null
      }

      const response = await createSiren(createData)

      if (response?.success && response.data) {
        emit('created', response.data)
        close()
      }
    }
  } catch (error) {
    const axiosError = error as ApiAxiosError
    console.error('Failed to save siren:', axiosError)

    // Handle validation errors from backend
    if (axiosError.response?.data?.errors) {
      errors.value = axiosError.response.data.errors as Record<string, string>
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
    // Load models when modal opens
    await loadModels()

    if (props.siren) {
      // Populate form with siren data for editing
      formData.value = {
        modele_id: props.siren.modele_id,
        date_fabrication: props.siren.date_fabrication,
        notes: props.siren.notes || ''
      }
    } else {
      // Reset form for creating
      formData.value = {
        modele_id: '',
        date_fabrication: '',
        notes: ''
      }
    }
    errors.value = {}
  } else {
    // Reset all form states when modal closes
    formData.value = {
      modele_id: '',
      date_fabrication: '',
      notes: ''
    }
    errors.value = {}
    loading.value = false
    loadingModels.value = false
  }
})
</script>
