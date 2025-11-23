<template>
  <DashboardLayout>
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Ordres de Mission</h1>
          <p class="text-gray-600 mt-1">Gérer et suivre les ordres de mission</p>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div
          v-for="stat in statsCards"
          :key="stat.label"
          :class="`bg-gradient-to-br ${stat.color} rounded-xl p-6 text-white shadow-lg`"
        >
          <div class="flex items-center justify-between mb-4">
            <component :is="stat.icon" :size="32" class="opacity-80" />
          </div>
          <p class="text-sm opacity-90 mb-1">{{ stat.label }}</p>
          <p class="text-4xl font-bold">{{ stat.count }}</p>
        </div>
      </div>

      <!-- Filters -->
      <FilterBar
        :show-ecole="showEcoleFilter"
        :show-ville="true"
        :show-priorite="true"
        :ecoles="ecoles"
        :villes="villes"
        @filter-change="handleFilterChange"
      />

      <!-- Quick Actions -->
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <div class="flex gap-4 flex-wrap">
          <button
            @click="showDisponibles"
            class="px-4 py-2 border border-green-300 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-semibold transition-colors"
          >
            <Briefcase :size="16" class="inline mr-2" />
            Missions disponibles
          </button>

          <button
            @click="showAllOrdres"
            class="px-4 py-2 border border-blue-300 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-semibold transition-colors"
          >
            Tous les ordres
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center h-96">
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

      <!-- Ordres de Mission List -->
      <div v-if="!isLoading && !hasError" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <router-link
          v-for="ordre in displayedOrdres"
          :key="ordre.id"
          :to="`/ordres-mission/${ordre.id}`"
          class="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all cursor-pointer block"
        >
          <!-- Header -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-2">
                <h3 class="text-lg font-bold text-gray-900">{{ ordre.numero_ordre }}</h3>
                <span v-if="ordre.panne" :class="`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityBadgeClass(ordre.panne.priorite)}`">
                  {{ getPriorityLabel(ordre.panne.priorite) }}
                </span>
              </div>
              <div class="flex items-center gap-2 mb-3">
                <StatusBadge type="ordre-mission" :status="ordre.statut" />
              </div>
              <p v-if="ordre.panne" class="text-sm text-gray-600 font-medium mb-1">
                {{ ordre.panne.titre || 'N/A' }}
              </p>
            </div>

            <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
              <FileText :size="24" class="text-white" />
            </div>
          </div>

          <!-- École Info -->
          <div v-if="ordre.panne?.ecole" class="mb-4 bg-gray-50 rounded-lg p-3">
            <div class="flex items-center gap-2 text-sm text-gray-700">
              <MapPin :size="16" class="text-blue-600" />
              <span class="font-medium">{{ ordre.panne.ecole.nom }}</span>
            </div>
          </div>

          <!-- Details Grid -->
          <div class="space-y-3 mb-4">
            <div v-if="ordre.ville" class="flex items-center gap-3">
              <MapPin :size="18" class="text-gray-400 flex-shrink-0" />
              <div>
                <p class="text-xs text-gray-600">Ville</p>
                <p class="text-sm font-semibold text-gray-900">{{ ordre.ville.nom }}</p>
              </div>
            </div>

            <div v-if="ordre.nombre_techniciens_requis" class="flex items-center gap-3">
              <Users :size="18" class="text-gray-400 flex-shrink-0" />
              <div>
                <p class="text-xs text-gray-600">Techniciens requis</p>
                <p class="text-sm font-semibold text-gray-900">{{ ordre.nombre_techniciens_requis }} technicien{{ ordre.nombre_techniciens_requis > 1 ? 's' : '' }}</p>
              </div>
            </div>

            <div v-if="ordre.date_debut_candidature && ordre.date_fin_candidature" class="flex items-center gap-3">
              <Calendar :size="18" class="text-gray-400 flex-shrink-0" />
              <div>
                <p class="text-xs text-gray-600">Période candidatures</p>
                <p class="text-sm font-semibold text-gray-900">{{ formatDate(ordre.date_debut_candidature) }} - {{ formatDate(ordre.date_fin_candidature) }}</p>
              </div>
            </div>

            <div v-if="ordre.valide_par_user" class="flex items-center gap-3">
              <User :size="18" class="text-gray-400 flex-shrink-0" />
              <div>
                <p class="text-xs text-gray-600">Validé par</p>
                <p class="text-sm font-semibold text-gray-900">{{ ordre.valide_par_user.nom_utilisateur }}</p>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between pt-4 border-t border-gray-100">
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <Briefcase :size="16" />
              <span v-if="ordre.missions_techniciens && ordre.missions_techniciens.length > 0">
                {{ ordre.missions_techniciens.length }} candidature{{ ordre.missions_techniciens.length > 1 ? 's' : '' }}
              </span>
              <span v-else>Aucune candidature</span>
            </div>
            <p class="text-xs text-gray-500">{{ formatDate(ordre.created_at) }}</p>
          </div>
        </router-link>
      </div>

      <!-- Empty State -->
      <div v-if="!isLoading && !hasError && !hasOrdresMission" class="bg-white rounded-xl p-12 text-center border border-gray-200">
        <Briefcase :size="64" class="text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Aucun ordre de mission trouvé</h3>
        <p class="text-gray-600">
          {{ filterStatut !== 'all' ? 'Aucun ordre de mission ne correspond à vos critères' : 'Aucun ordre de mission enregistré' }}
        </p>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '../components/layout/DashboardLayout.vue'
import StatusBadge from '../components/common/StatusBadge.vue'
import FilterBar from '../components/common/FilterBar.vue'
import { useOrdresMission } from '@/composables/useOrdresMission'
import { useAuthStore } from '@/stores/auth'
import dashboardService from '@/services/dashboardService'
import type { OrdreMissionFilters } from '@/services/dashboardService'
import { StatutOrdreMission } from '@/types/api'
import type { ApiVille, ApiEcole } from '@/types/api'
import {
  Briefcase,
  FileText,
  Calendar,
  MapPin,
  User,
  Users,
  AlertCircle,
  Clock,
  CheckCircle
} from 'lucide-vue-next'
import { PrioritePanne } from '@/types/api'

const router = useRouter()
const authStore = useAuthStore()

// Composable
const {
  ordresMission,
  isLoading,
  hasError,
  error,
  hasOrdresMission,
  fetchAll,
  fetchByStatut,
  fetchDisponibles,
  cloturerCandidatures
} = useOrdresMission()

// Local state
const currentFilters = ref<OrdreMissionFilters>({})
const villes = ref<ApiVille[]>([])
const ecoles = ref<ApiEcole[]>([])
const showingDisponibles = ref(false)

// Computed
const displayedOrdres = computed(() => {
  return ordresMission.value
})

// Show ecole filter only for Admin users
const showEcoleFilter = computed(() => {
  return authStore.user?.type === 'admin'
})

const statsCards = computed(() => [
  {
    label: 'Total',
    count: ordresMission.value.length,
    color: 'from-blue-500 to-blue-600',
    icon: Briefcase
  },
  {
    label: 'En attente',
    count: ordresMission.value.filter(o => o.statut === StatutOrdreMission.EN_ATTENTE).length,
    color: 'from-yellow-500 to-yellow-600',
    icon: Clock
  },
  {
    label: 'En cours',
    count: ordresMission.value.filter(o => o.statut === StatutOrdreMission.EN_COURS).length,
    color: 'from-cyan-500 to-cyan-600',
    icon: FileText
  },
  {
    label: 'Terminés',
    count: ordresMission.value.filter(o => o.statut === StatutOrdreMission.TERMINE).length,
    color: 'from-green-500 to-green-600',
    icon: CheckCircle
  }
])

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const getPriorityLabel = (priorite: string): string => {
  const labels: Record<string, string> = {
    [PrioritePanne.BASSE]: 'Basse',
    [PrioritePanne.MOYENNE]: 'Moyenne',
    [PrioritePanne.HAUTE]: 'Haute',
    [PrioritePanne.URGENTE]: 'Urgente',
    'faible': 'Basse',
    'moyenne': 'Moyenne',
    'haute': 'Haute',
    'urgente': 'Urgente'
  }
  return labels[priorite] || priorite
}

const getPriorityBadgeClass = (priorite: string): string => {
  const classes: Record<string, string> = {
    [PrioritePanne.BASSE]: 'bg-gray-100 text-gray-800',
    [PrioritePanne.MOYENNE]: 'bg-yellow-100 text-yellow-800',
    [PrioritePanne.HAUTE]: 'bg-orange-100 text-orange-800',
    [PrioritePanne.URGENTE]: 'bg-red-100 text-red-800',
    'faible': 'bg-gray-100 text-gray-800',
    'moyenne': 'bg-yellow-100 text-yellow-800',
    'haute': 'bg-orange-100 text-orange-800',
    'urgente': 'bg-red-100 text-red-800'
  }
  return classes[priorite] || 'bg-gray-100 text-gray-800'
}

const handleFilterChange = async (filters: OrdreMissionFilters) => {
  currentFilters.value = filters
  if (showingDisponibles.value) {
    await loadDisponibles()
  } else {
    await loadAll()
  }
}

const loadDisponibles = async () => {
  try {
    const response = await dashboardService.getOrdresMissionDisponibles(currentFilters.value)
    if (response.success && response.data) {
      ordresMission.value = response.data
    }
  } catch (error) {
    console.error('Erreur lors du chargement des ordres disponibles:', error)
  }
}

const loadAll = async () => {
  await fetchAll()
}

const showDisponibles = async () => {
  showingDisponibles.value = true
  await loadDisponibles()
}

const showAllOrdres = async () => {
  showingDisponibles.value = false
  currentFilters.value = {}
  await loadAll()
}

// Lifecycle
onMounted(async () => {
  await fetchAll()
  // TODO: Load villes and ecoles for filters
  // These could come from dedicated endpoints or be loaded from stores
})
</script>
