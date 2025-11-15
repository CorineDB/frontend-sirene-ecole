<template>
  <div class="user-card bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
    <!-- Header avec gradient -->
    <div class="card-header bg-gradient-to-r from-blue-600 to-cyan-600 p-4">
      <div class="flex items-center gap-4">
        <!-- Avatar avec initiales -->
        <div class="avatar bg-white/20 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center">
          <span class="text-2xl font-bold text-white">{{ userInitials }}</span>
        </div>

        <!-- Nom et rôle -->
        <div class="flex-1">
          <h3 class="text-xl font-bold text-white">{{ fullName }}</h3>
          <div class="flex items-center gap-2 mt-1">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
              {{ user.role?.nom || 'Sans rôle' }}
            </span>
            <span :class="typeColorClass" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
              {{ typeLabel }}
            </span>
          </div>
        </div>

        <!-- Badge statut actif/inactif -->
        <div>
          <span
            :class="user.actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
            class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
          >
            <span :class="user.actif ? 'bg-green-400' : 'bg-red-400'" class="w-2 h-2 rounded-full mr-2"></span>
            {{ user.actif ? 'Actif' : 'Inactif' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Corps de la carte -->
    <div class="card-body p-6">
      <!-- Informations de contact -->
      <div class="space-y-3">
        <div v-if="user.user_info?.email" class="flex items-center gap-3 text-gray-700">
          <div class="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs text-gray-500 font-medium">Email</p>
            <p class="text-sm font-semibold truncate">{{ user.user_info.email }}</p>
          </div>
        </div>

        <div v-if="user.user_info?.telephone" class="flex items-center gap-3 text-gray-700">
          <div class="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs text-gray-500 font-medium">Téléphone</p>
            <p class="text-sm font-semibold">{{ user.user_info.telephone }}</p>
          </div>
        </div>

        <div v-if="user.identifiant" class="flex items-center gap-3 text-gray-700">
          <div class="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs text-gray-500 font-medium">Identifiant</p>
            <p class="text-sm font-semibold font-mono">{{ user.identifiant }}</p>
          </div>
        </div>

        <div v-if="user.user_info?.adresse" class="flex items-center gap-3 text-gray-700">
          <div class="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs text-gray-500 font-medium">Adresse</p>
            <p class="text-sm font-semibold">{{ user.user_info.adresse }}</p>
          </div>
        </div>

        <div v-if="user.user_info?.ville" class="flex items-center gap-3 text-gray-700">
          <div class="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs text-gray-500 font-medium">Ville</p>
            <p class="text-sm font-semibold">
              {{ user.user_info.ville.nom }}
              <span v-if="user.user_info.ville.code" class="text-xs text-gray-500 font-normal ml-1">({{ user.user_info.ville.code }})</span>
            </p>
            <p v-if="user.user_info.ville.pays" class="text-xs text-gray-500 mt-0.5">
              {{ user.user_info.ville.pays.nom }}
              <span v-if="user.user_info.ville.pays.code_iso" class="font-mono">({{ user.user_info.ville.pays.code_iso }})</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Informations supplémentaires -->
      <div class="mt-6 pt-6 border-t border-gray-100">
        <div class="flex items-center justify-between text-xs">
          <div v-if="user.doit_changer_mot_de_passe" class="flex items-center gap-2 text-orange-600">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span class="font-semibold">Doit changer le mot de passe</span>
          </div>
          <div v-if="user.created_at" class="text-gray-500">
            <span class="font-medium">Créé le:</span> {{ formatDate(user.created_at) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Footer avec actions (optionnel) -->
    <div v-if="showActions" class="card-footer bg-gray-50 p-4 flex items-center justify-end gap-2">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ApiUserData } from '@/types/api'

interface Props {
  user: ApiUserData
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showActions: false
})

// Nom complet de l'utilisateur
const fullName = computed(() => {
  if (props.user.user_info) {
    return `${props.user.user_info.prenom} ${props.user.user_info.nom}`
  }
  return props.user.nom_utilisateur
})

// Initiales pour l'avatar
const userInitials = computed(() => {
  if (props.user.user_info) {
    return `${props.user.user_info.prenom[0]}${props.user.user_info.nom[0]}`.toUpperCase()
  }
  return props.user.nom_utilisateur
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

// Libellé du type d'utilisateur
const typeLabel = computed(() => {
  const labels: Record<string, string> = {
    ADMIN: 'Administrateur',
    USER: 'Utilisateur',
    ECOLE: 'École',
    TECHNICIEN: 'Technicien',
  }
  return labels[props.user.type] || props.user.type
})

// Classe de couleur pour le type
const typeColorClass = computed(() => {
  const colors: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-700',
    USER: 'bg-blue-100 text-blue-700',
    ECOLE: 'bg-green-100 text-green-700',
    TECHNICIEN: 'bg-orange-100 text-orange-700',
  }
  return colors[props.user.type] || 'bg-gray-100 text-gray-700'
})

// Formater la date
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.user-card {
  transition: transform 0.2s ease-in-out;
}

.user-card:hover {
  transform: translateY(-2px);
}
</style>
