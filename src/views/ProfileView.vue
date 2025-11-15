<template>
  <DashboardLayout>
    <div class="p-6 space-y-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Mon profil</h1>
        <p class="text-gray-600 mt-1">Gérer vos informations personnelles</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Profile Card -->
        <div class="lg:col-span-1 bg-white rounded-xl border border-gray-200 p-6">
          <div class="text-center">
            <div class="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-white font-bold text-3xl">
                {{ getUserInitials() }}
              </span>
            </div>
            <h2 class="text-xl font-bold text-gray-900 mb-1">{{ authUser?.nom_utilisateur }}</h2>
            <p class="text-sm text-gray-600 mb-4">{{ authUser?.email || 'Pas d\'email' }}</p>
            <span v-if="authUser?.role" class="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              {{ authUser.role.nom }}
            </span>
            <span v-else class="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
              {{ typeLabel }}
            </span>
          </div>

          <div class="mt-6 pt-6 border-t border-gray-200 space-y-3">
            <div class="flex items-center gap-3 text-sm">
              <Phone :size="16" class="text-gray-400" />
              <span class="text-gray-700">{{ authUser?.telephone || 'Pas de téléphone' }}</span>
            </div>
            <div class="flex items-center gap-3 text-sm">
              <Calendar :size="16" class="text-gray-400" />
              <span class="text-gray-700">Membre depuis {{ formatMemberSince(authUser?.created_at) }}</span>
            </div>
            <div class="flex items-center gap-3 text-sm">
              <Shield :size="16" class="text-gray-400" />
              <span class="text-green-700 font-semibold">Compte actif</span>
            </div>
          </div>
        </div>

        <!-- Profile Form -->
        <div class="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-6">Informations personnelles</h2>

          <form @submit.prevent="handleSaveProfile" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="nom_utilisateur" class="block text-sm font-semibold text-gray-900 mb-2">
                  Nom complet
                </label>
                <input
                  id="nom_utilisateur"
                  v-model="profileFormData.nom_utilisateur"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label for="email" class="block text-sm font-semibold text-gray-900 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  v-model="profileFormData.email"
                  type="email"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label for="telephone" class="block text-sm font-semibold text-gray-900 mb-2">
                Téléphone
              </label>
              <input
                id="telephone"
                v-model="profileFormData.telephone"
                type="tel"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div class="flex gap-4 pt-4">
              <button
                type="submit"
                :disabled="loadingProfile"
                class="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span v-if="loadingProfile" class="animate-spin">⏳</span>
                {{ loadingProfile ? 'Enregistrement...' : 'Enregistrer les modifications' }}
              </button>
              <button
                type="button"
                @click="handleCancelProfile"
                class="px-6 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>

          <div class="pt-6 border-t border-gray-200 mt-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Changer le mot de passe</h3>
            <form @submit.prevent="handleChangePassword" class="space-y-4">
              <div>
                <label for="ancien_mot_de_passe" class="block text-sm font-semibold text-gray-900 mb-2">
                  Mot de passe actuel
                </label>
                <input
                  id="ancien_mot_de_passe"
                  v-model="passwordData.ancien_mot_de_passe"
                  type="password"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label for="nouveau_mot_de_passe" class="block text-sm font-semibold text-gray-900 mb-2">
                  Nouveau mot de passe
                </label>
                <input
                  id="nouveau_mot_de_passe"
                  v-model="passwordData.nouveau_mot_de_passe"
                  type="password"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label for="confirmation_mot_de_passe" class="block text-sm font-semibold text-gray-900 mb-2">
                  Confirmer le mot de passe
                </label>
                <input
                  id="confirmation_mot_de_passe"
                  v-model="passwordData.confirmation_mot_de_passe"
                  type="password"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                :disabled="loadingPassword || !isPasswordFormValid"
                class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span v-if="loadingPassword" class="animate-spin">⏳</span>
                {{ loadingPassword ? 'Modification...' : 'Changer le mot de passe' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import DashboardLayout from '../components/layout/DashboardLayout.vue'
import { Phone, Calendar, Shield } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import userService from '@/services/userService'
import { useNotificationStore } from '@/stores/notifications'
import type { UpdateProfileRequest, ChangePasswordRequest } from '@/types/api'

const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const authUser = computed(() => authStore.user)

const profileFormData = ref<UpdateProfileRequest>({
  nom_utilisateur: '',
  email: '',
  telephone: '',
})

const passwordData = ref<ChangePasswordRequest>({
  ancien_mot_de_passe: '',
  nouveau_mot_de_passe: '',
  confirmation_mot_de_passe: '',
})

const loadingProfile = ref(false)
const loadingPassword = ref(false)

const typeLabel = computed(() => {
  const typeLabels: Record<string, string> = {
    ADMIN: 'Administrateur',
    USER: 'Utilisateur',
    ECOLE: 'École',
    TECHNICIEN: 'Technicien',
  }
  return typeLabels[authUser.value?.type || ''] || authUser.value?.type || 'Utilisateur'
})

const isPasswordFormValid = computed(() => {
  return (
    passwordData.value.ancien_mot_de_passe.length > 0 &&
    passwordData.value.nouveau_mot_de_passe.length >= 6 &&
    passwordData.value.nouveau_mot_de_passe === passwordData.value.confirmation_mot_de_passe
  )
})

const getUserInitials = () => {
  if (!authUser.value?.nom_utilisateur) return '?'
  return authUser.value.nom_utilisateur
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const formatMemberSince = (dateString?: string) => {
  if (!dateString) return 'Inconnu'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric'
  })
}

const loadProfileData = () => {
  if (authUser.value) {
    profileFormData.value = {
      nom_utilisateur: authUser.value.nom_utilisateur,
      email: authUser.value.email || '',
      telephone: authUser.value.telephone || '',
    }
  }
}

const handleSaveProfile = async () => {
  loadingProfile.value = true
  try {
    const response = await userService.updateProfile(profileFormData.value)

    if (response.success && response.data) {
      notificationStore.success(
        'Profil mis à jour',
        'Vos informations ont été mises à jour avec succès'
      )

      // Update auth store with new user data
      await authStore.fetchUser()
    } else {
      notificationStore.error(
        'Erreur',
        response.message || 'Impossible de mettre à jour le profil'
      )
    }
  } catch (error) {
    console.error('Failed to update profile:', error)
    notificationStore.error(
      'Erreur',
      'Une erreur est survenue lors de la mise à jour du profil'
    )
  } finally {
    loadingProfile.value = false
  }
}

const handleCancelProfile = () => {
  loadProfileData()
}

const handleChangePassword = async () => {
  if (!isPasswordFormValid.value) {
    notificationStore.error(
      'Erreur de validation',
      'Veuillez remplir tous les champs correctement'
    )
    return
  }

  if (passwordData.value.nouveau_mot_de_passe !== passwordData.value.confirmation_mot_de_passe) {
    notificationStore.error(
      'Erreur',
      'Les mots de passe ne correspondent pas'
    )
    return
  }

  loadingPassword.value = true
  try {
    const response = await userService.changePassword(passwordData.value)

    if (response.success) {
      notificationStore.success(
        'Mot de passe modifié',
        'Votre mot de passe a été modifié avec succès'
      )

      // Reset password form
      passwordData.value = {
        ancien_mot_de_passe: '',
        nouveau_mot_de_passe: '',
        confirmation_mot_de_passe: '',
      }
    } else {
      notificationStore.error(
        'Erreur',
        response.message || 'Impossible de modifier le mot de passe'
      )
    }
  } catch (error) {
    console.error('Failed to change password:', error)
    notificationStore.error(
      'Erreur',
      'Une erreur est survenue lors du changement de mot de passe'
    )
  } finally {
    loadingPassword.value = false
  }
}

onMounted(() => {
  loadProfileData()
})
</script>
