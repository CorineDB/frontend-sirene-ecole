<template>
  <DashboardLayout>
    <div class="p-6 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p class="text-gray-600 mt-1">
            Bienvenue, <span class="font-semibold">{{ authStore.user?.nom_utilisateur }}</span>
          </p>
        </div>
        <div class="text-sm text-gray-500">
          {{ currentDate }}
        </div>
      </div>

      <!-- Stat Cards -->
      <div v-if="loadingStats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="i in 6"
          :key="i"
          class="bg-white rounded-xl p-6 border border-gray-200"
        >
          <div class="animate-pulse">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-gray-200 rounded-xl"></div>
              <div class="text-right">
                <div class="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                <div class="h-6 w-16 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div class="h-4 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="(card, index) in statCards"
          :key="index"
          class="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all transform hover:scale-[1.02]"
        >
          <div class="flex items-center justify-between mb-4">
            <div :class="`${card.bgColor} p-3 rounded-xl`">
              <component :is="card.icon" :size="24" :class="`${card.iconColor}`" />
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-600">{{ card.title }}</p>
              <p :class="`text-2xl font-bold text-gray-900 ${card.isAmount ? 'text-lg' : ''}`">
                {{ card.value }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <div class="w-4 h-4 bg-gray-200 rounded"></div>
            <span class="text-gray-400">Mis à jour</span>
          </div>
        </div>
      </div>

      <!-- Pannes récentes & Techniciens actifs -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Pannes récentes -->
        <div class="bg-white rounded-xl p-6 border border-gray-200">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-gray-900">Pannes récentes</h2>
            <button class="text-sm text-blue-600 hover:text-blue-700 font-semibold">
              Voir tout
            </button>
          </div>

          <!-- Loading state -->
          <div v-if="loadingPannes" class="flex items-center justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>

          <!-- Empty state -->
          <div v-else-if="recentPannes.length === 0" class="text-center py-8">
            <AlertCircle :size="48" class="mx-auto text-gray-300 mb-2" />
            <p class="text-sm text-gray-600">Aucune panne récente</p>
          </div>

          <!-- Pannes list -->
          <div v-else class="space-y-3">
            <div
              v-for="panne in recentPannes"
              :key="panne.id"
              class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertCircle :size="20" class="text-orange-600" />
              </div>
              <div class="flex-1">
                <p class="font-semibold text-gray-900">{{ panne.ecole?.nom || 'École inconnue' }}</p>
                <p class="text-sm text-gray-600">{{ panne.description || 'Pas de description' }}</p>
              </div>
              <div class="text-right">
                <span :class="`text-xs px-2 py-1 rounded-full font-semibold ${getStatusColor(panne.statut)}`">
                  {{ getStatusLabel(panne.statut) }}
                </span>
                <p class="text-xs text-gray-500 mt-1">{{ formatTimeAgo(panne.created_at) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Techniciens actifs -->
        <div class="bg-white rounded-xl p-6 border border-gray-200">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-gray-900">Techniciens</h2>
            <button class="text-sm text-blue-600 hover:text-blue-700 font-semibold">
              Voir tout
            </button>
          </div>

          <!-- Loading state -->
          <div v-if="loadingTechniciens" class="flex items-center justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>

          <!-- Empty state -->
          <div v-else-if="technicians.length === 0" class="text-center py-8">
            <Wrench :size="48" class="mx-auto text-gray-300 mb-2" />
            <p class="text-sm text-gray-600">Aucun technicien trouvé</p>
          </div>

          <!-- Techniciens list -->
          <div v-else class="space-y-3">
            <div
              v-for="tech in technicians"
              :key="tech.id"
              class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                <span class="text-white font-bold text-sm">
                  {{ tech.user?.nom_utilisateur?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'T' }}
                </span>
              </div>
              <div class="flex-1">
                <p class="font-semibold text-gray-900">{{ tech.user?.nom_utilisateur || 'Technicien' }}</p>
                <p class="text-sm text-gray-600">{{ tech.specialite || 'Technicien certifié' }}</p>
              </div>
              <span :class="`text-xs px-2 py-1 rounded-full font-semibold ${getTechnicienStatus(tech).color}`">
                {{ getTechnicienStatus(tech).label }}
              </span>
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
import { useAuthStore } from '../stores/auth'
import { usePermissions } from '../composables/usePermissions'
import { usePannes } from '../composables/usePannes'
import DashboardLayout from '../components/layout/DashboardLayout.vue'
import { Can } from '../components/permissions'
import {
  Building2, Bell, CheckCircle, AlertCircle, Wrench,
  CreditCard, TrendingUp
} from 'lucide-vue-next'
import userService from '../services/userService'
import sirenService from '../services/sirenService'
import abonnementService from '../services/abonnementService'
import technicienService from '../services/technicienService'
import type { ApiPanne } from '../types/api'
import type { Technicien } from '../services/technicienService'

const authStore = useAuthStore()
const router = useRouter()
const { hasPermission, isAdmin } = usePermissions()
const { fetchAllPannes } = usePannes()

// Rediriger vers le dashboard spécifique selon le type d'utilisateur
onMounted(async () => {
  console.log('=== DashboardView - Vérification redirection ===')

  // Récupérer les données fraîches de l'utilisateur via /api/me
  try {
    await authStore.fetchUser()
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error)
  }

  const user = authStore.user
  console.log('User après /api/me:', user)
  console.log('user_account_type_type:', user?.user_account_type_type)
  console.log('user_account_type_id:', user?.user_account_type_id)
  console.log('roleSlug:', user?.roleSlug)
  console.log('role.slug:', user?.role?.slug)

  if (!user) {
    console.log('❌ Pas d\'utilisateur - pas de redirection')
    return
  }

  // Rediriger les utilisateurs École vers leur dashboard spécifique
  if (user.user_account_type_type === 'App\\Models\\Ecole') {
    console.log('✅ Utilisateur École détecté - Redirection vers /dashboard/ecole')
    router.replace('/dashboard/ecole')
    return
  }

  // Rediriger les techniciens vers leur dashboard spécifique
  if (user.roleSlug === 'technicien' || user.role?.slug === 'technicien') {
    console.log('✅ Utilisateur Technicien détecté - Redirection vers /dashboard/technicien')
    router.replace('/dashboard/technicien')
    return
  }

  console.log('ℹ️ Utilisateur Admin - Reste sur dashboard central')

  // Charger les données du dashboard pour les admins
  loadDashboardStats()
  loadRecentPannes()
  loadTechnicians()
})

// État de chargement
const loadingStats = ref(true)
const loadingPannes = ref(true)
const loadingTechniciens = ref(true)

// Données du dashboard
const stats = ref({
  total_schools: 0,
  active_subscriptions: 0,
  total_sirens: 0,
  pending_breakdowns: 0,
  total_technicians: 0,
  total_payments: 0,
})

const recentPannes = ref<ApiPanne[]>([])
const technicians = ref<Technicien[]>([])

const statCards = computed(() => [
  {
    title: 'Écoles',
    value: stats.value.total_schools,
    icon: Building2,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    title: 'Sirènes actives',
    value: stats.value.total_sirens,
    icon: Bell,
    color: 'from-cyan-500 to-cyan-600',
    bgColor: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
  },
  {
    title: 'Abonnements actifs',
    value: stats.value.active_subscriptions,
    icon: CheckCircle,
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    title: 'Pannes en attente',
    value: stats.value.pending_breakdowns,
    icon: AlertCircle,
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
    iconColor: 'text-orange-600',
  },
  {
    title: 'Techniciens',
    value: stats.value.total_technicians,
    icon: Wrench,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
  {
    title: 'Revenus totaux',
    value: stats.value.total_payments > 0 ? `${stats.value.total_payments.toLocaleString()} XOF` : '0 XOF',
    icon: CreditCard,
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    isAmount: true,
  },
])

// Charger les statistiques depuis le backend
const loadDashboardStats = async () => {
  loadingStats.value = true
  try {
    // Charger les stats utilisateurs (pour les écoles)
    const userStatsResponse = await userService.getUserStats()
    if (userStatsResponse.success && userStatsResponse.data) {
      stats.value.total_schools = userStatsResponse.data.by_type?.ECOLE || 0
      stats.value.total_technicians = userStatsResponse.data.by_type?.TECHNICIEN || 0
    }

    // Charger les stats des sirènes
    const sirenStatsResponse = await sirenService.getSirenStats()
    if (sirenStatsResponse.success && sirenStatsResponse.data) {
      stats.value.total_sirens = sirenStatsResponse.data.total || 0
    }

    // Charger les stats des abonnements
    const abonnementStatsResponse = await abonnementService.getStatistiques()
    if (abonnementStatsResponse.success && abonnementStatsResponse.data) {
      stats.value.active_subscriptions = abonnementStatsResponse.data.actifs || 0
      stats.value.total_payments = abonnementStatsResponse.data.revenus_total || 0
    }
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques:', error)
  } finally {
    loadingStats.value = false
  }
}

// Charger les pannes récentes
const loadRecentPannes = async () => {
  loadingPannes.value = true
  try {
    const response = await fetchAllPannes(5) // Récupérer les 5 dernières pannes
    if (response?.data?.data) {
      recentPannes.value = response.data.data.slice(0, 4) // Limiter à 4 pour l'affichage
      // Compter les pannes en attente (statut: declaree ou validee)
      const allPannes = response.data.data
      stats.value.pending_breakdowns = allPannes.filter(
        p => p.statut === 'declaree' || p.statut === 'validee'
      ).length
    }
  } catch (error) {
    console.error('Erreur lors du chargement des pannes:', error)
  } finally {
    loadingPannes.value = false
  }
}

// Charger les techniciens actifs
const loadTechnicians = async () => {
  loadingTechniciens.value = true
  try {
    const response = await technicienService.getAll(4) // Récupérer les 4 premiers techniciens
    if (response.success && response.data?.data) {
      technicians.value = response.data.data
    }
  } catch (error) {
    console.error('Erreur lors du chargement des techniciens:', error)
  } finally {
    loadingTechniciens.value = false
  }
}

// Utilitaires pour l'affichage
const getStatusLabel = (statut: string): string => {
  const labels: Record<string, string> = {
    'declaree': 'Signalée',
    'validee': 'Validée',
    'assignee': 'Assignée',
    'en_cours': 'En cours',
    'resolue': 'Résolue',
    'cloturee': 'Clôturée',
  }
  return labels[statut] || statut
}

const getStatusColor = (statut: string): string => {
  const colors: Record<string, string> = {
    'declaree': 'bg-yellow-100 text-yellow-700',
    'validee': 'bg-blue-100 text-blue-700',
    'assignee': 'bg-purple-100 text-purple-700',
    'en_cours': 'bg-cyan-100 text-cyan-700',
    'resolue': 'bg-green-100 text-green-700',
    'cloturee': 'bg-gray-100 text-gray-700',
  }
  return colors[statut] || 'bg-gray-100 text-gray-700'
}

const getTechnicienStatus = (technicien: Technicien): { label: string; color: string } => {
  if (technicien.disponibilite) {
    return { label: 'Disponible', color: 'bg-blue-100 text-blue-700' }
  }
  return { label: 'Non disponible', color: 'bg-gray-100 text-gray-700' }
}

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffHours < 1) return 'Il y a moins d\'1h'
  if (diffHours < 24) return `Il y a ${diffHours}h`
  return `Il y a ${diffDays}j`
}

const currentDate = computed(() => {
  return new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})
</script>
