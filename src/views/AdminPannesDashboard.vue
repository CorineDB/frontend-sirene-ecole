<template>
  <DashboardLayout>
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Dashboard Pannes</h1>
          <p class="text-gray-600 mt-1">Vue d'ensemble et analyse des pannes</p>
        </div>
        <button
          @click="router.push('/pannes')"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors flex items-center gap-2"
        >
          <List :size="20" />
          Voir toutes les pannes
        </button>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div
          v-for="kpi in kpiCards"
          :key="kpi.label"
          class="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div class="flex items-center justify-between mb-3">
            <div :class="`w-12 h-12 rounded-lg flex items-center justify-center ${kpi.bgColor}`">
              <component :is="kpi.icon" :size="24" :class="kpi.iconColor" />
            </div>
          </div>
          <p class="text-3xl font-bold text-gray-900 mb-1">{{ kpi.value }}</p>
          <p class="text-sm text-gray-600">{{ kpi.label }}</p>
          <p v-if="kpi.trend" :class="`text-xs mt-2 ${kpi.trendColor}`">
            {{ kpi.trend }}
          </p>
        </div>
      </div>

      <!-- Statistics by Priority -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp :size="24" class="text-blue-600" />
          Répartition par priorité
        </h2>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div
            v-for="priority in priorityStats"
            :key="priority.label"
            class="text-center p-4 rounded-lg border-2"
            :class="priority.borderClass"
          >
            <p :class="`text-4xl font-bold ${priority.textColor} mb-2`">{{ priority.count }}</p>
            <p class="text-sm font-semibold text-gray-900">{{ priority.label }}</p>
            <p class="text-xs text-gray-600 mt-1">{{ priority.percentage }}%</p>
          </div>
        </div>
      </div>

      <!-- Recent Urgent Pannes -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle :size="24" class="text-red-600" />
            Pannes urgentes récentes
          </h2>
          <router-link
            to="/pannes"
            class="text-sm text-blue-600 hover:text-blue-700 font-semibold"
          >
            Voir tout →
          </router-link>
        </div>

        <div v-if="pannesUrgentes.length > 0" class="space-y-3">
          <div
            v-for="panne in pannesUrgentes"
            :key="panne.id"
            class="border-l-4 border-red-500 bg-red-50 rounded-lg p-4 hover:bg-red-100 transition-colors cursor-pointer"
            @click="router.push(`/pannes/${panne.id}`)"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <h4 class="font-semibold text-gray-900">{{ panne.titre }}</h4>
                  <StatusBadge type="panne" :status="panne.statut" />
                  <StatusBadge type="priorite" :status="panne.priorite" />
                </div>
                <p class="text-sm text-gray-700 mb-2">{{ panne.description }}</p>
                <div class="flex items-center gap-4 text-xs text-gray-600">
                  <span v-if="panne.ecole">
                    <Building :size="14" class="inline" /> {{ panne.ecole.nom }}
                  </span>
                  <span v-if="panne.site">
                    <MapPin :size="14" class="inline" /> {{ panne.site.nom }}
                  </span>
                  <span>
                    <Clock :size="14" class="inline" /> {{ formatDate(panne.date_declaration) }}
                  </span>
                </div>
              </div>
              <button
                v-if="panne.statut === 'declaree'"
                @click.stop="handleValider(panne.id)"
                class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-semibold"
              >
                Valider
              </button>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8 text-gray-500">
          <CheckCircle :size="48" class="text-green-300 mx-auto mb-3" />
          <p>Aucune panne urgente en cours</p>
        </div>
      </div>

      <!-- Pannes by Status -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 :size="24" class="text-indigo-600" />
          Répartition par statut
        </h2>

        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div
            v-for="status in statusStats"
            :key="status.label"
            class="p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
          >
            <div class="flex items-center justify-between mb-2">
              <StatusBadge type="panne" :status="status.key" />
              <p class="text-2xl font-bold text-gray-900">{{ status.count }}</p>
            </div>
            <p class="text-xs text-gray-600">{{ status.percentage }}% du total</p>
          </div>
        </div>
      </div>

      <!-- Temps Moyen de Résolution -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Timer :size="24" class="text-purple-600" />
          Performance de résolution
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center">
            <p class="text-4xl font-bold text-blue-600 mb-2">{{ performanceStats.tempsValidation }}</p>
            <p class="text-sm text-gray-600">Temps moyen de validation</p>
            <p class="text-xs text-gray-500 mt-1">en heures</p>
          </div>
          <div class="text-center">
            <p class="text-4xl font-bold text-purple-600 mb-2">{{ performanceStats.tempsResolution }}</p>
            <p class="text-sm text-gray-600">Temps moyen de résolution</p>
            <p class="text-xs text-gray-500 mt-1">en jours</p>
          </div>
          <div class="text-center">
            <p class="text-4xl font-bold text-green-600 mb-2">{{ performanceStats.tauxResolution }}%</p>
            <p class="text-sm text-gray-600">Taux de résolution</p>
            <p class="text-xs text-gray-500 mt-1">pannes résolues</p>
          </div>
        </div>
      </div>

      <!-- Top Écoles avec Pannes -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 :size="24" class="text-orange-600" />
          Écoles avec le plus de pannes
        </h2>

        <div class="space-y-3">
          <div
            v-for="(ecole, index) in topEcoles"
            :key="ecole.id"
            class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div class="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <span class="text-sm font-bold text-orange-600">{{ index + 1 }}</span>
            </div>
            <div class="flex-1">
              <p class="font-semibold text-gray-900">{{ ecole.nom }}</p>
              <p class="text-xs text-gray-600">{{ ecole.ville }}</p>
            </div>
            <div class="text-right">
              <p class="text-2xl font-bold text-gray-900">{{ ecole.pannesCount }}</p>
              <p class="text-xs text-gray-600">pannes</p>
            </div>
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
import { usePannes } from '@/composables/usePannes'
import { PrioritePanne, StatutPanne } from '@/types/api'
import type { ApiPanne } from '@/types/api'
import {
  List,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Timer,
  Building2,
  Building,
  MapPin,
  Clock,
  CheckCircle
} from 'lucide-vue-next'

const router = useRouter()

// Composable
const {
  pannes,
  fetchAllPannes,
  validerPanne
} = usePannes()

// State
const pannesUrgentes = ref<ApiPanne[]>([])
const performanceStats = ref({
  tempsValidation: 2.5,
  tempsResolution: 3.2,
  tauxResolution: 87
})
const topEcoles = ref<any[]>([])

// Computed
const totalPannes = computed(() => pannes.value.length)

const kpiCards = computed(() => [
  {
    label: 'Total pannes',
    value: totalPannes.value,
    icon: AlertTriangle,
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
    trend: '+12% ce mois',
    trendColor: 'text-blue-600'
  },
  {
    label: 'Pannes urgentes',
    value: pannes.value.filter(p => p.priorite === PrioritePanne.URGENTE).length,
    icon: AlertTriangle,
    bgColor: 'bg-red-100',
    iconColor: 'text-red-600',
    trend: '-5% ce mois',
    trendColor: 'text-green-600'
  },
  {
    label: 'En attente validation',
    value: pannes.value.filter(p => p.statut === StatutPanne.DECLAREE).length,
    icon: Clock,
    bgColor: 'bg-yellow-100',
    iconColor: 'text-yellow-600'
  },
  {
    label: 'Résolues ce mois',
    value: pannes.value.filter(p => p.statut === StatutPanne.RESOLUE).length,
    icon: CheckCircle,
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600',
    trend: '+8% vs mois dernier',
    trendColor: 'text-green-600'
  }
])

const priorityStats = computed(() => {
  const total = totalPannes.value || 1
  return [
    {
      label: 'Urgente',
      count: pannes.value.filter(p => p.priorite === PrioritePanne.URGENTE).length,
      percentage: Math.round((pannes.value.filter(p => p.priorite === PrioritePanne.URGENTE).length / total) * 100),
      borderClass: 'border-red-300 bg-red-50',
      textColor: 'text-red-600'
    },
    {
      label: 'Haute',
      count: pannes.value.filter(p => p.priorite === PrioritePanne.HAUTE).length,
      percentage: Math.round((pannes.value.filter(p => p.priorite === PrioritePanne.HAUTE).length / total) * 100),
      borderClass: 'border-orange-300 bg-orange-50',
      textColor: 'text-orange-600'
    },
    {
      label: 'Moyenne',
      count: pannes.value.filter(p => p.priorite === PrioritePanne.MOYENNE).length,
      percentage: Math.round((pannes.value.filter(p => p.priorite === PrioritePanne.MOYENNE).length / total) * 100),
      borderClass: 'border-yellow-300 bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      label: 'Basse',
      count: pannes.value.filter(p => p.priorite === PrioritePanne.BASSE).length,
      percentage: Math.round((pannes.value.filter(p => p.priorite === PrioritePanne.BASSE).length / total) * 100),
      borderClass: 'border-gray-300 bg-gray-50',
      textColor: 'text-gray-600'
    }
  ]
})

const statusStats = computed(() => {
  const total = totalPannes.value || 1
  return [
    {
      label: 'Déclarée',
      key: StatutPanne.DECLAREE,
      count: pannes.value.filter(p => p.statut === StatutPanne.DECLAREE).length,
      percentage: Math.round((pannes.value.filter(p => p.statut === StatutPanne.DECLAREE).length / total) * 100)
    },
    {
      label: 'Validée',
      key: StatutPanne.VALIDEE,
      count: pannes.value.filter(p => p.statut === StatutPanne.VALIDEE).length,
      percentage: Math.round((pannes.value.filter(p => p.statut === StatutPanne.VALIDEE).length / total) * 100)
    },
    {
      label: 'Assignée',
      key: StatutPanne.ASSIGNEE,
      count: pannes.value.filter(p => p.statut === StatutPanne.ASSIGNEE).length,
      percentage: Math.round((pannes.value.filter(p => p.statut === StatutPanne.ASSIGNEE).length / total) * 100)
    },
    {
      label: 'En cours',
      key: StatutPanne.EN_COURS,
      count: pannes.value.filter(p => p.statut === StatutPanne.EN_COURS).length,
      percentage: Math.round((pannes.value.filter(p => p.statut === StatutPanne.EN_COURS).length / total) * 100)
    },
    {
      label: 'Résolue',
      key: StatutPanne.RESOLUE,
      count: pannes.value.filter(p => p.statut === StatutPanne.RESOLUE).length,
      percentage: Math.round((pannes.value.filter(p => p.statut === StatutPanne.RESOLUE).length / total) * 100)
    },
    {
      label: 'Clôturée',
      key: StatutPanne.CLOTUREE,
      count: pannes.value.filter(p => p.statut === StatutPanne.CLOTUREE).length,
      percentage: Math.round((pannes.value.filter(p => p.statut === StatutPanne.CLOTUREE).length / total) * 100)
    }
  ]
})

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const handleValider = async (panneId: string) => {
  const nombreTechniciens = prompt('Nombre de techniciens requis:', '1')
  if (nombreTechniciens) {
    await validerPanne(panneId, {
      nombre_techniciens_requis: parseInt(nombreTechniciens)
    })
    await fetchAllPannes()
    loadPannesUrgentes()
  }
}

const loadPannesUrgentes = () => {
  pannesUrgentes.value = pannes.value
    .filter(p => p.priorite === PrioritePanne.URGENTE && p.statut !== StatutPanne.RESOLUE && p.statut !== StatutPanne.CLOTUREE)
    .slice(0, 5)
}

// Lifecycle
onMounted(async () => {
  await fetchAllPannes()
  loadPannesUrgentes()

  // Mock top écoles - in real app would fetch from API
  topEcoles.value = [
    { id: '1', nom: 'École Primaire Jean Jaurès', ville: 'Paris 19e', pannesCount: 8 },
    { id: '2', nom: 'Collège Victor Hugo', ville: 'Lyon 3e', pannesCount: 6 },
    { id: '3', nom: 'Lycée Pasteur', ville: 'Marseille 8e', pannesCount: 5 },
    { id: '4', nom: 'École Maternelle Louise Michel', ville: 'Toulouse 2e', pannesCount: 4 },
    { id: '5', nom: 'Collège Émile Zola', ville: 'Bordeaux 1er', pannesCount: 3 }
  ]
})
</script>
