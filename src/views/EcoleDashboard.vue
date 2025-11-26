<template>
  <DashboardLayout>
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Tableau de Bord École</h1>
          <p class="text-gray-600 mt-1">Vue d'ensemble de votre établissement</p>
        </div>
        <button
          @click="showDeclarationModal = true"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors flex items-center gap-2"
        >
          <AlertTriangle :size="20" />
          Déclarer une panne
        </button>
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

      <!-- Abonnement Status -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <CreditCard :size="24" class="text-blue-600" />
          Mon abonnement
        </h2>

        <div v-if="abonnementActif" class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p class="text-sm text-gray-600 mb-1">Statut</p>
            <StatusBadge type="abonnement" :status="abonnementActif.statut" />
          </div>
          <div>
            <p class="text-sm text-gray-600 mb-1">Expire le</p>
            <p class="font-semibold text-gray-900">{{ formatDate(abonnementActif.date_fin) }}</p>
            <p v-if="joursRestants <= 30" class="text-xs text-orange-600 mt-1">
              ⚠️ {{ joursRestants }} jours restants
            </p>
          </div>
          <div>
            <p class="text-sm text-gray-600 mb-1">Type</p>
            <p class="font-semibold text-gray-900">{{ abonnementActif.type_abonnement || 'Standard' }}</p>
          </div>
        </div>

        <div v-else class="text-center py-8">
          <AlertCircle :size="48" class="text-orange-300 mx-auto mb-3" />
          <p class="text-gray-600 mb-4">Aucun abonnement actif</p>
          <button
            @click="router.push('/abonnements/nouveau')"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Souscrire un abonnement
          </button>
        </div>
      </div>

      <!-- Pannes Actives -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle :size="24" class="text-orange-600" />
            Pannes actives ({{ pannesActives.length }})
          </h2>
          <router-link
            to="/pannes"
            class="text-sm text-blue-600 hover:text-blue-700 font-semibold"
          >
            Voir tout →
          </router-link>
        </div>

        <div v-if="pannesActives.length > 0" class="space-y-3">
          <div
            v-for="panne in pannesActives"
            :key="panne.id"
            class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
            @click="router.push(`/pannes/${panne.id}`)"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <h4 class="font-semibold text-gray-900">{{ panne.titre }}</h4>
                  <StatusBadge type="panne" :status="panne.statut" />
                  <StatusBadge type="priorite" :status="panne.priorite" />
                </div>
                <p class="text-sm text-gray-700 mb-2">{{ panne.description }}</p>
                <div class="flex items-center gap-4 text-xs text-gray-600">
                  <span v-if="panne.site">
                    <MapPin :size="14" class="inline" /> {{ panne.site.nom }}
                  </span>
                  <span v-if="panne.sirene">
                    <Bell :size="14" class="inline" /> Sirène {{ panne.sirene.numero_serie }}
                  </span>
                  <span>
                    <Clock :size="14" class="inline" /> {{ formatDate(panne.date_declaration) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8 text-gray-500">
          <CheckCircle :size="48" class="text-green-300 mx-auto mb-3" />
          <p>Aucune panne active</p>
        </div>
      </div>

      <!-- Filtres Interventions -->
      <FilterBar
        :show-statut="true"
        :show-site="true"
        :show-date-debut="true"
        :show-date-fin="true"
        :sites="sites"
        @filter-change="handleFilterChange"
      />

      <!-- Interventions en Cours -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Wrench :size="24" class="text-purple-600" />
            Interventions en cours ({{ interventionsEnCours.length }})
          </h2>
        </div>

        <div v-if="interventionsEnCours.length > 0" class="space-y-3">
          <div
            v-for="intervention in interventionsEnCours"
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
                <p v-if="intervention.lieu_rdv" class="text-xs text-gray-600 mt-1">
                  RDV: {{ intervention.lieu_rdv }} à {{ intervention.heure_rdv }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8 text-gray-500">
          <Wrench :size="48" class="text-gray-300 mx-auto mb-3" />
          <p>Aucune intervention en cours</p>
        </div>
      </div>

      <!-- Mes Sirènes -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Bell :size="24" class="text-indigo-600" />
            Mes sirènes ({{ sirenes.length }})
          </h2>
          <router-link
            to="/sirens"
            class="text-sm text-blue-600 hover:text-blue-700 font-semibold"
          >
            Gérer →
          </router-link>
        </div>

        <div v-if="sirenes.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="sirene in sirenes"
            :key="sirene.id"
            class="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
          >
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <Bell :size="20" class="text-indigo-600" />
              </div>
              <div class="flex-1">
                <p class="font-semibold text-gray-900">{{ sirene.numero_serie }}</p>
                <p class="text-xs text-gray-600">{{ sirene.modele?.nom || 'Modèle inconnu' }}</p>
              </div>
            </div>
            <div class="text-xs text-gray-600">
              <p v-if="sirene.site">Site: {{ sirene.site.nom }}</p>
              <p v-if="sirene.etat">État: {{ sirene.etat }}</p>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8 text-gray-500">
          <Bell :size="48" class="text-gray-300 mx-auto mb-3" />
          <p>Aucune sirène installée</p>
        </div>
      </div>

      <!-- Mes Sites -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin :size="24" class="text-green-600" />
            Mes sites ({{ sites.length }})
          </h2>
        </div>

        <div v-if="sites.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="site in sites"
            :key="site.id"
            class="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
          >
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <MapPin :size="20" class="text-green-600" />
              </div>
              <div class="flex-1">
                <p class="font-semibold text-gray-900 mb-1">{{ site.nom }}</p>
                <p class="text-sm text-gray-600">{{ site.adresse }}</p>
                <p v-if="site.ville" class="text-xs text-gray-500 mt-1">{{ site.ville.nom }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8 text-gray-500">
          <MapPin :size="48" class="text-gray-300 mx-auto mb-3" />
          <p>Aucun site enregistré</p>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 :size="24" class="text-cyan-600" />
          Statistiques
        </h2>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div class="text-center">
            <p class="text-3xl font-bold text-blue-600">{{ stats.totalPannes }}</p>
            <p class="text-sm text-gray-600 mt-1">Total pannes</p>
          </div>
          <div class="text-center">
            <p class="text-3xl font-bold text-green-600">{{ stats.pannesResolues }}</p>
            <p class="text-sm text-gray-600 mt-1">Résolues</p>
          </div>
          <div class="text-center">
            <p class="text-3xl font-bold text-purple-600">{{ stats.interventionsTerminees }}</p>
            <p class="text-sm text-gray-600 mt-1">Interventions</p>
          </div>
          <div class="text-center">
            <p class="text-3xl font-bold text-yellow-600">{{ stats.tempsResolution }}j</p>
            <p class="text-sm text-gray-600 mt-1">Délai moyen</p>
          </div>
        </div>
      </div>
    </div>

    <PanneDeclarationModal 
      :show="showDeclarationModal" 
      @close="showDeclarationModal = false"
      @panne-declaree="handlePanneDeclaree"
    />
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '../components/layout/DashboardLayout.vue'
import StatusBadge from '../components/common/StatusBadge.vue'
import FilterBar from '../components/common/FilterBar.vue'
import PanneDeclarationModal from '../components/pannes/PanneDeclarationModal.vue'
import dashboardService from '@/services/dashboardService'
import type { InterventionFilters } from '@/services/dashboardService'
import type { ApiAbonnement, ApiPanne, ApiIntervention, ApiSirene, ApiSite } from '@/types/api'
import {
  AlertTriangle,
  CreditCard,
  Bell,
  MapPin,
  Wrench,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Clock,
  X
} from 'lucide-vue-next'

const router = useRouter()

// State
const abonnementActif = ref<ApiAbonnement | null>(null)
const pannesActives = ref<ApiPanne[]>([])
const interventionsEnCours = ref<ApiIntervention[]>([])
const sirenes = ref<ApiSirene[]>([])
const sites = ref<ApiSite[]>([])
const showDeclarationModal = ref(false)

const stats = ref({
  totalPannes: 0,
  pannesResolues: 0,
  interventionsTerminees: 0,
  tempsResolution: 0
})

const currentFilters = ref<InterventionFilters>({})

// Computed
const joursRestants = computed(() => {
  if (!abonnementActif.value?.date_fin) return 0
  const dateFin = new Date(abonnementActif.value.date_fin)
  const aujourdhui = new Date()
  const diff = dateFin.getTime() - aujourdhui.getTime()
  return Math.ceil(diff / (1000 * 3600 * 24))
})

const quickStats = computed(() => [
  {
    label: 'Sirènes',
    count: sirenes.value.length,
    icon: Bell,
    bgColor: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    textColor: 'text-indigo-600'
  },
  {
    label: 'Sites',
    count: sites.value.length,
    icon: MapPin,
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600',
    textColor: 'text-green-600'
  },
  {
    label: 'Pannes actives',
    count: pannesActives.value.length,
    icon: AlertTriangle,
    bgColor: 'bg-orange-100',
    iconColor: 'text-orange-600',
    textColor: 'text-orange-600'
  },
  {
    label: 'Interventions',
    count: interventionsEnCours.value.length,
    icon: Wrench,
    bgColor: 'bg-purple-100',
    iconColor: 'text-purple-600',
    textColor: 'text-purple-600'
  }
])

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const handlePanneDeclaree = () => {
  loadData();
}

const handleFilterChange = async (filters: InterventionFilters) => {
  currentFilters.value = filters
  await loadInterventions()
}

const loadInterventions = async () => {
  try {
    const interventionsResponse = await dashboardService.getInterventionsEnCours(currentFilters.value)
    if (interventionsResponse.success && interventionsResponse.data) {
      interventionsEnCours.value = interventionsResponse.data
    }
  } catch (error) {
    console.error('Erreur lors du chargement des interventions:', error)
  }
}

const loadData = async () => {
  try {
    const pannesResponse = await dashboardService.getPannesActives()
    if (pannesResponse.success && pannesResponse.data) {
      pannesActives.value = pannesResponse.data
    }

    await loadInterventions()

    const statsResponse = await dashboardService.getStatistiquesEcole()
    if (statsResponse.success && statsResponse.data) {
      stats.value = {
        totalPannes: statsResponse.data.total_pannes || 0,
        pannesResolues: statsResponse.data.pannes_resolues || 0,
        interventionsTerminees: statsResponse.data.interventions_terminees || 0,
        tempsResolution: statsResponse.data.temps_resolution_moyen || 0
      }
    }
    
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error)
  }
}

// Lifecycle
onMounted(async () => {
  await loadData()
})
</script>
