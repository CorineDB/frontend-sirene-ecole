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
          class="bg-white rounded-xl p-6 border border-gray-200"
        >
          <p class="text-sm text-gray-600 mb-2">{{ stat.label }}</p>
          <p class="text-3xl font-bold text-gray-900">{{ stat.count }}</p>
          <div :class="`mt-3 h-1 rounded-full bg-gradient-to-r ${stat.color}`"></div>
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
      <div v-if="!isLoading && !hasError" class="space-y-4">
        <div
          v-for="ordre in displayedOrdres"
          :key="ordre.id"
          class="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all cursor-pointer"
          @click="handleViewDetails(ordre.id)"
        >
          <!-- Header -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-start gap-3 flex-1">
              <div class="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <FileText :size="24" class="text-blue-600" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-bold text-gray-900">{{ ordre.numero_ordre }}</h3>
                  <StatusBadge type="ordre-mission" :status="ordre.statut" />
                </div>
                <p v-if="ordre.panne" class="text-sm text-gray-600">
                  Panne: {{ ordre.panne.titre || 'N/A' }}
                </p>
                <p v-if="ordre.panne?.ecole" class="text-sm text-gray-500">
                  {{ ordre.panne.ecole.nom }}
                </p>
              </div>
            </div>

            <div class="text-right" @click.stop>
              <p class="text-sm font-semibold text-gray-900">
                {{ ordre.nombre_techniciens_requis }} technicien{{ ordre.nombre_techniciens_requis > 1 ? 's' : '' }} requis
              </p>
            </div>
          </div>

          <!-- Candidatures Period -->
          <div v-if="ordre.date_debut_candidature && ordre.date_fin_candidature" class="mb-4">
            <div class="flex items-center gap-4 text-sm">
              <div class="flex items-center gap-2 text-gray-600">
                <Calendar :size="16" class="text-gray-400" />
                <span>Candidatures: {{ formatDate(ordre.date_debut_candidature) }} - {{ formatDate(ordre.date_fin_candidature) }}</span>
              </div>
            </div>
          </div>

          <!-- Commentaire -->
          <p v-if="ordre.commentaire" class="text-sm text-gray-700 mb-4 line-clamp-2">
            {{ ordre.commentaire }}
          </p>

          <!-- Details Grid -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div v-if="ordre.panne">
              <p class="text-xs text-gray-600 mb-1">Priorité</p>
              <StatusBadge type="priorite" :status="ordre.panne.priorite" />
            </div>

            <div v-if="ordre.ville">
              <p class="text-xs text-gray-600 mb-1">Ville</p>
              <div class="flex items-center gap-2">
                <MapPin :size="16" class="text-gray-400" />
                <p class="text-sm font-semibold text-gray-900 truncate">{{ ordre.ville.nom }}</p>
              </div>
            </div>

            <div v-if="ordre.valide_par_user">
              <p class="text-xs text-gray-600 mb-1">Validé par</p>
              <div class="flex items-center gap-2">
                <User :size="16" class="text-gray-400" />
                <p class="text-sm font-semibold text-gray-900 truncate">{{ ordre.valide_par_user.nom_utilisateur }}</p>
              </div>
            </div>

            <div>
              <p class="text-xs text-gray-600 mb-1">Créé le</p>
              <p class="text-sm font-semibold text-gray-900">{{ formatDate(ordre.created_at) }}</p>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="flex items-center justify-between pt-4 border-t border-gray-100" @click.stop>
            <div class="flex items-center gap-4">
              <span v-if="ordre.missions_techniciens && ordre.missions_techniciens.length > 0" class="text-sm text-gray-600">
                <Users :size="16" class="inline mr-1" />
                {{ ordre.missions_techniciens.length }} candidature{{ ordre.missions_techniciens.length > 1 ? 's' : '' }}
              </span>
            </div>

            <div class="flex gap-2">
              <button
                v-if="ordre.statut === StatutOrdreMission.EN_ATTENTE || ordre.statut === StatutOrdreMission.EN_COURS"
                @click="handleCloturer(ordre.id)"
                class="text-sm text-orange-600 hover:text-orange-700 font-semibold px-3 py-1 rounded hover:bg-orange-50"
              >
                Clôturer candidatures
              </button>
              <button
                @click="handleViewDetails(ordre.id)"
                class="text-sm text-gray-600 hover:text-gray-700 font-semibold px-3 py-1 rounded hover:bg-gray-50"
              >
                Détails
              </button>
            </div>
          </div>
        </div>
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
import { useAuthStore } from '@/stores/authStore'
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
  AlertCircle
} from 'lucide-vue-next'

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
    color: 'from-blue-500 to-blue-600'
  },
  {
    label: 'En attente',
    count: ordresMission.value.filter(o => o.statut === StatutOrdreMission.EN_ATTENTE).length,
    color: 'from-yellow-500 to-yellow-600'
  },
  {
    label: 'En cours',
    count: ordresMission.value.filter(o => o.statut === StatutOrdreMission.EN_COURS).length,
    color: 'from-cyan-500 to-cyan-600'
  },
  {
    label: 'Terminés',
    count: ordresMission.value.filter(o => o.statut === StatutOrdreMission.TERMINE).length,
    color: 'from-green-500 to-green-600'
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

const handleCloturer = async (id: string) => {
  if (confirm('Êtes-vous sûr de vouloir clôturer les candidatures pour cet ordre de mission ?')) {
    // In production, would get admin ID from auth context
    const adminId = prompt('ID Admin:')
    if (adminId) {
      await cloturerCandidatures(id, adminId)
      if (showingDisponibles.value) {
        await loadDisponibles()
      } else {
        await loadAll()
      }
    }
  }
}

const handleViewDetails = (id: string) => {
  router.push(`/ordres-mission/${id}`)
}

// Lifecycle
onMounted(async () => {
  await fetchAll()
  // TODO: Load villes and ecoles for filters
  // These could come from dedicated endpoints or be loaded from stores
})
</script>
