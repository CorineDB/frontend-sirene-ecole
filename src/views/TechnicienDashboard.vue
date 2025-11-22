<template>
  <DashboardLayout>
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Tableau de Bord Technicien</h1>
          <p class="text-gray-600 mt-1">Vue d'ensemble de vos missions et interventions</p>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div
          v-for="stat in quickStats"
          :key="stat.label"
          class="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div class="flex items-center justify-between mb-3">
            <div :class="`w-12 h-12 rounded-lg flex items-center justify-center ${stat.bgColor}`">
              <component :is="stat.icon" :size="24" :class="stat.iconColor" />
            </div>
            <span :class="`text-2xl font-bold ${stat.textColor}`">{{ stat.count }}</span>
          </div>
          <p class="text-sm text-gray-600">{{ stat.label }}</p>
        </div>
      </div>

      <!-- Mes Interventions du Jour -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar :size="24" class="text-blue-600" />
            Interventions du jour
          </h2>
          <router-link
            to="/interventions"
            class="text-sm text-blue-600 hover:text-blue-700 font-semibold"
          >
            Voir tout →
          </router-link>
        </div>

        <div v-if="interventionsDuJour.length > 0" class="space-y-3">
          <div
            v-for="intervention in interventionsDuJour"
            :key="intervention.id"
            class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
            @click="router.push(`/interventions/${intervention.id}`)"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <StatusBadge type="intervention" :status="intervention.statut" />
                  <span v-if="intervention.heure_rdv" class="text-sm font-semibold text-gray-900">
                    {{ intervention.heure_rdv }}
                  </span>
                </div>
                <p class="text-sm text-gray-700 mb-1">{{ intervention.instructions || 'Aucune instruction' }}</p>
                <p v-if="intervention.lieu_rdv" class="text-xs text-gray-600">
                  <MapPin :size="14" class="inline" /> {{ intervention.lieu_rdv }}
                </p>
              </div>
              <button
                v-if="intervention.statut === 'planifiee'"
                @click.stop="handleDemarrer(intervention.id)"
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-sm"
              >
                Démarrer
              </button>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8 text-gray-500">
          <Calendar :size="48" class="text-gray-300 mx-auto mb-3" />
          <p>Aucune intervention prévue aujourd'hui</p>
        </div>
      </div>

      <!-- Mes Candidatures en Attente -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Briefcase :size="24" class="text-purple-600" />
            Mes candidatures en attente
          </h2>
          <router-link
            to="/ordres-mission"
            class="text-sm text-blue-600 hover:text-blue-700 font-semibold"
          >
            Missions disponibles →
          </router-link>
        </div>

        <div v-if="candidaturesEnAttente.length > 0" class="space-y-3">
          <div
            v-for="candidature in candidaturesEnAttente"
            :key="candidature.id"
            class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <h4 class="font-semibold text-gray-900">
                    Ordre de Mission #{{ candidature.ordre_mission?.numero_ordre }}
                  </h4>
                  <StatusBadge type="candidature" :status="candidature.statut_candidature" />
                </div>
                <p class="text-sm text-gray-600">
                  Candidature soumise le {{ formatDate(candidature.date_candidature) }}
                </p>
                <p v-if="candidature.ordre_mission?.panne" class="text-xs text-gray-500 mt-1">
                  {{ candidature.ordre_mission.panne.titre }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8 text-gray-500">
          <Briefcase :size="48" class="text-gray-300 mx-auto mb-3" />
          <p>Aucune candidature en attente</p>
        </div>
      </div>

      <!-- Interventions à Venir -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Clock :size="24" class="text-orange-600" />
            Interventions à venir
          </h2>
        </div>

        <div v-if="interventionsAVenir.length > 0" class="space-y-3">
          <div
            v-for="intervention in interventionsAVenir"
            :key="intervention.id"
            class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
            @click="router.push(`/interventions/${intervention.id}`)"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <StatusBadge type="intervention" :status="intervention.statut" />
                  <span v-if="intervention.date_intervention" class="text-sm font-semibold text-gray-900">
                    {{ formatDate(intervention.date_intervention) }}
                  </span>
                </div>
                <p class="text-sm text-gray-700">{{ intervention.instructions || 'Aucune instruction' }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8 text-gray-500">
          <Clock :size="48" class="text-gray-300 mx-auto mb-3" />
          <p>Aucune intervention planifiée</p>
        </div>
      </div>

      <!-- Statistiques Personnelles -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 :size="24" class="text-indigo-600" />
          Mes statistiques
        </h2>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div class="text-center">
            <p class="text-3xl font-bold text-blue-600">{{ stats.interventionsTerminees }}</p>
            <p class="text-sm text-gray-600 mt-1">Interventions terminées</p>
          </div>
          <div class="text-center">
            <p class="text-3xl font-bold text-green-600">{{ stats.tauxReussite }}%</p>
            <p class="text-sm text-gray-600 mt-1">Taux de réussite</p>
          </div>
          <div class="text-center">
            <p class="text-3xl font-bold text-purple-600">{{ stats.rapportsRediges }}</p>
            <p class="text-sm text-gray-600 mt-1">Rapports rédigés</p>
          </div>
          <div class="text-center">
            <p class="text-3xl font-bold text-yellow-600">{{ stats.notemoyenne }}/5</p>
            <p class="text-sm text-gray-600 mt-1">Note moyenne</p>
          </div>
        </div>
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
import type { ApiIntervention, ApiMissionTechnicien } from '@/types/api'
import {
  Calendar,
  Briefcase,
  Clock,
  BarChart3,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Zap
} from 'lucide-vue-next'

const router = useRouter()

// Composable
const {
  fetchDuJour,
  fetchAVenir,
  demarrer
} = useInterventions()

// State
const interventionsDuJour = ref<ApiIntervention[]>([])
const interventionsAVenir = ref<ApiIntervention[]>([])
const candidaturesEnAttente = ref<ApiMissionTechnicien[]>([])
const stats = ref({
  interventionsTerminees: 0,
  tauxReussite: 0,
  rapportsRediges: 0,
  notemoyenne: 0
})

// Computed
const quickStats = computed(() => [
  {
    label: "Aujourd'hui",
    count: interventionsDuJour.value.length,
    icon: Calendar,
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
    textColor: 'text-blue-600'
  },
  {
    label: 'À venir',
    count: interventionsAVenir.value.length,
    icon: Clock,
    bgColor: 'bg-orange-100',
    iconColor: 'text-orange-600',
    textColor: 'text-orange-600'
  },
  {
    label: 'Candidatures',
    count: candidaturesEnAttente.value.length,
    icon: Briefcase,
    bgColor: 'bg-purple-100',
    iconColor: 'text-purple-600',
    textColor: 'text-purple-600'
  },
  {
    label: 'Terminées',
    count: stats.value.interventionsTerminees,
    icon: CheckCircle,
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600',
    textColor: 'text-green-600'
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

const handleDemarrer = async (interventionId: string) => {
  const technicienId = prompt('ID Technicien:')
  if (technicienId) {
    try {
      await demarrer(interventionId, { technicien_id: technicienId })
      await loadInterventionsDuJour()
    } catch (err) {
      console.error('Error starting intervention:', err)
    }
  }
}

const loadInterventionsDuJour = async () => {
  const response = await fetchDuJour()
  if (response?.success && response.data?.data) {
    interventionsDuJour.value = response.data.data
  }
}

const loadInterventionsAVenir = async () => {
  const response = await fetchAVenir()
  if (response?.success && response.data?.data) {
    interventionsAVenir.value = response.data.data
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadInterventionsDuJour(),
    loadInterventionsAVenir()
  ])

  // Mock stats - in real app would fetch from API
  stats.value = {
    interventionsTerminees: 24,
    tauxReussite: 92,
    rapportsRediges: 24,
    notemoyenne: 4.5
  }

  // Mock candidatures - in real app would fetch from API
  candidaturesEnAttente.value = []
})
</script>
