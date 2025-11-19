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

      <!-- Steps Indicator -->
      <div v-if="!editMode" class="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div class="flex items-center justify-between">
          <div
            v-for="(step, index) in steps"
            :key="index"
            class="flex items-center flex-1"
          >
            <div class="flex items-center gap-2">
              <div
                :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all',
                  currentStep >= index
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                ]"
              >
                {{ index + 1 }}
              </div>
              <span
                :class="[
                  'text-sm font-medium',
                  currentStep >= index ? 'text-gray-900' : 'text-gray-500'
                ]"
              >
                {{ step }}
              </span>
            </div>
            <div
              v-if="index < steps.length - 1"
              :class="[
                'flex-1 h-1 mx-4',
                currentStep > index ? 'bg-purple-600' : 'bg-gray-300'
              ]"
            ></div>
          </div>
        </div>
      </div>

      <!-- Form Content -->
      <div class="flex-1 overflow-y-auto px-6 py-6">
        <!-- Step 1: Informations utilisateur -->
        <div v-show="currentStep === 0 || editMode" class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Informations d'utilisateur</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Nom d'utilisateur <span class="text-red-600">*</span>
              </label>
              <input
                v-model="formData.user.nom_utilisateur"
                type="text"
                placeholder="Ex: jean.ouedraogo"
                :disabled="editMode"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                :class="{ 'border-red-500': errors['user.nom_utilisateur'] }"
              />
              <p v-if="errors['user.nom_utilisateur']" class="text-sm text-red-600 mt-1">{{ errors['user.nom_utilisateur'] }}</p>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Identifiant (téléphone/email) <span class="text-red-600">*</span>
              </label>
              <input
                v-model="formData.user.identifiant"
                type="text"
                placeholder="Ex: +22670123456 ou email@example.com"
                :disabled="editMode"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                :class="{ 'border-red-500': errors['user.identifiant'] }"
              />
              <p v-if="errors['user.identifiant']" class="text-sm text-red-600 mt-1">{{ errors['user.identifiant'] }}</p>
            </div>
          </div>

          <div v-if="!editMode" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Mot de passe <span class="text-red-600">*</span>
              </label>
              <input
                v-model="formData.user.mot_de_passe"
                type="password"
                placeholder="Minimum 8 caractères"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                :class="{ 'border-red-500': errors['user.mot_de_passe'] }"
              />
              <p v-if="errors['user.mot_de_passe']" class="text-sm text-red-600 mt-1">{{ errors['user.mot_de_passe'] }}</p>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Rôle <span class="text-red-600">*</span>
              </label>
              <select
                v-model="formData.user.role_id"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                :class="{ 'border-red-500': errors['user.role_id'] }"
              >
                <option value="">Sélectionner un rôle</option>
                <option v-for="role in roles" :key="role.id" :value="role.id">
                  {{ role.nom }}
                </option>
              </select>
              <p v-if="errors['user.role_id']" class="text-sm text-red-600 mt-1">{{ errors['user.role_id'] }}</p>
            </div>
          </div>
        </div>

        <!-- Step 2: Informations technicien -->
        <div v-show="currentStep === 1 || editMode" :class="{ 'mt-6': editMode }" class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Informations professionnelles</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Ville d'affectation <span class="text-red-600">*</span>
              </label>
              <select
                v-model="formData.ville_id"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                :class="{ 'border-red-500': errors.ville_id }"
              >
                <option value="">Sélectionner une ville</option>
                <option v-for="ville in villes" :key="ville.id" :value="ville.id">
                  {{ ville.nom }}
                </option>
              </select>
              <p v-if="errors.ville_id" class="text-sm text-red-600 mt-1">{{ errors.ville_id }}</p>
            </div>

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
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Date d'embauche <span class="text-red-600">*</span>
              </label>
              <input
                v-model="formData.date_embauche"
                type="date"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                :class="{ 'border-red-500': errors.date_embauche }"
              />
              <p v-if="errors.date_embauche" class="text-sm text-red-600 mt-1">{{ errors.date_embauche }}</p>
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
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
        <button
          v-if="currentStep > 0 && !editMode"
          @click="previousStep"
          type="button"
          class="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-semibold transition-colors"
        >
          Précédent
        </button>
        <div v-else></div>

        <div class="flex items-center gap-3">
          <button
            @click="close"
            type="button"
            class="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-semibold transition-colors"
          >
            Annuler
          </button>

          <button
            v-if="currentStep < steps.length - 1 && !editMode"
            @click="nextStep"
            type="button"
            class="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Suivant
          </button>

          <button
            v-else
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
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { X } from 'lucide-vue-next'
import technicienService, { type InscriptionTechnicienRequest, type Technicien, type UpdateTechnicienRequest } from '../../services/technicienService'
import villeService, { type Ville } from '../../services/villeService'
import roleService, { type Role } from '../../services/roleService'
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

const steps = ['Utilisateur', 'Professionnel']
const currentStep = ref(0)
const loading = ref(false)
const villes = ref<Ville[]>([])
const roles = ref<Role[]>([])
const editMode = ref(false)

const formData = ref<InscriptionTechnicienRequest>({
  user: {
    nom_utilisateur: '',
    identifiant: '',
    mot_de_passe: '',
    type: 'TECHNICIEN',
    role_id: ''
  },
  ville_id: '',
  specialite: '',
  disponibilite: true,
  date_embauche: new Date().toISOString().split('T')[0]
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

const loadRoles = async () => {
  try {
    const response = await roleService.getAll()
    if (response.success && response.data) {
      // Filter roles for TECHNICIEN type if needed
      roles.value = response.data
    }
  } catch (error: any) {
    console.error('Failed to load roles:', error)
    notificationStore.error('Erreur', 'Impossible de charger les rôles')
  }
}

const validateStep = (step: number): boolean => {
  errors.value = {}

  if (step === 0 && !editMode.value) {
    if (!formData.value.user.nom_utilisateur.trim()) errors.value['user.nom_utilisateur'] = 'Le nom d\'utilisateur est requis'
    if (!formData.value.user.identifiant.trim()) errors.value['user.identifiant'] = 'L\'identifiant est requis'
    if (!formData.value.user.mot_de_passe.trim()) errors.value['user.mot_de_passe'] = 'Le mot de passe est requis'
    if (formData.value.user.mot_de_passe.length < 8) errors.value['user.mot_de_passe'] = 'Le mot de passe doit contenir au moins 8 caractères'
    if (!formData.value.user.role_id) errors.value['user.role_id'] = 'Le rôle est requis'
  } else if (step === 1 || editMode.value) {
    if (!formData.value.ville_id) errors.value.ville_id = 'La ville est requise'
    if (!formData.value.specialite.trim()) errors.value.specialite = 'La spécialité est requise'
    if (!formData.value.date_embauche) errors.value.date_embauche = 'La date d\'embauche est requise'
  }

  return Object.keys(errors.value).length === 0
}

const nextStep = () => {
  if (validateStep(currentStep.value)) {
    currentStep.value++
  }
}

const previousStep = () => {
  currentStep.value--
  errors.value = {}
}

const handleSubmit = async () => {
  if (!validateStep(editMode.value ? 1 : currentStep.value)) {
    return
  }

  loading.value = true

  try {
    if (editMode.value && props.technicien) {
      // Update mode
      const updateData: UpdateTechnicienRequest = {
        ville_id: formData.value.ville_id,
        specialite: formData.value.specialite,
        disponibilite: formData.value.disponibilite,
        date_embauche: formData.value.date_embauche
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
      nom_utilisateur: '',
      identifiant: '',
      mot_de_passe: '',
      type: 'TECHNICIEN',
      role_id: ''
    },
    ville_id: '',
    specialite: '',
    disponibilite: true,
    date_embauche: new Date().toISOString().split('T')[0]
  }
  errors.value = {}
  currentStep.value = 0
  loading.value = false
  editMode.value = false

  emit('close')
}

const initializeForm = () => {
  if (props.technicien) {
    editMode.value = true
    formData.value = {
      user: {
        nom_utilisateur: props.technicien.user?.nom_utilisateur || '',
        identifiant: '',
        mot_de_passe: '',
        type: 'TECHNICIEN',
        role_id: props.technicien.user?.role_id || ''
      },
      ville_id: props.technicien.ville_id,
      specialite: props.technicien.specialite,
      disponibilite: props.technicien.disponibilite,
      date_embauche: props.technicien.date_embauche
    }
  } else {
    editMode.value = false
  }
}

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    initializeForm()
    loadVilles()
    loadRoles()
  }
})

onMounted(() => {
  if (props.isOpen) {
    initializeForm()
    loadVilles()
    loadRoles()
  }
})
</script>
