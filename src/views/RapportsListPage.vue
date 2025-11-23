<template>
  <DashboardLayout>
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Rapports d'Intervention</h1>
          <p class="text-gray-600 mt-1">Consulter et valider les rapports</p>
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
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <div class="flex gap-4 flex-wrap">
          <select
            v-model="filterResultat"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les résultats</option>
            <option :value="ResultatIntervention.RESOLU">Résolu</option>
            <option :value="ResultatIntervention.PARTIELLEMENT_RESOLU">Partiellement résolu</option>
            <option :value="ResultatIntervention.NON_RESOLU">Non résolu</option>
          </select>

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

      <!-- Rapports List -->
      <div v-if="!isLoading && !hasError" class="space-y-4">
        <div
          v-for="rapport in displayedRapports"
          :key="rapport.id"
          class="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all cursor-pointer"
          @click="handleViewDetails(rapport.id)"
        >
          <!-- Header -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-start gap-3 flex-1">
              <div class="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <FileText :size="24" class="text-indigo-600" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-bold text-gray-900">Rapport #{{ rapport.id.slice(0, 8) }}</h3>
                  <StatusBadge type="resultat" :status="rapport.resultat" />
                </div>
                <p v-if="rapport.intervention" class="text-sm text-gray-600">
                  Intervention: {{ rapport.intervention.id.slice(0, 8) }}
                </p>
                <p v-if="rapport.technicien" class="text-sm text-gray-500">
                  Technicien: {{ rapport.technicien.nom }}
                </p>
                <p v-else class="text-sm text-purple-600 font-semibold">
                  Rapport collectif
                </p>
              </div>
            </div>

            <div class="text-right" @click.stop>
              <p class="text-sm text-gray-600">{{ formatDate(rapport.created_at) }}</p>
              <div v-if="rapport.review_note" class="flex items-center gap-1 mt-1">
                <Star :size="14" class="text-yellow-500 fill-yellow-500" />
                <span class="text-sm font-semibold text-gray-900">{{ rapport.review_note }}/5</span>
              </div>
            </div>
          </div>

          <!-- Description -->
          <p v-if="rapport.rapport" class="text-sm text-gray-700 mb-4 line-clamp-2">
            {{ rapport.rapport }}
          </p>

          <!-- Details Grid -->
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div v-if="rapport.diagnostic">
              <p class="text-xs text-gray-600 mb-1">Diagnostic</p>
              <p class="text-sm font-semibold text-gray-900 truncate">{{ rapport.diagnostic.slice(0, 30) }}...</p>
            </div>

            <div v-if="rapport.travaux_effectues">
              <p class="text-xs text-gray-600 mb-1">Travaux</p>
              <p class="text-sm font-semibold text-gray-900 truncate">{{ rapport.travaux_effectues.slice(0, 30) }}...</p>
            </div>

            <div v-if="rapport.pieces_utilisees">
              <p class="text-xs text-gray-600 mb-1">Pièces</p>
              <p class="text-sm font-semibold text-gray-900 truncate">{{ rapport.pieces_utilisees.slice(0, 30) }}...</p>
            </div>
          </div>

          <!-- Photos -->
          <div v-if="rapport.photos && rapport.photos.length > 0" class="mb-4">
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <Camera :size="16" class="text-gray-400" />
              <span>{{ rapport.photos.length }} photo{{ rapport.photos.length > 1 ? 's' : '' }}</span>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="flex items-center justify-between pt-4 border-t border-gray-100" @click.stop>
            <div class="flex items-center gap-4">
              <span v-if="rapport.review_admin" class="text-sm text-green-600">
                <CheckCircle :size="16" class="inline mr-1" />
                Validé
              </span>
            </div>

            <div class="flex gap-2">
              <button
                v-if="!rapport.review_note"
                @click="handleNoter(rapport.id)"
                class="text-sm text-blue-600 hover:text-blue-700 font-semibold px-3 py-1 rounded hover:bg-blue-50"
              >
                Noter
              </button>
              <button
                @click="handleViewDetails(rapport.id)"
                class="text-sm text-gray-600 hover:text-gray-700 font-semibold px-3 py-1 rounded hover:bg-gray-50"
              >
                Détails
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!isLoading && !hasError && rapports.length === 0" class="bg-white rounded-xl p-12 text-center border border-gray-200">
        <FileText :size="64" class="text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Aucun rapport trouvé</h3>
        <p class="text-gray-600">Aucun rapport d'intervention enregistré</p>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '../components/layout/DashboardLayout.vue'
import StatusBadge from '../components/common/StatusBadge.vue'
import { ResultatIntervention } from '@/types/api'
import type { ApiRapportIntervention } from '@/types/api'
import {
  FileText,
  AlertCircle,
  Star,
  Camera,
  CheckCircle
} from 'lucide-vue-next'

const router = useRouter()

// Mock data - in real app would use composable
const rapports = ref<ApiRapportIntervention[]>([])
const isLoading = ref(false)
const hasError = ref(false)
const error = ref<string | null>(null)

// Local state
const filterResultat = ref<string>('all')

// Computed
const displayedRapports = computed(() => {
  if (filterResultat.value === 'all') {
    return rapports.value
  }
  return rapports.value.filter(r => r.resultat === filterResultat.value)
})

const statsCards = computed(() => [
  {
    label: 'Total',
    count: rapports.value.length,
    color: 'from-blue-500 to-blue-600'
  },
  {
    label: 'Résolus',
    count: rapports.value.filter(r => r.resultat === ResultatIntervention.RESOLU).length,
    color: 'from-green-500 to-green-600'
  },
  {
    label: 'Partiellement résolus',
    count: rapports.value.filter(r => r.resultat === ResultatIntervention.PARTIELLEMENT_RESOLU).length,
    color: 'from-yellow-500 to-yellow-600'
  },
  {
    label: 'Non résolus',
    count: rapports.value.filter(r => r.resultat === ResultatIntervention.NON_RESOLU).length,
    color: 'from-red-500 to-red-600'
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

const resetFilters = () => {
  filterResultat.value = 'all'
}

const handleNoter = (rapportId: string) => {
  const note = prompt('Note (1-5):')
  const commentaire = prompt('Commentaire admin:')

  if (note) {
    // In real app: await noterRapport(rapportId, { review_note: parseInt(note), review_admin: commentaire })
    console.log('Noter rapport:', rapportId, note, commentaire)
  }
}

const handleViewDetails = (rapportId: string) => {
  // In real app: router.push(`/rapports/${rapportId}`)
  console.log('View rapport details:', rapportId)
}

// Lifecycle
onMounted(async () => {
  // In real app: await fetchRapports()
  isLoading.value = true
  setTimeout(() => {
    rapports.value = []
    isLoading.value = false
  }, 500)
})
</script>
