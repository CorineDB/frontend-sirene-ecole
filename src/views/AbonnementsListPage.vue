<template>
  <DashboardLayout>
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Abonnements</h1>
          <p class="text-gray-600 mt-1">Gérer les abonnements des écoles</p>
        </div>
        <button
          @click="router.push('/abonnements/nouveau')"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors flex items-center gap-2"
        >
          <Plus :size="20" />
          Nouvel abonnement
        </button>
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
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <div class="flex gap-4 flex-wrap">
          <select
            v-model="filterStatus"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option :value="StatutAbonnement.ACTIF">Actif</option>
            <option :value="StatutAbonnement.EN_ATTENTE">En attente</option>
            <option :value="StatutAbonnement.EXPIRE">Expiré</option>
            <option :value="StatutAbonnement.SUSPENDU">Suspendu</option>
          </select>

          <button
            @click="fetchAbonnementsExpirantBientot(30)"
            class="px-4 py-2 border border-orange-300 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 font-semibold transition-colors"
          >
            Expirent bientôt (30j)
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

      <!-- Subscriptions Table -->
      <div v-if="!isLoading && !hasError" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Numéro</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">École</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Montant</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Dates</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Jours restants</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Statut</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr
                v-for="abo in displayedAbonnements"
                :key="abo.id"
                class="hover:bg-gray-50 transition-colors cursor-pointer"
                @click="router.push(`/abonnements/${abo.id}`)"
              >
                <td class="px-6 py-4">
                  <span class="font-mono text-sm font-semibold text-gray-900">
                    {{ abo.numero_abonnement }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div>
                    <p class="font-semibold text-gray-900">{{ abo.ecole?.nom || 'N/A' }}</p>
                    <p class="text-sm text-gray-600">{{ abo.site?.nom || 'N/A' }}</p>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="font-semibold text-gray-900">
                    {{ abo.montant.toLocaleString() }} XOF
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">
                  <div class="flex items-center gap-2 mb-1">
                    <Calendar :size="16" class="text-gray-400" />
                    <span>Du {{ formatDate(abo.date_debut) }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Calendar :size="16" class="text-gray-400" />
                    <span>Au {{ formatDate(abo.date_fin) }}</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span
                    v-if="abo.statut === StatutAbonnement.ACTIF"
                    :class="`text-sm font-semibold ${
                      calculateDaysRemaining(abo.date_fin) < 30
                        ? 'text-red-600'
                        : calculateDaysRemaining(abo.date_fin) < 60
                        ? 'text-orange-600'
                        : 'text-gray-900'
                    }`"
                  >
                    {{ calculateDaysRemaining(abo.date_fin) }} jours
                  </span>
                  <span v-else class="text-sm text-gray-400">-</span>
                </td>
                <td class="px-6 py-4" @click.stop>
                  <StatusBadge type="abonnement" :status="abo.statut" />
                </td>
                <td class="px-6 py-4" @click.stop>
                  <div class="flex gap-2">
                    <button
                      v-if="abo.statut === StatutAbonnement.ACTIF"
                      @click="handleRenouveler(abo.id)"
                      class="text-sm text-green-600 hover:text-green-700 font-semibold"
                      title="Renouveler"
                    >
                      <RefreshCw :size="16" />
                    </button>
                    <button
                      v-if="abo.qr_code_url"
                      @click="handleTelechargerQr(abo.id)"
                      class="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                      title="Télécharger QR Code"
                    >
                      <Download :size="16" />
                    </button>
                    <button
                      @click="router.push(`/abonnements/${abo.id}`)"
                      class="text-sm text-gray-600 hover:text-gray-700 font-semibold"
                    >
                      Détails
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!isLoading && !hasError && !hasAbonnements" class="bg-white rounded-xl p-12 text-center border border-gray-200">
        <CreditCard :size="64" class="text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Aucun abonnement trouvé</h3>
        <p class="text-gray-600 mb-4">
          {{ filterStatus !== 'all' ? 'Aucun abonnement ne correspond à vos critères' : 'Commencez par créer un nouvel abonnement' }}
        </p>
        <button
          @click="router.push('/abonnements/nouveau')"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors inline-flex items-center gap-2"
        >
          <Plus :size="20" />
          Créer un abonnement
        </button>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '../components/layout/DashboardLayout.vue'
import StatusBadge from '../components/common/StatusBadge.vue'
import { useAbonnements } from '@/composables/useAbonnements'
import { StatutAbonnement } from '@/types/api'
import {
  CreditCard,
  Calendar,
  Plus,
  RefreshCw,
  Download,
  AlertCircle
} from 'lucide-vue-next'

const router = useRouter()

// Composable
const {
  abonnements,
  isLoading,
  hasError,
  error,
  hasAbonnements,
  fetchAbonnements,
  renouvelerAbonnement,
  telechargerQrCode,
  getAbonnementsExpirantBientot
} = useAbonnements()

// Local state for filters
const filterStatus = ref<string>('all')

// Computed
const displayedAbonnements = computed(() => {
  if (filterStatus.value === 'all') {
    return abonnements.value
  }
  return abonnements.value.filter(a => a.statut === filterStatus.value)
})

const statsCards = computed(() => [
  {
    label: 'Total',
    count: abonnements.value.length,
    color: 'from-blue-500 to-blue-600'
  },
  {
    label: 'Actifs',
    count: abonnements.value.filter(a => a.statut === StatutAbonnement.ACTIF).length,
    color: 'from-green-500 to-green-600'
  },
  {
    label: 'En attente',
    count: abonnements.value.filter(a => a.statut === StatutAbonnement.EN_ATTENTE).length,
    color: 'from-yellow-500 to-yellow-600'
  },
  {
    label: 'Expirés',
    count: abonnements.value.filter(a => a.statut === StatutAbonnement.EXPIRE).length,
    color: 'from-red-500 to-red-600'
  }
])

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const calculateDaysRemaining = (endDate: string) => {
  const end = new Date(endDate)
  const now = new Date()
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

const handleRenouveler = async (id: string) => {
  if (confirm('Êtes-vous sûr de vouloir renouveler cet abonnement ?')) {
    await renouvelerAbonnement(id)
  }
}

const handleTelechargerQr = async (id: string) => {
  await telechargerQrCode(id)
}

const fetchAbonnementsExpirantBientot = async (jours: number) => {
  await getAbonnementsExpirantBientot(jours)
  filterStatus.value = 'all'
}

const resetFilters = async () => {
  filterStatus.value = 'all'
  await fetchAbonnements()
}

// Lifecycle
onMounted(async () => {
  await fetchAbonnements()
})
</script>
