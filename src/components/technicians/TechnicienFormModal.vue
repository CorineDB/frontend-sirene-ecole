<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click="close"
  >
    <div
      class="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
      @click.stop
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-600 to-indigo-600">
        <div class="text-white">
          <h2 class="text-2xl font-bold">{{ editMode ? 'Modifier le technicien' : 'Nouveau technicien' }}</h2>
          <p class="text-purple-100 text-sm mt-1">{{ editMode ? 'Modifiez les informations du technicien' : 'Enregistrez un nouveau technicien' }}</p>
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
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Informations du technicien</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Nom <span class="text-red-600">*</span>
              </label>
              <input
                v-model="formData.user.userInfoData.nom"
                type="text"
                placeholder="Ex: Ouédraogo"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                :class="{ 'border-red-500': errors['user.userInfoData.nom'] }"
              />
              <p v-if="errors['user.userInfoData.nom']" class="text-sm text-red-600 mt-1">{{ errors['user.userInfoData.nom'] }}</p>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Prénom <span class="text-red-600">*</span>
              </label>
              <input
                v-model="formData.user.userInfoData.prenom"
                type="text"
                placeholder="Ex: Jean"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                :class="{ 'border-red-500': errors['user.userInfoData.prenom'] }"
              />
              <p v-if="errors['user.userInfoData.prenom']" class="text-sm text-red-600 mt-1">{{ errors['user.userInfoData.prenom'] }}</p>
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Téléphone <span class="text-red-600">*</span>
            </label>
            <input
              v-model="formData.user.userInfoData.telephone"
              type="tel"
              placeholder="Ex: 2290158810589"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              :class="{ 'border-red-500': errors['user.userInfoData.telephone'] }"
            />
            <p v-if="errors['user.userInfoData.telephone']" class="text-sm text-red-600 mt-1">{{ errors['user.userInfoData.telephone'] }}</p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Ville <span class="text-red-600">*</span>
            </label>
            <select
              v-model="formData.user.userInfoData.ville_id"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              :class="{ 'border-red-500': errors['user.userInfoData.ville_id'] }"
            >
              <option value="">Sélectionner une ville</option>
              <option v-for="ville in villes" :key="ville.id" :value="ville.id">
                {{ ville.nom }}
              </option>
            </select>
            <p v-if="errors['user.userInfoData.ville_id']" class="text-sm text-red-600 mt-1">{{ errors['user.userInfoData.ville_id'] }}</p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Adresse <span class="text-red-600">*</span>
            </label>
            <textarea
              v-model="formData.user.userInfoData.adresse"
              rows="2"
              placeholder="Ex: Secteur 15, Rue 12.45"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              :class="{ 'border-red-500': errors['user.userInfoData.adresse'] }"
            ></textarea>
            <p v-if="errors['user.userInfoData.adresse']" class="text-sm text-red-600 mt-1">{{ errors['user.userInfoData.adresse'] }}</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Spécialité <span class="text-red-600">*</span>
              </label>
              <input
                v-model="formData.specialite"
                type="text"
                placeholder="Ex: Électronique, Systèmes audio, etc."
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                :class="{ 'border-red-500': errors.specialite }"
              />
              <p v-if="errors.specialite" class="text-sm text-red-600 mt-1">{{ errors.specialite }}</p>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Disponibilité
              </label>
              <div class="flex items-center h-12">
                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    v-model="formData.disponibilite"
                    type="checkbox"
                    class="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                  />
                  <span class="text-sm font-medium text-gray-900">
                    {{ formData.disponibilite ? 'Disponible' : 'Indisponible' }}
                  </span>
                </label>
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
          class="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Enregistrement...' : (editMode ? 'Mettre à jour' : 'Enregistrer') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { X } from 'lucide-vue-next'
import technicienService, { type InscriptionTechnicienRequest, type Technicien, type UpdateTechnicienRequest } from '../../services/technicienService'
import villeService, { type Ville } from '../../services/villeService'
import { useNotificationStore } from '../../stores/notifications'

interface Props {
  isOpen: boolean
  technicien?: Technicien | null
}

interface Emits {
  (e: 'close'): void
  (e: 'created', technicien: Technicien): void
  (e: 'updated', technicien: Technicien): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const notificationStore = useNotificationStore()

const loading = ref(false)
const villes = ref<Ville[]>([])
const editMode = ref(false)

const formData = ref<InscriptionTechnicienRequest>({
  user: {
    userInfoData: {
      telephone: '',
      nom: '',
      prenom: '',
      ville_id: '',
      adresse: ''
    }
  },
  specialite: '',
  disponibilite: true
})

const errors = ref<Record<string, string>>({})

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


const validateForm = (): boolean => {
  errors.value = {}

  if (!formData.value.user.userInfoData.nom.trim()) errors.value['user.userInfoData.nom'] = 'Le nom est requis'
  if (!formData.value.user.userInfoData.prenom.trim()) errors.value['user.userInfoData.prenom'] = 'Le prénom est requis'
  if (!formData.value.user.userInfoData.telephone.trim()) errors.value['user.userInfoData.telephone'] = 'Le téléphone est requis'
  if (!formData.value.user.userInfoData.ville_id) errors.value['user.userInfoData.ville_id'] = 'La ville est requise'
  if (!formData.value.user.userInfoData.adresse.trim()) errors.value['user.userInfoData.adresse'] = 'L\'adresse est requise'
  if (!formData.value.specialite.trim()) errors.value.specialite = 'La spécialité est requise'

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    if (editMode.value && props.technicien) {
      // Update mode
      const updateData: UpdateTechnicienRequest = {
        specialite: formData.value.specialite,
        disponibilite: formData.value.disponibilite
      }

      const response = await technicienService.update(props.technicien.id, updateData)

      if (response.success && response.data) {
        notificationStore.success(
          'Technicien modifié',
          `Le technicien a été modifié avec succès`
        )
        emit('updated', response.data)
        close()
      } else {
        notificationStore.error('Erreur', response.message || 'Impossible de modifier le technicien')
      }
    } else {
      // Create mode
      const response = await technicienService.inscrire(formData.value)

      if (response.success && response.data) {
        notificationStore.success(
          'Technicien enregistré',
          `Le technicien a été enregistré avec succès`
        )
        emit('created', response.data)
        close()
      } else {
        notificationStore.error('Erreur', response.message || 'Impossible d\'enregistrer le technicien')
      }
    }
  } catch (error: any) {
    console.error('Failed to save technician:', error)
    const message = error.response?.data?.message || 'Impossible d\'enregistrer le technicien'
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
    user: {
      userInfoData: {
        telephone: '',
        nom: '',
        prenom: '',
        ville_id: '',
        adresse: ''
      }
    },
    specialite: '',
    disponibilite: true
  }
  errors.value = {}
  loading.value = false
  editMode.value = false

  emit('close')
}

const initializeForm = () => {
  if (props.technicien) {
    editMode.value = true
    const userInfo = props.technicien.user?.user_info || props.technicien.user?.userInfo
    formData.value = {
      user: {
        userInfoData: {
          telephone: userInfo?.telephone || '',
          nom: userInfo?.nom || '',
          prenom: userInfo?.prenom || '',
          ville_id: userInfo?.ville_id || '',
          adresse: userInfo?.adresse || ''
        }
      },
      specialite: props.technicien.specialite,
      disponibilite: props.technicien.disponibilite
    }
  } else {
    editMode.value = false
  }
}

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    initializeForm()
    loadVilles()
  }
})

onMounted(() => {
  if (props.isOpen) {
    initializeForm()
    loadVilles()
  }
})
</script>
