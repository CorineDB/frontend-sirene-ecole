<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click="close"
  >
    <div
      class="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      @click.stop
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-600 to-pink-600">
        <div class="text-white">
          <h2 class="text-2xl font-bold">{{ editMode ? 'Modifier le jour férié' : 'Nouveau jour férié' }}</h2>
          <p class="text-purple-100 text-sm mt-1">{{ editMode ? 'Modifiez les informations du jour férié' : 'Ajoutez un jour férié spécifique à l\'école' }}</p>
        </div>
        <button
          @click="close"
          class="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
        >
          <X :size="24" />
        </button>
      </div>

      <!-- Form Content -->
      <div class="flex-1 overflow-y-auto px-6 py-6">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Nom du jour férié <span class="text-red-600">*</span>
            </label>
            <input
              v-model="formData.nom"
              type="text"
              placeholder="Ex: Fête locale, Journée pédagogique"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              :class="{ 'border-red-500': errors.nom }"
            />
            <p v-if="errors.nom" class="text-sm text-red-600 mt-1">{{ errors.nom }}</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Date <span class="text-red-600">*</span>
              </label>
              <input
                v-model="formData.date"
                type="date"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                :class="{ 'border-red-500': errors.date }"
              />
              <p v-if="errors.date" class="text-sm text-red-600 mt-1">{{ errors.date }}</p>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Type <span class="text-red-600">*</span>
              </label>
              <select
                v-model="formData.type"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                :class="{ 'border-red-500': errors.type }"
              >
                <option value="ecole">Spécifique à l'école</option>
                <option value="mobile">Date mobile (annuelle)</option>
              </select>
              <p v-if="errors.type" class="text-sm text-red-600 mt-1">{{ errors.type }}</p>
            </div>
          </div>

          <div>
            <label class="flex items-center gap-3 cursor-pointer">
              <input
                v-model="formData.recurrent"
                type="checkbox"
                class="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
              />
              <div>
                <span class="text-sm font-semibold text-gray-900">Récurrent chaque année</span>
                <p class="text-xs text-gray-600">Ce jour férié se répète automatiquement chaque année</p>
              </div>
            </label>
          </div>

          <!-- Info box -->
          <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div class="flex items-start gap-2">
              <Info :size="20" class="text-purple-600 mt-0.5 flex-shrink-0" />
              <div class="text-sm text-purple-800">
                <p class="font-semibold mb-1">Types de jours fériés</p>
                <ul class="list-disc list-inside space-y-1">
                  <li><strong>Spécifique à l'école</strong> : Jour férié unique pour cette école (ex: fête locale)</li>
                  <li><strong>Date mobile</strong> : Jour férié dont la date change chaque année (ex: Pâques, Ramadan)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
        <button
          @click="close"
          type="button"
          class="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-semibold transition-colors"
        >
          Annuler
        </button>

        <button
          @click="handleSubmit"
          :disabled="loading"
          type="button"
          class="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Enregistrement...' : (editMode ? 'Mettre à jour' : 'Enregistrer') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, Info } from 'lucide-vue-next'
import jourFerieService, { type JourFerie, type CreateJourFerieRequest, type UpdateJourFerieRequest } from '../../services/jourFerieService'
import { useNotificationStore } from '../../stores/notifications'

interface Props {
  isOpen: boolean
  ecoleId: string
  jourFerie?: JourFerie | null
}

interface Emits {
  (e: 'close'): void
  (e: 'created', jourFerie: JourFerie): void
  (e: 'updated', jourFerie: JourFerie): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const notificationStore = useNotificationStore()

const loading = ref(false)
const editMode = ref(false)

const formData = ref<CreateJourFerieRequest>({
  nom: '',
  date: '',
  type: 'ecole',
  recurrent: false,
  ecole_id: props.ecoleId
})

const errors = ref<Record<string, string>>({})

const validateForm = (): boolean => {
  errors.value = {}

  if (!formData.value.nom.trim()) {
    errors.value.nom = 'Le nom est requis'
  }

  if (!formData.value.date) {
    errors.value.date = 'La date est requise'
  }

  if (!formData.value.type) {
    errors.value.type = 'Le type est requis'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    if (editMode.value && props.jourFerie) {
      const updateData: UpdateJourFerieRequest = {
        nom: formData.value.nom,
        date: formData.value.date,
        type: formData.value.type,
        recurrent: formData.value.recurrent
      }

      const response = await jourFerieService.updateJourFerie(props.jourFerie.id, updateData)

      if (response.success && response.data) {
        notificationStore.success('Jour férié modifié', 'Le jour férié a été modifié avec succès')
        emit('updated', response.data)
        close()
      } else {
        notificationStore.error('Erreur', response.message || 'Impossible de modifier le jour férié')
      }
    } else {
      const response = await jourFerieService.createJourFerie(formData.value)

      if (response.success && response.data) {
        notificationStore.success('Jour férié créé', 'Le jour férié a été créé avec succès')
        emit('created', response.data)
        close()
      } else {
        notificationStore.error('Erreur', response.message || 'Impossible de créer le jour férié')
      }
    }
  } catch (error: any) {
    console.error('Failed to save jour ferie:', error)
    const message = error.response?.data?.message || 'Impossible d\'enregistrer le jour férié'
    notificationStore.error('Erreur', message)

    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors
    }
  } finally {
    loading.value = false
  }
}

const close = () => {
  formData.value = {
    nom: '',
    date: '',
    type: 'ecole',
    recurrent: false,
    ecole_id: props.ecoleId
  }
  errors.value = {}
  loading.value = false
  editMode.value = false
  emit('close')
}

const initializeForm = () => {
  if (props.jourFerie) {
    editMode.value = true
    formData.value = {
      nom: props.jourFerie.nom,
      date: props.jourFerie.date,
      type: props.jourFerie.type,
      recurrent: props.jourFerie.recurrent,
      ecole_id: props.ecoleId
    }
  } else {
    editMode.value = false
  }
}

watch([() => props.isOpen, () => props.jourFerie], ([isOpen]) => {
  if (isOpen) {
    initializeForm()
  }
}, { deep: true })
</script>
