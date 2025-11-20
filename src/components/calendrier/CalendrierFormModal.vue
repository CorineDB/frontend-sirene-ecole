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
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600">
        <div class="text-white">
          <h2 class="text-2xl font-bold">{{ editMode ? 'Modifier la période' : 'Nouvelle période de vacances' }}</h2>
          <p class="text-blue-100 text-sm mt-1">{{ editMode ? 'Modifiez les dates de la période' : 'Ajoutez une période de vacances au calendrier' }}</p>
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
              Nom de la période <span class="text-red-600">*</span>
            </label>
            <input
              v-model="formData.nom"
              type="text"
              placeholder="Ex: Vacances de Noël"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              :class="{ 'border-red-500': errors.nom }"
            />
            <p v-if="errors.nom" class="text-sm text-red-600 mt-1">{{ errors.nom }}</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Date de début <span class="text-red-600">*</span>
              </label>
              <input
                v-model="formData.date_debut"
                type="date"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                :class="{ 'border-red-500': errors.date_debut }"
              />
              <p v-if="errors.date_debut" class="text-sm text-red-600 mt-1">{{ errors.date_debut }}</p>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Date de fin <span class="text-red-600">*</span>
              </label>
              <input
                v-model="formData.date_fin"
                type="date"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                :class="{ 'border-red-500': errors.date_fin }"
              />
              <p v-if="errors.date_fin" class="text-sm text-red-600 mt-1">{{ errors.date_fin }}</p>
            </div>
          </div>

          <!-- Durée calculée -->
          <div v-if="formData.date_debut && formData.date_fin && !errors.date_fin" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-center gap-2 text-sm text-blue-800">
              <Calendar :size="18" class="text-blue-600" />
              <span class="font-semibold">Durée: {{ calculerDuree() }} jours</span>
            </div>
          </div>

          <!-- Warning chevauchement -->
          <div v-if="chevauchement" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div class="flex items-start gap-2">
              <AlertCircle :size="20" class="text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p class="text-sm font-semibold text-yellow-800">Attention: Chevauchement détecté</p>
                <p class="text-sm text-yellow-700 mt-1">Cette période chevauche avec:</p>
                <ul class="list-disc list-inside text-sm text-yellow-700 mt-1">
                  <li v-for="periode in periodesChevachantes" :key="periode.id">
                    {{ periode.nom }} ({{ formatDate(periode.date_debut) }} - {{ formatDate(periode.date_fin) }})
                  </li>
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
          :disabled="loading || chevauchement"
          type="button"
          class="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Enregistrement...' : (editMode ? 'Mettre à jour' : 'Enregistrer') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, Calendar, AlertCircle } from 'lucide-vue-next'
import calendrierService, { type PeriodeVacances, type CreatePeriodeVacancesRequest, type UpdatePeriodeVacancesRequest } from '../../services/calendrierService'
import { useNotificationStore } from '../../stores/notifications'

interface Props {
  isOpen: boolean
  ecoleId: string
  periode?: PeriodeVacances | null
}

interface Emits {
  (e: 'close'): void
  (e: 'created', periode: PeriodeVacances): void
  (e: 'updated', periode: PeriodeVacances): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const notificationStore = useNotificationStore()

const loading = ref(false)
const editMode = ref(false)
const chevauchement = ref(false)
const periodesChevachantes = ref<PeriodeVacances[]>([])

const formData = ref<CreatePeriodeVacancesRequest>({
  nom: '',
  date_debut: '',
  date_fin: '',
  ecole_id: props.ecoleId
})

const errors = ref<Record<string, string>>({})

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const calculerDuree = () => {
  const debut = new Date(formData.value.date_debut)
  const fin = new Date(formData.value.date_fin)
  const diffTime = Math.abs(fin.getTime() - debut.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays + 1 // +1 pour inclure les deux jours
}

const verifierChevauchement = async () => {
  if (!formData.value.date_debut || !formData.value.date_fin) return

  try {
    const response = await calendrierService.verifierChevauchement(
      props.ecoleId,
      formData.value.date_debut,
      formData.value.date_fin,
      props.periode?.id
    )

    if (response.success && response.data) {
      chevauchement.value = response.data.has_overlap
      periodesChevachantes.value = response.data.overlapping_periods || []
    }
  } catch (error) {
    console.error('Erreur vérification chevauchement:', error)
  }
}

const validateForm = (): boolean => {
  errors.value = {}

  if (!formData.value.nom.trim()) {
    errors.value.nom = 'Le nom est requis'
  }

  if (!formData.value.date_debut) {
    errors.value.date_debut = 'La date de début est requise'
  }

  if (!formData.value.date_fin) {
    errors.value.date_fin = 'La date de fin est requise'
  }

  if (formData.value.date_debut && formData.value.date_fin) {
    const debut = new Date(formData.value.date_debut)
    const fin = new Date(formData.value.date_fin)

    if (fin < debut) {
      errors.value.date_fin = 'La date de fin doit être après la date de début'
    }
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  if (chevauchement.value) {
    notificationStore.warning('Attention', 'Il y a un chevauchement avec une autre période')
    return
  }

  loading.value = true

  try {
    if (editMode.value && props.periode) {
      const updateData: UpdatePeriodeVacancesRequest = {
        nom: formData.value.nom,
        date_debut: formData.value.date_debut,
        date_fin: formData.value.date_fin
      }

      const response = await calendrierService.updatePeriodeVacances(props.periode.id, updateData)

      if (response.success && response.data) {
        notificationStore.success('Période modifiée', 'La période de vacances a été modifiée avec succès')
        emit('updated', response.data)
        close()
      } else {
        notificationStore.error('Erreur', response.message || 'Impossible de modifier la période')
      }
    } else {
      const response = await calendrierService.createPeriodeVacances(formData.value)

      if (response.success && response.data) {
        notificationStore.success('Période créée', 'La période de vacances a été créée avec succès')
        emit('created', response.data)
        close()
      } else {
        notificationStore.error('Erreur', response.message || 'Impossible de créer la période')
      }
    }
  } catch (error: any) {
    console.error('Failed to save periode:', error)
    const message = error.response?.data?.message || 'Impossible d\'enregistrer la période'
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
    date_debut: '',
    date_fin: '',
    ecole_id: props.ecoleId
  }
  errors.value = {}
  chevauchement.value = false
  periodesChevachantes.value = []
  loading.value = false
  editMode.value = false
  emit('close')
}

const initializeForm = () => {
  if (props.periode) {
    editMode.value = true
    formData.value = {
      nom: props.periode.nom,
      date_debut: props.periode.date_debut,
      date_fin: props.periode.date_fin,
      ecole_id: props.ecoleId
    }
  } else {
    editMode.value = false
  }
}

watch([() => props.isOpen, () => props.periode], ([isOpen]) => {
  if (isOpen) {
    initializeForm()
  }
}, { deep: true })

watch([() => formData.value.date_debut, () => formData.value.date_fin], () => {
  if (formData.value.date_debut && formData.value.date_fin) {
    verifierChevauchement()
  }
})
</script>
