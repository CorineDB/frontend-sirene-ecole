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
      <div class="inline-block w-full max-w-3xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
        <!-- Header -->
        <div class="flex items-start justify-between mb-6">
          <div>
            <h3 class="text-2xl font-bold text-gray-900">
              {{ isEditMode ? 'Modifier la programmation' : 'Créer une programmation' }}
            </h3>
            <p class="text-sm text-gray-600 mt-1">
              {{ stepDescriptions[currentStep] }}
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

        <!-- Progress Steps -->
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div
              v-for="(step, index) in steps"
              :key="index"
              class="flex-1 flex items-center"
            >
              <div class="flex items-center">
                <div
                  :class="[
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all',
                    currentStep === index
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : currentStep > index
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500',
                  ]"
                >
                  <Check v-if="currentStep > index" :size="20" />
                  <span v-else>{{ index + 1 }}</span>
                </div>
                <div class="ml-3 hidden sm:block">
                  <p
                    :class="[
                      'text-sm font-semibold',
                      currentStep === index ? 'text-blue-600' : 'text-gray-600',
                    ]"
                  >
                    {{ step }}
                  </p>
                </div>
              </div>
              <div
                v-if="index < steps.length - 1"
                :class="[
                  'flex-1 h-1 mx-4 rounded transition-all',
                  currentStep > index ? 'bg-green-500' : 'bg-gray-200',
                ]"
              ></div>
            </div>
          </div>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Étape 1: Informations générales -->
          <div v-if="currentStep === 0" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Nom de la programmation <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.nom"
                type="text"
                required
                placeholder="Ex: Sonnerie du matin"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{ 'border-red-500': errors.nom }"
              />
              <p v-if="errors.nom" class="text-sm text-red-600 mt-1">{{ errors.nom }}</p>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Durée de sonnerie (secondes)
              </label>
              <input
                v-model.number="formData.duree_sonnerie"
                type="number"
                min="1"
                max="300"
                placeholder="Ex: 30"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p class="text-xs text-gray-500 mt-1">Durée en secondes (1-300)</p>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Calendrier associé
              </label>
              <select
                v-model="formData.calendrier_id"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Aucun calendrier --</option>
                <option value="cal1">Calendrier scolaire 2024-2025</option>
                <option value="cal2">Calendrier personnalisé</option>
              </select>
              <p class="text-xs text-gray-500 mt-1">Optionnel: lier à un calendrier spécifique</p>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                v-model="formData.description"
                rows="3"
                placeholder="Description de la programmation..."
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
          </div>

          <!-- Étape 2: Horaires -->
          <div v-if="currentStep === 1" class="space-y-4">
            <div>
              <div class="flex items-center justify-between mb-3">
                <label class="block text-sm font-semibold text-gray-700">
                  Horaires de sonnerie <span class="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  @click="ajouterHoraire"
                  class="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                >
                  <Plus :size="16" />
                  Ajouter un horaire
                </button>
              </div>

              <div class="space-y-3">
                <div
                  v-for="(horaire, index) in formData.horaires"
                  :key="index"
                  class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <Clock :size="20" class="text-gray-400" />
                  <input
                    v-model="formData.horaires[index]"
                    type="time"
                    required
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    @click="supprimerHoraire(index)"
                    class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    :disabled="formData.horaires.length === 1"
                  >
                    <Trash :size="18" />
                  </button>
                </div>

                <p v-if="formData.horaires.length === 0" class="text-sm text-gray-500 text-center py-4">
                  Aucun horaire défini. Cliquez sur "Ajouter un horaire" pour commencer.
                </p>
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-3">
                Jours actifs <span class="text-red-500">*</span>
              </label>
              <div class="grid grid-cols-7 gap-2">
                <button
                  v-for="jour in joursOptions"
                  :key="jour.value"
                  type="button"
                  @click="toggleJour(jour.value)"
                  :class="[
                    'px-3 py-3 rounded-lg font-semibold text-sm transition-all',
                    formData.jours_semaine.includes(jour.value)
                      ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                  ]"
                >
                  {{ jour.label }}
                </button>
              </div>
              <p class="text-xs text-gray-500 mt-2">
                Sélectionnez les jours où cette programmation sera active
              </p>
            </div>

            <div class="p-4 bg-blue-50 rounded-lg">
              <div class="flex items-start gap-3">
                <Info :size="20" class="text-blue-600 mt-0.5" />
                <div>
                  <p class="text-sm font-semibold text-blue-900 mb-1">Prévisualisation masque binaire</p>
                  <p class="text-xs text-blue-700 font-mono">
                    {{ generateMasqueBinaire() }}
                  </p>
                  <p class="text-xs text-blue-600 mt-1">
                    {{ formData.jours_semaine.length }} jour(s) sélectionné(s),
                    {{ formData.horaires.length }} horaire(s) défini(s)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Étape 3: Exceptions -->
          <div v-if="currentStep === 2" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-3">
                Jours fériés
              </label>
              <div class="space-y-2">
                <label class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    v-model="formData.inclure_feries"
                    type="checkbox"
                    class="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span class="text-sm text-gray-700">Activer pendant les jours fériés</span>
                </label>
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-3">
                <label class="block text-sm font-semibold text-gray-700">
                  Exceptions spécifiques
                </label>
                <button
                  type="button"
                  @click="ajouterException"
                  class="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                >
                  <Plus :size="16" />
                  Ajouter une exception
                </button>
              </div>

              <div class="space-y-3">
                <div
                  v-for="(exception, index) in formData.exceptions"
                  :key="index"
                  class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <Calendar :size="20" class="text-gray-400" />
                  <input
                    v-model="formData.exceptions[index].date"
                    type="date"
                    required
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    v-model="formData.exceptions[index].type"
                    class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="exclude">Exclure</option>
                    <option value="include">Inclure</option>
                  </select>
                  <button
                    type="button"
                    @click="supprimerException(index)"
                    class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash :size="18" />
                  </button>
                </div>

                <p v-if="formData.exceptions.length === 0" class="text-sm text-gray-500 text-center py-4">
                  Aucune exception définie.
                </p>
              </div>
            </div>

            <div class="p-4 bg-yellow-50 rounded-lg">
              <div class="flex items-start gap-3">
                <AlertCircle :size="20" class="text-yellow-600 mt-0.5" />
                <div>
                  <p class="text-sm font-semibold text-yellow-900 mb-1">À propos des exceptions</p>
                  <p class="text-xs text-yellow-700">
                    Les exceptions permettent d'inclure ou d'exclure des dates spécifiques de la programmation.
                    Par exemple, vous pouvez exclure un jour de formation ou inclure un événement spécial.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Étape 4: Validation -->
          <div v-if="currentStep === 3" class="space-y-4">
            <div class="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
              <h4 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle :size="24" class="text-green-600" />
                Résumé de la programmation
              </h4>

              <div class="space-y-3 text-sm">
                <div class="flex justify-between p-3 bg-white rounded-lg">
                  <span class="text-gray-600 font-semibold">Nom:</span>
                  <span class="text-gray-900">{{ formData.nom || 'Non défini' }}</span>
                </div>

                <div class="flex justify-between p-3 bg-white rounded-lg">
                  <span class="text-gray-600 font-semibold">Durée sonnerie:</span>
                  <span class="text-gray-900">{{ formData.duree_sonnerie || 'N/A' }} secondes</span>
                </div>

                <div class="flex justify-between p-3 bg-white rounded-lg">
                  <span class="text-gray-600 font-semibold">Nombre d'horaires:</span>
                  <span class="text-gray-900">{{ formData.horaires.length }}</span>
                </div>

                <div class="p-3 bg-white rounded-lg">
                  <span class="text-gray-600 font-semibold block mb-2">Horaires:</span>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="(horaire, idx) in formData.horaires"
                      :key="idx"
                      class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold"
                    >
                      {{ horaire }}
                    </span>
                  </div>
                </div>

                <div class="p-3 bg-white rounded-lg">
                  <span class="text-gray-600 font-semibold block mb-2">Jours actifs:</span>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="jour in formData.jours_semaine"
                      :key="jour"
                      class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold"
                    >
                      {{ getJourLabel(jour) }}
                    </span>
                  </div>
                </div>

                <div class="flex justify-between p-3 bg-white rounded-lg">
                  <span class="text-gray-600 font-semibold">Exceptions:</span>
                  <span class="text-gray-900">{{ formData.exceptions.length }}</span>
                </div>
              </div>
            </div>

            <div class="p-4 bg-purple-50 rounded-lg">
              <div class="flex items-start gap-3">
                <Key :size="20" class="text-purple-600 mt-0.5" />
                <div class="flex-1">
                  <p class="text-sm font-semibold text-purple-900 mb-2">Chaîne cryptée</p>
                  <div class="p-3 bg-white rounded-lg font-mono text-xs text-gray-700 break-all">
                    {{ generateChaineCryptee() }}
                  </div>
                  <p class="text-xs text-purple-700 mt-2">
                    Longueur: {{ generateChaineCryptee().length }} caractères
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  v-model="formData.actif"
                  type="checkbox"
                  class="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span class="text-sm text-gray-700 font-semibold">Activer immédiatement cette programmation</span>
              </label>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-4 border-t border-gray-200">
            <button
              v-if="currentStep > 0"
              type="button"
              @click="previousStep"
              class="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <ChevronLeft :size="20" />
              Précédent
            </button>
            <button
              type="button"
              @click="close"
              class="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              Annuler
            </button>
            <button
              v-if="currentStep < steps.length - 1"
              type="button"
              @click="nextStep"
              :disabled="!canProceedToNextStep()"
              class="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
              <ChevronRight :size="20" />
            </button>
            <button
              v-if="currentStep === steps.length - 1"
              type="submit"
              :disabled="loading"
              class="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send :size="20" />
              {{ loading ? 'En cours...' : (isEditMode ? 'Modifier' : 'Créer et envoyer') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import {
  X,
  Check,
  Clock,
  Calendar,
  Plus,
  Trash,
  Info,
  AlertCircle,
  CheckCircle,
  Key,
  ChevronLeft,
  ChevronRight,
  Send,
} from 'lucide-vue-next'
import { useAsyncAction } from '@/composables/useAsyncAction'
import { useNotificationStore } from '@/stores/notifications'
import programmationService from '@/services/programmationService'
import type { ApiProgrammation, CreateProgrammationRequest } from '@/types/api'

const props = defineProps<{
  isOpen: boolean
  sireneId: string
  programmation?: ApiProgrammation | null
}>()

const emit = defineEmits<{
  close: []
  save: []
}>()

const { loading, execute } = useAsyncAction()
const notificationStore = useNotificationStore()

const currentStep = ref(0)
const steps = ['Informations', 'Horaires', 'Exceptions', 'Validation']
const stepDescriptions = [
  'Définissez les informations de base',
  'Configurez les horaires de sonnerie',
  'Gérez les jours fériés et exceptions',
  'Vérifiez et validez la programmation',
]

interface FormData {
  nom: string
  duree_sonnerie: number
  calendrier_id: string
  description: string
  horaires: string[]
  jours_semaine: string[]
  inclure_feries: boolean
  exceptions: Array<{ date: string; type: 'include' | 'exclude' }>
  actif: boolean
}

const formData = ref<FormData>({
  nom: '',
  duree_sonnerie: 30,
  calendrier_id: '',
  description: '',
  horaires: ['08:00'],
  jours_semaine: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'],
  inclure_feries: false,
  exceptions: [],
  actif: true,
})

const errors = ref<Record<string, string>>({})

const joursOptions = [
  { label: 'Lun', value: 'lundi' },
  { label: 'Mar', value: 'mardi' },
  { label: 'Mer', value: 'mercredi' },
  { label: 'Jeu', value: 'jeudi' },
  { label: 'Ven', value: 'vendredi' },
  { label: 'Sam', value: 'samedi' },
  { label: 'Dim', value: 'dimanche' },
]

const isEditMode = computed(() => !!props.programmation)

// Watch for programmation changes
watch(
  () => props.programmation,
  (newProg) => {
    if (newProg) {
      formData.value = {
        nom: newProg.nom,
        duree_sonnerie: 30,
        calendrier_id: '',
        description: '',
        horaires: [newProg.heure_debut],
        jours_semaine: newProg.jours_semaine || [],
        inclure_feries: false,
        exceptions: [],
        actif: newProg.actif,
      }
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

// Reset form to defaults
const resetForm = () => {
  formData.value = {
    nom: '',
    duree_sonnerie: 30,
    calendrier_id: '',
    description: '',
    horaires: ['08:00'],
    jours_semaine: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'],
    inclure_feries: false,
    exceptions: [],
    actif: true,
  }
  currentStep.value = 0
  errors.value = {}
}

// Navigation
const nextStep = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const canProceedToNextStep = (): boolean => {
  switch (currentStep.value) {
    case 0:
      return !!formData.value.nom.trim()
    case 1:
      return formData.value.horaires.length > 0 && formData.value.jours_semaine.length > 0
    case 2:
      return true
    default:
      return true
  }
}

// Horaires
const ajouterHoraire = () => {
  formData.value.horaires.push('08:00')
}

const supprimerHoraire = (index: number) => {
  if (formData.value.horaires.length > 1) {
    formData.value.horaires.splice(index, 1)
  }
}

// Jours
const toggleJour = (jour: string) => {
  const index = formData.value.jours_semaine.indexOf(jour)
  if (index > -1) {
    formData.value.jours_semaine.splice(index, 1)
  } else {
    formData.value.jours_semaine.push(jour)
  }
}

const getJourLabel = (jour: string): string => {
  const found = joursOptions.find((j) => j.value === jour)
  return found?.label || jour
}

// Exceptions
const ajouterException = () => {
  formData.value.exceptions.push({ date: '', type: 'exclude' })
}

const supprimerException = (index: number) => {
  formData.value.exceptions.splice(index, 1)
}

// Génération masque binaire
const generateMasqueBinaire = (): string => {
  const jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
  const masque = jours.map((jour) => (formData.value.jours_semaine.includes(jour) ? '1' : '0')).join('')
  return masque
}

// Génération chaîne cryptée (simulation)
const generateChaineCryptee = (): string => {
  const data = {
    nom: formData.value.nom,
    horaires: formData.value.horaires,
    jours: formData.value.jours_semaine,
    duree: formData.value.duree_sonnerie,
  }
  const json = JSON.stringify(data)
  return btoa(json)
}

// Handle submit
const handleSubmit = async () => {
  errors.value = {}

  // Validation
  if (!formData.value.nom.trim()) {
    errors.value.nom = 'Le nom est requis'
    currentStep.value = 0
    return
  }

  if (formData.value.horaires.length === 0) {
    notificationStore.error('Au moins un horaire est requis')
    currentStep.value = 1
    return
  }

  if (formData.value.jours_semaine.length === 0) {
    notificationStore.error('Au moins un jour doit être sélectionné')
    currentStep.value = 1
    return
  }

  // Prepare request data
  const requestData: CreateProgrammationRequest = {
    nom: formData.value.nom,
    heure_debut: formData.value.horaires[0], // Prend le premier horaire pour l'instant
    heure_fin: null,
    jours_semaine: formData.value.jours_semaine,
    actif: formData.value.actif,
  }

  // Call API
  const result = await execute(
    () =>
      isEditMode.value
        ? programmationService.updateProgrammation(
            props.sireneId,
            props.programmation!.id,
            requestData
          )
        : programmationService.createProgrammation(props.sireneId, requestData),
    {
      errorMessage: isEditMode.value
        ? 'Impossible de modifier la programmation'
        : 'Impossible de créer la programmation',
      showNotification: false,
    }
  )

  if (result?.success) {
    notificationStore.success(
      isEditMode.value ? 'Programmation modifiée avec succès' : 'Programmation créée avec succès'
    )
    emit('save')
    close()
  }
}

const close = () => {
  resetForm()
  emit('close')
}
</script>
