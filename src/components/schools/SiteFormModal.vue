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
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-green-600 to-emerald-600">
        <div class="text-white">
          <h2 class="text-2xl font-bold">{{ title }}</h2>
          <p class="text-green-100 text-sm mt-1">{{ subtitle }}</p>
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
          <!-- Nom du site (pour sites annexes uniquement) -->
          <div v-if="!isPrincipal">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Nom du site <span class="text-red-600">*</span>
            </label>
            <input
              v-model="formData.nom"
              type="text"
              placeholder="Ex: Site Annexe Sud"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              :class="{ 'border-red-500': errors.nom }"
            />
            <p v-if="errors.nom" class="text-sm text-red-600 mt-1">{{ errors.nom }}</p>
          </div>

          <!-- Adresse -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Adresse <span class="text-red-600">*</span>
            </label>
            <textarea
              v-model="formData.adresse"
              rows="2"
              placeholder="Adresse complète du site"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              :class="{ 'border-red-500': errors.adresse }"
            ></textarea>
            <p v-if="errors.adresse" class="text-sm text-red-600 mt-1">{{ errors.adresse }}</p>
          </div>

          <!-- Ville -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Ville <span class="text-red-600">*</span>
            </label>
            <select
              v-model="formData.ville_id"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              :class="{ 'border-red-500': errors.ville_id }"
            >
              <option value="">Sélectionner une ville</option>
              <option v-for="ville in villes" :key="ville.id" :value="ville.id">
                {{ ville.nom }}
              </option>
            </select>
            <p v-if="errors.ville_id" class="text-sm text-red-600 mt-1">{{ errors.ville_id }}</p>
          </div>

          <!-- Types d'établissement -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Types d'établissement <span class="text-red-600">*</span>
            </label>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <label
                v-for="type in typesEtablissement"
                :key="type.value"
                class="flex items-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                :class="{ 'bg-green-50 border-green-500': formData.types_etablissement.includes(type.value) }"
              >
                <input
                  type="checkbox"
                  :value="type.value"
                  v-model="formData.types_etablissement"
                  class="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                />
                <span class="text-sm font-medium text-gray-900">{{ type.label }}</span>
              </label>
            </div>
            <p v-if="errors.types_etablissement" class="text-sm text-red-600 mt-1">{{ errors.types_etablissement }}</p>
          </div>

          <!-- Location Picker -->
          <LocationPicker
            v-model="siteLocation"
            label="Localisation GPS (optionnel)"
          />

          <!-- Sirène (en mode création uniquement ou avec bouton éditer en mode modification) -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Sirène <span class="text-red-600">*</span>
            </label>

            <!-- Mode édition : afficher les détails de la sirène avec icône crayon -->
            <div v-if="isEditMode && !isEditingSirene && formData.sirene.numero_serie" class="border border-gray-300 rounded-lg p-4 bg-gradient-to-br from-purple-50 to-pink-50">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bell :size="20" class="text-white" />
                  </div>
                  <div>
                    <p class="text-xs text-purple-600 font-semibold">Sirène installée</p>
                    <p class="text-base font-bold text-purple-900">{{ formData.sirene.numero_serie }}</p>
                  </div>
                </div>
                <button
                  @click="isEditingSirene = true"
                  type="button"
                  class="px-3 py-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-2"
                  title="Modifier la sirène"
                >
                  <Pencil :size="18" />
                  <span class="text-sm font-medium">Modifier</span>
                </button>
              </div>
            </div>

            <!-- Mode création OU mode édition avec modification activée -->
            <div v-else class="flex gap-2">
              <select
                v-model="formData.sirene.numero_serie"
                class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                :class="{ 'border-red-500': errors['sirene.numero_serie'] }"
              >
                <option value="">Sélectionner une sirène disponible</option>
                <option v-for="sirene in sirenesdisponibles" :key="sirene.numero_serie" :value="sirene.numero_serie">
                  {{ sirene.numero_serie }}
                </option>
              </select>
              <button
                @click="loadSirenesDisponibles"
                type="button"
                class="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                title="Recharger les sirènes"
              >
                <RefreshCw :size="20" />
              </button>
              <button
                v-if="isEditMode && isEditingSirene"
                @click="isEditingSirene = false"
                type="button"
                class="px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                title="Annuler la modification"
              >
                <X :size="20" />
              </button>
            </div>
            <p v-if="errors['sirene.numero_serie']" class="text-sm text-red-600 mt-1">{{ errors['sirene.numero_serie'] }}</p>
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
          class="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? (isEditMode ? 'Modification...' : 'Ajout...') : (isEditMode ? 'Modifier' : 'Ajouter') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { X, RefreshCw, Pencil, Bell } from 'lucide-vue-next'
import villeService, { type Ville } from '../../services/villeService'
import sireneService, { type Sirene } from '../../services/sireneService'
import siteService from '../../services/siteService'
import LocationPicker from '../common/LocationPicker.vue'
import { useNotificationStore } from '../../stores/notifications'

interface Props {
  isOpen: boolean
  site?: any | null
  ecoleId: string
  isPrincipal?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'saved'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const notificationStore = useNotificationStore()

const isEditMode = computed(() => !!props.site)
const title = computed(() => {
  if (props.isPrincipal) {
    return isEditMode.value ? 'Modifier le site principal' : 'Site principal'
  }
  return isEditMode.value ? 'Modifier le site annexe' : 'Ajouter un site annexe'
})
const subtitle = computed(() => {
  if (isEditMode.value) {
    return 'Modifiez les informations du site'
  }
  return props.isPrincipal ? 'Informations du site principal' : 'Ajoutez un nouveau site à l\'école'
})

const loading = ref(false)
const villes = ref<Ville[]>([])
const sirenesdisponibles = ref<Sirene[]>([])
const isEditingSirene = ref(false)

const typesEtablissement = [
  { value: 'MATERNELLE', label: 'Maternelle' },
  { value: 'PRIMAIRE', label: 'Primaire' },
  { value: 'SECONDAIRE', label: 'Secondaire' },
  { value: 'SUPERIEUR', label: 'Supérieur' }
]

const formData = ref({
  nom: '',
  adresse: '',
  ville_id: '',
  latitude: undefined as number | undefined,
  longitude: undefined as number | undefined,
  types_etablissement: [] as string[],
  sirene: {
    numero_serie: ''
  }
})

const errors = ref<Record<string, string>>({})

const siteLocation = computed({
  get: () => ({
    latitude: formData.value.latitude,
    longitude: formData.value.longitude
  }),
  set: (value) => {
    formData.value.latitude = value.latitude
    formData.value.longitude = value.longitude
  }
})

const loadVilles = async () => {
  try {
    const response = await villeService.getAllVilles()
    if (response.success && response.data) {
      villes.value = response.data
    }
  } catch (error: any) {
    console.error('Failed to load villes:', error)
    notificationStore.error('Erreur', 'Impossible de charger les villes')
  }
}

const loadSirenesDisponibles = async () => {
  try {
    const response = await sireneService.getDisponibles()
    if (response.success && response.data) {
      sirenesdisponibles.value = response.data
    }
  } catch (error: any) {
    console.error('Failed to load sirenes:', error)
    notificationStore.error('Erreur', 'Impossible de charger les sirènes disponibles')
  }
}

const validate = (): boolean => {
  errors.value = {}

  if (!props.isPrincipal && !formData.value.nom.trim()) {
    errors.value.nom = 'Le nom du site est requis'
  }
  if (!formData.value.adresse.trim()) {
    errors.value.adresse = 'L\'adresse est requise'
  }
  if (!formData.value.ville_id) {
    errors.value.ville_id = 'La ville est requise'
  }
  if (formData.value.types_etablissement.length === 0) {
    errors.value.types_etablissement = 'Sélectionnez au moins un type'
  }
  if (!formData.value.sirene.numero_serie) {
    errors.value['sirene.numero_serie'] = 'La sirène est requise'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validate()) return

  loading.value = true

  try {
    let response

    if (isEditMode.value) {
      // Update mode
      response = await siteService.update(props.site.id, formData.value)

      if (response.success) {
        notificationStore.success(
          'Site modifié',
          'Le site a été modifié avec succès.'
        )
        emit('saved')
        close()
      } else {
        notificationStore.error('Erreur', response.message || 'Impossible de modifier le site')
      }
    } else {
      // Create mode - ajouter un site annexe
      const data = {
        ...formData.value,
        ecole_principale_id: props.ecoleId,
        est_principale: false
      }

      response = await siteService.create(data)

      if (response.success) {
        notificationStore.success(
          'Site ajouté',
          'Le site annexe a été ajouté avec succès.'
        )
        emit('saved')
        close()
      } else {
        notificationStore.error('Erreur', response.message || 'Impossible d\'ajouter le site')
      }
    }
  } catch (error: any) {
    console.error('Failed to save site:', error)
    const message = error.response?.data?.message || (isEditMode.value ? 'Impossible de modifier le site' : 'Impossible d\'ajouter le site')
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
    adresse: '',
    ville_id: '',
    latitude: undefined,
    longitude: undefined,
    types_etablissement: [],
    sirene: {
      numero_serie: ''
    }
  }
  errors.value = {}
  isEditingSirene.value = false

  emit('close')
}

watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    isEditingSirene.value = false

    await Promise.all([
      loadVilles(),
      loadSirenesDisponibles()
    ])

    // Pre-fill form data when opening in edit mode
    if (isEditMode.value && props.site) {
      const site = props.site

      formData.value = {
        nom: site.nom || '',
        adresse: site.adresse || '',
        ville_id: site.ville_id || '',
        latitude: site.latitude,
        longitude: site.longitude,
        types_etablissement: site.types_etablissement || [],
        sirene: {
          numero_serie: site.sirene?.numero_serie || ''
        }
      }
    }
  }
})
</script>
