<template>
  <DashboardLayout>
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Mes missions</h1>
          <p class="text-gray-600 mt-1">Gérer vos ordres de mission et interventions</p>
        </div>
        <div class="flex gap-2">
          <button
            @click="handleRefresh"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors flex items-center gap-2"
          >
            <RefreshCw :size="18" :class="{ 'animate-spin': isLoading }" />
            Actualiser
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <div class="flex items-center gap-4">
          <div class="flex-1">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Filtrer par statut</label>
            <select
              v-model="selectedStatut"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous les statuts</option>
              <option value="disponible">Disponibles (Candidatures ouvertes)</option>
              <option value="en_cours">En cours</option>
              <option value="termine">Terminées</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading && ordresMission.length === 0" class="flex items-center justify-center h-96">
        <div class="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>

      <!-- Error State -->
      <div v-if="hasError" class="bg-red-50 border border-red-200 rounded-xl p-4">
        <div class="flex items-center gap-3">
          <AlertCircle :size="24" class="text-red-600" />
          <div>
            <h3 class="font-semibold text-red-900">Erreur</h3>
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!isLoading && ordresMission.length === 0 && !hasError" class="bg-white rounded-xl p-12 text-center border border-gray-200">
        <Briefcase :size="64" class="text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Aucune mission disponible</h3>
        <p class="text-gray-600">Il n'y a actuellement aucune mission qui correspond à vos critères.</p>
      </div>

      <!-- Missions List -->
      <div v-if="!isLoading && ordresMission.length > 0" class="space-y-4">
        <div
          v-for="mission in ordresMission"
          :key="mission.id"
          class="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer"
          @click="goToMissionDetail(mission.id)"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h3 class="text-lg font-bold text-gray-900">{{ mission.numero_ordre }}</h3>
                <StatusBadge type="ordre_mission" :status="mission.statut" />
              </div>
              <p v-if="mission.panne?.description" class="text-gray-600 text-sm mb-3">{{ mission.panne.description }}</p>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div v-if="mission.panne?.numero_panne">
                  <p class="text-gray-600 mb-1">N° Panne</p>
                  <p class="font-mono font-semibold text-gray-900">{{ mission.panne.numero_panne }}</p>
                </div>
                <div v-if="mission.panne?.ecole">
                  <p class="text-gray-600 mb-1">École</p>
                  <p class="font-semibold text-gray-900">{{ mission.panne.ecole.nom }}</p>
                </div>
                <div v-if="mission.panne?.site">
                  <p class="text-gray-600 mb-1">Site</p>
                  <p class="font-semibold text-gray-900">{{ mission.panne.site.nom }}</p>
                </div>
                <div v-if="mission.ville">
                  <p class="text-gray-600 mb-1">Ville</p>
                  <p class="font-semibold text-gray-900">{{ mission.ville.nom_complet }}</p>
                </div>
                <div v-if="mission.date_generation">
                  <p class="text-gray-600 mb-1">Date génération</p>
                  <p class="font-semibold text-gray-900">{{ formatDate(mission.date_generation) }}</p>
                </div>
                <div v-if="mission.nombre_techniciens_requis">
                  <p class="text-gray-600 mb-1">Techniciens</p>
                  <p class="font-semibold text-gray-900">{{ mission.nombre_techniciens_acceptes || 0 }} / {{ mission.nombre_techniciens_requis }}</p>
                </div>
              </div>
            </div>
            <button
              @click.stop="goToMissionDetail(mission.id)"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors flex items-center gap-2"
            >
              Voir détails
              <ArrowRight :size="18" />
            </button>
          </div>

          <!-- Candidatures info if applicable -->
          <div v-if="mission.candidatures_ouvertes" class="mt-4 pt-4 border-t border-gray-200">
            <div class="flex items-center gap-2">
              <Users :size="16" class="text-green-600" />
              <p class="text-sm font-semibold text-green-700">Candidatures ouvertes</p>
              <span v-if="mission.date_limite_candidature" class="text-sm text-gray-600">
                - Jusqu'au {{ formatDate(mission.date_limite_candidature) }}
              </span>
            </div>
          </div>

          <!-- Interventions -->
          <div v-if="mission.interventions && mission.interventions.length > 0" class="mt-4 pt-4 border-t border-gray-200">
            <p class="text-sm font-semibold text-gray-700 mb-2">Interventions ({{ mission.interventions.length }}):</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div
                v-for="intervention in mission.interventions"
                :key="intervention.id"
                class="p-3 bg-blue-50 rounded-lg text-sm"
              >
                <p class="font-semibold text-gray-900">{{ intervention.panne?.description || 'Intervention' }}</p>
                <p class="text-gray-600 text-xs">{{ formatDateTime(intervention.date_heure_debut) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '../components/layout/DashboardLayout.vue'
import StatusBadge from '../components/common/StatusBadge.vue'
import { useOrdresMission } from '@/composables/useOrdresMission'
import { useNotificationStore } from '@/stores/notifications'
import {
  RefreshCw,
  AlertCircle,
  Briefcase,
  ArrowRight,
  Users
} from 'lucide-vue-next'

const router = useRouter()
const notificationStore = useNotificationStore()

const {
  ordresMission,
  isLoading,
  hasError,
  error,
  fetchAll,
  fetchByStatut,
  fetchDisponibles
} = useOrdresMission()

const selectedStatut = ref<string>('')

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatDateTime = (dateString: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadMissions = async () => {
  try {
    if (selectedStatut.value === 'disponible') {
      await fetchDisponibles()
    } else if (selectedStatut.value) {
      await fetchByStatut(selectedStatut.value)
    } else {
      await fetchAll()
    }
  } catch (err) {
    console.error('Error loading missions:', err)
  }
}

const handleRefresh = async () => {
  await loadMissions()
  notificationStore.success('Actualisé', 'Les missions ont été actualisées')
}

const goToMissionDetail = (missionId: string) => {
  router.push(`/ordres-mission/${missionId}`)
}

// Watch statut changes
watch(selectedStatut, () => {
  loadMissions()
})

onMounted(async () => {
  await loadMissions()
})
</script>
