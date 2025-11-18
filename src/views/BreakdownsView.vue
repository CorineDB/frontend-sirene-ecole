<template>
  <DashboardLayout>
    <div class="p-6 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Gestion des pannes</h1>
          <p class="text-gray-600 mt-1">Suivre et gérer les pannes signalées</p>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div
          v-for="stat in stats"
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
        <div class="flex gap-4">
          <select
            v-model="filterStatus"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="reported">Signalée</option>
            <option value="validated">Validée</option>
            <option value="assigned">Assignée</option>
            <option value="in_progress">En cours</option>
            <option value="resolved">Résolue</option>
            <option value="cancelled">Annulée</option>
          </select>
          <select
            v-model="filterPriority"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Toutes les priorités</option>
            <option value="low">Basse</option>
            <option value="medium">Moyenne</option>
            <option value="high">Haute</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>
      </div>

      <!-- Breakdowns Grid -->
      <div v-if="!loading" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          v-for="breakdown in filteredBreakdowns"
          :key="breakdown.id"
          class="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle :size="20" class="text-orange-600" />
              </div>
              <div>
                <h3 class="font-bold text-gray-900 mb-1">{{ breakdown.title }}</h3>
                <p class="text-sm text-gray-600">{{ breakdown.school_sites.schools.name }}</p>
              </div>
            </div>
            <span :class="`px-3 py-1 rounded-full text-xs font-semibold ${priorityColors[breakdown.priority]}`">
              {{ breakdown.priority }}
            </span>
          </div>

          <p class="text-sm text-gray-700 mb-4">{{ breakdown.description }}</p>

          <div class="space-y-2 mb-4">
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <MapPin :size="16" class="text-gray-400" />
              <span>{{ breakdown.school_sites.site_name }}, {{ breakdown.school_sites.city }}</span>
            </div>
            <div v-if="breakdown.sirens" class="flex items-center gap-2 text-sm text-gray-600">
              <Bell :size="16" class="text-gray-400" />
              <span>Sirène {{ breakdown.sirens.numero_serie }}</span>
            </div>
          </div>

          <div class="flex items-center justify-between pt-4 border-t border-gray-100">
            <span :class="`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${statusColors[breakdown.status]?.bg} ${statusColors[breakdown.status]?.text}`">
              <component :is="getStatusIcon(breakdown.status)" :size="12" />
              {{ breakdown.status }}
            </span>
            <div class="flex gap-2">
              <button
                v-if="breakdown.status === 'reported'"
                @click="openValidateModal(breakdown)"
                class="text-sm text-green-600 hover:text-green-700 font-semibold"
              >
                Valider
              </button>
              <button
                v-if="breakdown.status === 'validated'"
                @click="openAssignModal(breakdown)"
                class="text-sm text-blue-600 hover:text-blue-700 font-semibold"
              >
                Assigner
              </button>
              <button class="text-sm text-gray-600 hover:text-gray-700 font-semibold">
                Détails
              </button>
            </div>
          </div>

          <p class="text-xs text-gray-500 mt-3">
            Signalée le {{ formatDate(breakdown.created_at) }} à {{ formatTime(breakdown.created_at) }}
          </p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center h-96">
        <div class="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && filteredBreakdowns.length === 0" class="bg-white rounded-xl p-12 text-center border border-gray-200">
        <AlertCircle :size="64" class="text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Aucune panne trouvée</h3>
        <p class="text-gray-600">Aucune panne ne correspond à vos critères</p>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import DashboardLayout from '../components/layout/DashboardLayout.vue'
import { AlertCircle, Clock, CheckCircle, XCircle, MapPin, Bell } from 'lucide-vue-next'

interface Breakdown {
  id: string
  title: string
  description: string
  priority: string
  status: string
  created_at: string
  school_sites: {
    site_name: string
    city: string
    schools: {
      name: string
    }
  }
  sirens: {
    numero_serie: string
  } | null
}

const breakdowns = ref<Breakdown[]>([])
const loading = ref(true)
const filterStatus = ref('all')
const filterPriority = ref('all')

const statusColors: Record<string, { bg: string; text: string }> = {
  reported: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  validated: { bg: 'bg-blue-100', text: 'text-blue-700' },
  assigned: { bg: 'bg-purple-100', text: 'text-purple-700' },
  in_progress: { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  resolved: { bg: 'bg-green-100', text: 'text-green-700' },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-700' },
}

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
}

const stats = computed(() => [
  { label: 'Total', count: breakdowns.value.length, color: 'from-blue-500 to-blue-600' },
  { label: 'Signalées', count: breakdowns.value.filter(b => b.status === 'reported').length, color: 'from-yellow-500 to-yellow-600' },
  { label: 'Validées', count: breakdowns.value.filter(b => b.status === 'validated').length, color: 'from-blue-500 to-blue-600' },
  { label: 'En cours', count: breakdowns.value.filter(b => b.status === 'in_progress').length, color: 'from-cyan-500 to-cyan-600' },
  { label: 'Résolues', count: breakdowns.value.filter(b => b.status === 'resolved').length, color: 'from-green-500 to-green-600' },
])

const filteredBreakdowns = computed(() => {
  return breakdowns.value.filter(breakdown => {
    const matchesStatus = filterStatus.value === 'all' || breakdown.status === filterStatus.value
    const matchesPriority = filterPriority.value === 'all' || breakdown.priority === filterPriority.value
    return matchesStatus && matchesPriority
  })
})

const getStatusIcon = (status: string) => {
  const icons: Record<string, any> = {
    reported: Clock,
    validated: CheckCircle,
    assigned: Clock,
    in_progress: Clock,
    resolved: CheckCircle,
    cancelled: XCircle,
  }
  return icons[status] || Clock
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('fr-FR')
}

const openValidateModal = (breakdown: Breakdown) => {
  alert(`Validation de la panne: ${breakdown.title}`)
}

const openAssignModal = (breakdown: Breakdown) => {
  alert(`Assignation de la panne: ${breakdown.title}`)
}

const fetchBreakdowns = async () => {
  setTimeout(() => {
    breakdowns.value = [
      {
        id: '1',
        title: 'Sirène ne sonne plus',
        description: 'La sirène ne produit aucun son lors de l\'activation',
        priority: 'high',
        status: 'reported',
        created_at: '2024-06-01T08:30:00Z',
        school_sites: {
          site_name: 'Site Principal',
          city: 'Ouagadougou',
          schools: {
            name: 'École Primaire Wemtenga',
          },
        },
        sirens: {
          numero_serie: 'SRN-2024-002',
        },
      },
      {
        id: '2',
        title: 'Volume très faible',
        description: 'Le volume de la sirène est insuffisant',
        priority: 'medium',
        status: 'validated',
        created_at: '2024-06-02T10:15:00Z',
        school_sites: {
          site_name: 'Bâtiment A',
          city: 'Ouagadougou',
          schools: {
            name: 'Lycée Municipal de Ouaga',
          },
        },
        sirens: {
          numero_serie: 'SRN-2024-003',
        },
      },
      {
        id: '3',
        title: 'Problème de programmation horaire',
        description: 'Les heures de sonnerie ne correspondent pas au calendrier',
        priority: 'medium',
        status: 'in_progress',
        created_at: '2024-06-03T14:20:00Z',
        school_sites: {
          site_name: 'Campus Principal',
          city: 'Bobo-Dioulasso',
          schools: {
            name: 'Collège Sainte Marie',
          },
        },
        sirens: null,
      },
      {
        id: '4',
        title: 'Câblage endommagé',
        description: 'Des câbles sont apparemment coupés ou détériorés',
        priority: 'high',
        status: 'reported',
        created_at: '2024-06-04T09:00:00Z',
        school_sites: {
          site_name: 'Site Principal',
          city: 'Koudougou',
          schools: {
            name: 'École Maternelle Les Papillons',
          },
        },
        sirens: null,
      },
      {
        id: '5',
        title: 'Sirène réparée avec succès',
        description: 'Remplacement du haut-parleur défectueux',
        priority: 'low',
        status: 'resolved',
        created_at: '2024-05-28T11:30:00Z',
        school_sites: {
          site_name: 'Bâtiment Technique',
          city: 'Ouahigouya',
          schools: {
            name: 'Lycée Technique de Ouahigouya',
          },
        },
        sirens: {
          numero_serie: 'SRN-2024-001',
        },
      },
    ]
    loading.value = false
  }, 500)
}

onMounted(() => {
  fetchBreakdowns()
})
</script>
