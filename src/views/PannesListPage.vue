<template>
  <DashboardLayout>
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Gestion des pannes</h1>
          <p class="text-gray-600 mt-1">Suivre et gérer les pannes signalées</p>
        </div>
        <button
          @click="showDeclarationModal = true"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors flex items-center gap-2"
        >
          <Plus :size="20" />
          Déclarer une panne
        </button>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-6">
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
            <option :value="StatutPanne.DECLAREE">Déclarée</option>
            <option :value="StatutPanne.VALIDEE">Validée</option>
            <option :value="StatutPanne.ASSIGNEE">Assignée</option>
            <option :value="StatutPanne.EN_COURS">En cours</option>
            <option :value="StatutPanne.RESOLUE">Résolue</option>
            <option :value="StatutPanne.CLOTUREE">Clôturée</option>
          </select>

          <select
            v-model="filterPriorite"
            @change="handleFilterChange"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Toutes les priorités</option>
            <option :value="PrioritePanne.BASSE">Basse</option>
            <option :value="PrioritePanne.MOYENNE">Moyenne</option>
            <option :value="PrioritePanne.HAUTE">Haute</option>
            <option :value="PrioritePanne.URGENTE">Urgente</option>
          </select>

          <button
            @click="showUrgentOnly"
            class="px-4 py-2 border border-red-300 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-semibold transition-colors"
          >
            <AlertTriangle :size="16" class="inline mr-2" />
            Urgentes uniquement
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

      <!-- Pannes Grid -->
      <div v-if="!isLoading && !hasError" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          v-for="panne in displayedPannes"
          :key="panne.id"
          class="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all cursor-pointer"
          @click="router.push(`/pannes/${panne.id}`)"
        >
          <!-- Header -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-start gap-3 flex-1">
              <div :class="`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getPriorityBgColor(panne.priorite)}`">
                <AlertTriangle :size="20" :class="getPriorityTextColor(panne.priorite)" />
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-bold text-gray-900 mb-1">{{ panne.titre || 'Panne sans titre' }}</h3>
                <p v-if="panne.ecole" class="text-sm text-gray-600 truncate">{{ panne.ecole.nom }}</p>
              </div>
            </div>
            <StatusBadge type="priorite" :status="panne.priorite" />
          </div>

          <!-- Description -->
          <p class="text-sm text-gray-700 mb-4 line-clamp-2">{{ panne.description || 'Aucune description' }}</p>

          <!-- Info -->
          <div class="space-y-2 mb-4">
            <div v-if="panne.site" class="flex items-center gap-2 text-sm text-gray-600">
              <MapPin :size="16" class="text-gray-400 flex-shrink-0" />
              <span class="truncate">{{ panne.site.nom }}</span>
            </div>
            <div v-if="panne.sirene" class="flex items-center gap-2 text-sm text-gray-600">
              <Bell :size="16" class="text-gray-400 flex-shrink-0" />
              <span class="truncate">Sirène {{ panne.sirene.numero_serie }}</span>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between pt-4 border-t border-gray-100" @click.stop>
            <StatusBadge type="panne" :status="panne.statut" />

            <div class="flex gap-2">
              <button
                v-if="panne.statut === StatutPanne.DECLAREE"
                @click="handleValider(panne.id)"
                class="text-sm text-green-600 hover:text-green-700 font-semibold px-3 py-1 rounded hover:bg-green-50"
              >
                Valider
              </button>
              <button
                v-if="panne.statut === StatutPanne.RESOLUE"
                @click="handleCloturer(panne.id)"
                class="text-sm text-blue-600 hover:text-blue-700 font-semibold px-3 py-1 rounded hover:bg-blue-50"
              >
                Clôturer
              </button>
              <button
                @click="router.push(`/pannes/${panne.id}`)"
                class="text-sm text-gray-600 hover:text-gray-700 font-semibold px-3 py-1 rounded hover:bg-gray-50"
              >
                Détails
              </button>
            </div>
          </div>

          <!-- Timestamp -->
          <p class="text-xs text-gray-500 mt-3">
            Signalée le {{ formatDate(panne.created_at) }} à {{ formatTime(panne.created_at) }}
          </p>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!isLoading && !hasError && displayedPannes.length === 0" class="bg-white rounded-xl p-12 text-center border border-gray-200">
        <AlertCircle :size="64" class="text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Aucune panne trouvée</h3>
        <p class="text-gray-600">
          {{ filterStatus !== 'all' || filterPriorite !== 'all'
            ? 'Aucune panne ne correspond à vos critères'
            : 'Aucune panne n\'a été signalée' }}
        </p>
      </div>

      <!-- Modal Déclaration de panne -->
      <div
        v-if="showDeclarationModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click.self="showDeclarationModal = false"
      >
        <div class="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <!-- Modal Header -->
          <div class="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 class="text-2xl font-bold text-gray-900">Déclarer une panne</h2>
            <button
              @click="showDeclarationModal = false"
              class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X :size="24" class="text-gray-600" />
            </button>
          </div>

          <!-- Modal Body -->
          <form @submit.prevent="handleDeclarer" class="p-6 space-y-6">
            <!-- Sirène -->
            <div>
              <label for="sirene_id" class="block text-sm font-semibold text-gray-900 mb-2">
                Sirène <span class="text-red-600">*</span>
              </label>
              <select
                id="sirene_id"
                v-model="declarationForm.sirene_id"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Sélectionnez une sirène</option>
                <option v-for="sirene in sirenes" :key="sirene.id" :value="sirene.id">
                  {{ sirene.numero_serie }} - {{ sirene.modele?.nom || 'Modèle inconnu' }}
                  <template v-if="sirene.site_id"> - Site: {{ sirene.site_id }}</template>
                </option>
              </select>
              <p class="text-xs text-gray-500 mt-1">Sélectionnez la sirène concernée par la panne</p>
            </div>

            <!-- Titre -->
            <div>
              <label for="titre" class="block text-sm font-semibold text-gray-900 mb-2">
                Titre de la panne <span class="text-red-600">*</span>
              </label>
              <input
                id="titre"
                v-model="declarationForm.titre"
                type="text"
                required
                placeholder="Ex: Sirène ne fonctionne plus"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <!-- Description -->
            <div>
              <label for="description" class="block text-sm font-semibold text-gray-900 mb-2">
                Description
              </label>
              <textarea
                id="description"
                v-model="declarationForm.description"
                rows="4"
                placeholder="Décrivez le problème rencontré..."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              ></textarea>
            </div>

            <!-- Priorité -->
            <div>
              <label for="priorite" class="block text-sm font-semibold text-gray-900 mb-2">
                Priorité estimée
              </label>
              <select
                id="priorite"
                v-model="declarationForm.priorite"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option :value="PrioritePanne.BASSE">Basse</option>
                <option :value="PrioritePanne.MOYENNE">Moyenne</option>
                <option :value="PrioritePanne.HAUTE">Haute</option>
                <option :value="PrioritePanne.URGENTE">Urgente</option>
              </select>
            </div>

            <!-- Error -->
            <div v-if="hasError" class="bg-red-50 border border-red-200 rounded-lg p-4">
              <p class="text-sm text-red-700">{{ error }}</p>
            </div>

            <!-- Actions -->
            <div class="flex gap-4 pt-4 border-t border-gray-200">
              <button
                type="submit"
                :disabled="isLoading"
                class="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {{ isLoading ? 'Déclaration en cours...' : 'Déclarer la panne' }}
              </button>
              <button
                type="button"
                @click="showDeclarationModal = false"
                class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
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
import { StatutPanne, PrioritePanne } from '@/types/api'
import sireneService from '@/services/sireneService'
import type { Sirene } from '@/services/sireneService'
import {
  AlertCircle,
  AlertTriangle,
  MapPin,
  Bell,
  Plus,
  X
} from 'lucide-vue-next'

const router = useRouter()

// Composable
const {
  pannes,
  pannesUrgentes,
  pannesNonResolues,
  isLoading,
  hasError,
  error,
  fetchAllPannes,
  fetchPannesByStatut,
  fetchPannesByPriorite,
  declarerPanne,
  validerPanne,
  cloturerPanne
} = usePannes()

// Local state
const filterStatus = ref<string>('all')
const filterPriorite = ref<string>('all')
const showDeclarationModal = ref(false)
const sirenes = ref<Sirene[]>([])

// Form state for declaration
const declarationForm = ref({
  sirene_id: '',
  titre: '',
  description: '',
  priorite: PrioritePanne.MOYENNE
})

// Computed
const displayedPannes = computed(() => {
  let result = pannes.value

  if (filterStatus.value !== 'all') {
    result = result.filter(p => p.statut === filterStatus.value)
  }

  if (filterPriorite.value !== 'all') {
    result = result.filter(p => p.priorite === filterPriorite.value)
  }

  return result
})

const statsCards = computed(() => [
  {
    label: 'Total',
    count: pannes.value.length,
    color: 'from-blue-500 to-blue-600'
  },
  {
    label: 'Déclarées',
    count: pannes.value.filter(p => p.statut === StatutPanne.DECLAREE).length,
    color: 'from-yellow-500 to-yellow-600'
  },
  {
    label: 'Validées',
    count: pannes.value.filter(p => p.statut === StatutPanne.VALIDEE).length,
    color: 'from-blue-500 to-blue-600'
  },
  {
    label: 'En cours',
    count: pannes.value.filter(p => p.statut === StatutPanne.EN_COURS).length,
    color: 'from-cyan-500 to-cyan-600'
  },
  {
    label: 'Résolues',
    count: pannes.value.filter(p => p.statut === StatutPanne.RESOLUE).length,
    color: 'from-green-500 to-green-600'
  }
])

// Methods
const getPriorityBgColor = (priorite: PrioritePanne | string) => {
  const colors: Record<string, string> = {
    [PrioritePanne.BASSE]: 'bg-gray-100',
    [PrioritePanne.MOYENNE]: 'bg-blue-100',
    [PrioritePanne.HAUTE]: 'bg-orange-100',
    [PrioritePanne.URGENTE]: 'bg-red-100'
  }
  return colors[priorite] || 'bg-gray-100'
}

const getPriorityTextColor = (priorite: PrioritePanne | string) => {
  const colors: Record<string, string> = {
    [PrioritePanne.BASSE]: 'text-gray-600',
    [PrioritePanne.MOYENNE]: 'text-blue-600',
    [PrioritePanne.HAUTE]: 'text-orange-600',
    [PrioritePanne.URGENTE]: 'text-red-600'
  }
  return colors[priorite] || 'text-gray-600'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

const handleFilterChange = async () => {
  if (filterStatus.value !== 'all' && filterPriorite.value === 'all') {
    await fetchPannesByStatut(filterStatus.value)
  } else if (filterPriorite.value !== 'all' && filterStatus.value === 'all') {
    await fetchPannesByPriorite(filterPriorite.value)
  } else if (filterStatus.value === 'all' && filterPriorite.value === 'all') {
    await fetchAllPannes()
  }
  // Si les deux filtres sont actifs, on utilise le computed displayedPannes
}

const showUrgentOnly = async () => {
  filterPriorite.value = PrioritePanne.URGENTE
  filterStatus.value = 'all'
  await fetchPannesByPriorite(PrioritePanne.URGENTE)
}

const resetFilters = async () => {
  filterStatus.value = 'all'
  filterPriorite.value = 'all'
  await fetchAllPannes()
}

const handleValider = async (panneId: string) => {
  // Simple validation - in real app, would open a modal for more details
  const nombreTechniciens = prompt('Nombre de techniciens requis:', '1')
  const dateDebut = prompt('Date début candidature (YYYY-MM-DD):')
  const dateFin = prompt('Date fin candidature (YYYY-MM-DD):')
  const commentaire = prompt('Commentaire (optionnel):')

  if (nombreTechniciens) {
    await validerPanne(panneId, {
      nombre_techniciens_requis: parseInt(nombreTechniciens),
      date_debut_candidature: dateDebut || undefined,
      date_fin_candidature: dateFin || undefined,
      commentaire: commentaire || undefined
    })
    await fetchAllPannes()
  }
}

const handleCloturer = async (panneId: string) => {
  if (confirm('Êtes-vous sûr de vouloir clôturer cette panne ?')) {
    await cloturerPanne(panneId)
    await fetchAllPannes()
  }
}

const handleDeclarer = async () => {
  if (!declarationForm.value.sirene_id || !declarationForm.value.titre) {
    alert('Veuillez remplir tous les champs obligatoires')
    return
  }

  await declarerPanne(declarationForm.value.sirene_id, {
    titre: declarationForm.value.titre,
    description: declarationForm.value.description,
    priorite: declarationForm.value.priorite
  })

  // Reset form and close modal
  declarationForm.value = {
    sirene_id: '',
    titre: '',
    description: '',
    priorite: PrioritePanne.MOYENNE
  }
  showDeclarationModal.value = false

  // Refresh list
  await fetchAllPannes()
}

// Lifecycle
onMounted(async () => {
  await fetchAllPannes()

  // Charger les sirènes pour le formulaire de déclaration
  try {
    const response = await sireneService.getAllSirenes()
    if (response.success && response.data) {
      sirenes.value = response.data
    }
  } catch (err) {
    console.error('Erreur lors du chargement des sirènes:', err)
  }
})
</script>
