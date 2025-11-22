<template>
  <DashboardLayout>
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Interventions</h1>
          <p class="text-gray-600 mt-1">Gérer et suivre les interventions techniques</p>
        </div>
      </div>

      <!-- Quick Stats -->
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
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <div class="flex gap-4 flex-wrap">
          <select
            v-model="filterStatus"
            @change="handleFilterChange"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option :value="StatutIntervention.PLANIFIEE">Planifiée</option>
            <option :value="StatutIntervention.ASSIGNEE">Assignée</option>
            <option :value="StatutIntervention.ACCEPTEE">Acceptée</option>
            <option :value="StatutIntervention.EN_COURS">En cours</option>
            <option :value="StatutIntervention.TERMINEE">Terminée</option>
            <option :value="StatutIntervention.ANNULEE">Annulée</option>
          </select>

          <select
            v-model="filterType"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les types</option>
            <option :value="TypeIntervention.INSTALLATION">Installation</option>
            <option :value="TypeIntervention.MAINTENANCE">Maintenance</option>
            <option :value="TypeIntervention.REPARATION">Réparation</option>
            <option :value="TypeIntervention.DIAGNOSTIC">Diagnostic</option>
          </select>

          <button
            @click="showTodayOnly"
            class="px-4 py-2 border border-blue-300 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-semibold transition-colors"
          >
            <Calendar :size="16" class="inline mr-2" />
            Aujourd'hui
          </button>

          <button
            @click="showUpcoming"
            class="px-4 py-2 border border-purple-300 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 font-semibold transition-colors"
          >
            <Clock :size="16" class="inline mr-2" />
            À venir
          </button>

          <button
            @click="resetFilters"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
          >
            Réinitialiser
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

      <!-- Interventions List -->
      <div v-if="!isLoading && !hasError" class="space-y-4">
        <div
          v-for="interv in displayedInterventions"
          :key="interv.id"
          class="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all cursor-pointer"
          @click="handleViewDetails(interv.id)"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-start gap-3 flex-1">
              <div :class="`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${getTypeBgColor(interv.type)}`">
                <component :is="getTypeIcon(interv.type)" :size="24" :class="getTypeTextColor(interv.type)" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-bold text-gray-900">{{ getTypeLabel(interv.type) }}</h3>
                  <StatusBadge type="intervention" :status="interv.statut" />
                </div>
                <p v-if="interv.ecole" class="text-sm text-gray-600">{{ interv.ecole.nom }}</p>
                <p v-if="interv.site" class="text-sm text-gray-500">{{ interv.site.nom }}</p>
              </div>
            </div>

            <div class="text-right" @click.stop>
              <p v-if="interv.date_intervention" class="text-sm font-semibold text-gray-900">
                {{ formatDate(interv.date_intervention) }}
              </p>
              <p v-if="interv.heure_intervention" class="text-xs text-gray-600">
                {{ formatTime(interv.heure_intervention) }}
              </p>
            </div>
          </div>

          <!-- Description -->
          <p v-if="interv.description" class="text-sm text-gray-700 mb-4 line-clamp-2">
            {{ interv.description }}
          </p>

          <!-- Details Grid -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div v-if="interv.technicien">
              <p class="text-xs text-gray-600 mb-1">Technicien</p>
              <div class="flex items-center gap-2">
                <User :size="16" class="text-gray-400" />
                <p class="text-sm font-semibold text-gray-900 truncate">{{ interv.technicien.nom }}</p>
              </div>
            </div>

            <div v-if="interv.panne">
              <p class="text-xs text-gray-600 mb-1">Panne liée</p>
              <div class="flex items-center gap-2">
                <AlertTriangle :size="16" class="text-orange-400" />
                <p class="text-sm font-semibold text-gray-900 truncate">{{ interv.panne.titre }}</p>
              </div>
            </div>

            <div v-if="interv.heure_arrivee">
              <p class="text-xs text-gray-600 mb-1">Arrivée</p>
              <p class="text-sm font-semibold text-gray-900">{{ formatTime(interv.heure_arrivee) }}</p>
            </div>

            <div v-if="interv.heure_depart">
              <p class="text-xs text-gray-600 mb-1">Départ</p>
              <p class="text-sm font-semibold text-gray-900">{{ formatTime(interv.heure_depart) }}</p>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between pt-4 border-t border-gray-100" @click.stop>
            <div class="flex items-center gap-4">
              <StatusBadge v-if="interv.resultat" type="resultat" :status="interv.resultat" />
              <div v-if="interv.note_intervention" class="flex items-center gap-1">
                <Star :size="16" class="text-yellow-500 fill-yellow-500" />
                <span class="text-sm font-semibold text-gray-900">{{ interv.note_intervention }}/5</span>
              </div>
            </div>

            <div class="flex gap-2">
              <button
                v-if="interv.statut === StatutIntervention.ASSIGNEE"
                @click="handleDemarrer(interv.id)"
                class="text-sm text-blue-600 hover:text-blue-700 font-semibold px-3 py-1 rounded hover:bg-blue-50"
              >
                <Play :size="16" class="inline mr-1" />
                Démarrer
              </button>
              <button
                v-if="interv.statut === StatutIntervention.EN_COURS"
                @click="handleTerminer(interv.id)"
                class="text-sm text-green-600 hover:text-green-700 font-semibold px-3 py-1 rounded hover:bg-green-50"
              >
                <CheckCircle :size="16" class="inline mr-1" />
                Terminer
              </button>
              <button
                @click="handleViewDetails(interv.id)"
                class="text-sm text-gray-600 hover:text-gray-700 font-semibold px-3 py-1 rounded hover:bg-gray-50"
              >
                Détails
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!isLoading && !hasError && displayedInterventions.length === 0" class="bg-white rounded-xl p-12 text-center border border-gray-200">
        <Wrench :size="64" class="text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Aucune intervention trouvée</h3>
        <p class="text-gray-600">
          {{ filterStatus !== 'all' || filterType !== 'all'
            ? 'Aucune intervention ne correspond à vos critères'
            : 'Aucune intervention enregistrée' }}
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
import { useInterventions } from '@/composables/useInterventions'
import { StatutIntervention, TypeIntervention } from '@/types/api'
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  Clock,
  Wrench,
  Settings,
  HardHat,
  Search,
  User,
  Star,
  Play,
  CheckCircle
} from 'lucide-vue-next'

const router = useRouter()

// Composable
const {
  interventions,
  interventionsEnCours,
  interventionsDuJour,
  interventionsAVenir,
  isLoading,
  hasError,
  error,
  fetchAll,
  fetchDuJour,
  fetchAVenir,
  demarrer,
  terminer
} = useInterventions()

// Local state
const filterStatus = ref<string>('all')
const filterType = ref<string>('all')
const viewMode = ref<'all' | 'today' | 'upcoming'>('all')

// Computed
const displayedInterventions = computed(() => {
  let result = interventions.value

  // Apply view mode filter
  if (viewMode.value === 'today') {
    result = interventionsDuJour.value
  } else if (viewMode.value === 'upcoming') {
    result = interventionsAVenir.value
  }

  // Apply status filter
  if (filterStatus.value !== 'all') {
    result = result.filter(i => i.statut === filterStatus.value)
  }

  // Apply type filter
  if (filterType.value !== 'all') {
    result = result.filter(i => i.type === filterType.value)
  }

  return result
})

const statsCards = computed(() => [
  {
    label: 'Total',
    count: interventions.value.length,
    color: 'from-blue-500 to-blue-600'
  },
  {
    label: 'Aujourd\'hui',
    count: interventionsDuJour.value.length,
    color: 'from-purple-500 to-purple-600'
  },
  {
    label: 'En cours',
    count: interventionsEnCours.value.length,
    color: 'from-cyan-500 to-cyan-600'
  },
  {
    label: 'Terminées',
    count: interventions.value.filter(i => i.statut === StatutIntervention.TERMINEE).length,
    color: 'from-green-500 to-green-600'
  }
])

// Methods
const getTypeIcon = (type: TypeIntervention | string) => {
  const icons: Record<string, any> = {
    [TypeIntervention.INSTALLATION]: Settings,
    [TypeIntervention.MAINTENANCE]: Wrench,
    [TypeIntervention.REPARATION]: HardHat,
    [TypeIntervention.DIAGNOSTIC]: Search
  }
  return icons[type] || Wrench
}

const getTypeBgColor = (type: TypeIntervention | string) => {
  const colors: Record<string, string> = {
    [TypeIntervention.INSTALLATION]: 'bg-blue-100',
    [TypeIntervention.MAINTENANCE]: 'bg-green-100',
    [TypeIntervention.REPARATION]: 'bg-orange-100',
    [TypeIntervention.DIAGNOSTIC]: 'bg-purple-100'
  }
  return colors[type] || 'bg-gray-100'
}

const getTypeTextColor = (type: TypeIntervention | string) => {
  const colors: Record<string, string> = {
    [TypeIntervention.INSTALLATION]: 'text-blue-600',
    [TypeIntervention.MAINTENANCE]: 'text-green-600',
    [TypeIntervention.REPARATION]: 'text-orange-600',
    [TypeIntervention.DIAGNOSTIC]: 'text-purple-600'
  }
  return colors[type] || 'text-gray-600'
}

const getTypeLabel = (type: TypeIntervention | string) => {
  const labels: Record<string, string> = {
    [TypeIntervention.INSTALLATION]: 'Installation',
    [TypeIntervention.MAINTENANCE]: 'Maintenance',
    [TypeIntervention.REPARATION]: 'Réparation',
    [TypeIntervention.DIAGNOSTIC]: 'Diagnostic'
  }
  return labels[type] || type
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleFilterChange = async () => {
  if (filterStatus.value !== 'all') {
    viewMode.value = 'all'
    await fetchAll()
  } else {
    await fetchAll()
  }
}

const showTodayOnly = async () => {
  viewMode.value = 'today'
  filterStatus.value = 'all'
  filterType.value = 'all'
  await fetchDuJour()
}

const showUpcoming = async () => {
  viewMode.value = 'upcoming'
  filterStatus.value = 'all'
  filterType.value = 'all'
  await fetchAVenir()
}

const resetFilters = async () => {
  viewMode.value = 'all'
  filterStatus.value = 'all'
  filterType.value = 'all'
  await fetchAll()
}

const handleDemarrer = async (id: string) => {
  if (confirm('Démarrer cette intervention ?')) {
    await demarrer(id, {
      heure_arrivee: new Date().toISOString(),
      notes_arrivee: 'Arrivé sur site'
    })
    await fetchAll()
  }
}

const handleTerminer = async (id: string) => {
  // In production, would open a modal for full details
  const resultat = prompt('Résultat (resolu/partiel/non_resolu/reporte):') as any
  if (resultat) {
    await terminer(id, {
      heure_depart: new Date().toISOString(),
      resultat,
      notes_cloture: 'Intervention terminée'
    })
    await fetchAll()
  }
}

const handleViewDetails = (id: string) => {
  // Navigate to panne detail if intervention has a panne
  const interv = interventions.value.find(i => i.id === id)
  if (interv?.panne_id) {
    router.push(`/pannes/${interv.panne_id}`)
  }
}

// Lifecycle
onMounted(async () => {
  await fetchAll()
})
</script>
