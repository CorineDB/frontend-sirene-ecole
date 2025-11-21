<template>
  <DashboardLayout>
    <div class="p-6 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Programmations</h1>
          <p class="text-gray-600 mt-1">Gérer les programmations des sirènes</p>
        </div>
      </div>

      <!-- Sirène Selection -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <label class="block text-sm font-semibold text-gray-700 mb-3">
          Sélectionner une sirène <span class="text-red-500">*</span>
        </label>
        <div class="flex items-center gap-4">
          <select
            v-model="selectedSireneId"
            class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @change="loadProgrammations"
          >
            <option value="">-- Choisir une sirène --</option>
            <option v-for="sirene in sirenes" :key="sirene.id" :value="sirene.id">
              {{ sirene.numero_serie }} - {{ sirene.modele_sirene?.nom || 'Modèle inconnu' }}
              {{ sirene.ecole ? `(${sirene.ecole.nom})` : '' }}
            </option>
          </select>
          <Can permission="manage_sirens">
            <button
              v-if="selectedSireneId"
              @click="openCreateModal"
              class="px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <Plus :size="20" />
              Nouvelle programmation
            </button>
          </Can>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center h-96">
        <div class="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>

      <!-- Programmations Grid -->
      <div
        v-if="!loading && selectedSireneId && programmations.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div
          v-for="prog in programmations"
          :key="prog.id"
          class="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all"
        >
          <!-- Header with status badge -->
          <div class="flex items-start justify-between mb-4">
            <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
              <Clock :size="24" class="text-white" />
            </div>
            <span
              :class="prog.actif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'"
              class="text-xs px-2 py-1 rounded-full font-semibold"
            >
              {{ prog.actif ? 'Active' : 'Inactive' }}
            </span>
          </div>

          <!-- Programmation Name -->
          <h3 class="text-lg font-bold text-gray-900 mb-1">
            {{ prog.nom }}
          </h3>

          <!-- Horaires -->
          <div class="space-y-2 text-sm mb-4">
            <div class="flex items-center gap-2 text-gray-600">
              <Clock :size="16" class="text-gray-400" />
              <span class="font-semibold">Horaires:</span>
            </div>
            <div class="pl-6 space-y-1">
              <div class="flex items-center gap-2 text-gray-700">
                <span class="text-blue-600 font-semibold">{{ prog.heure_debut }}</span>
                <span v-if="prog.heure_fin">→ {{ prog.heure_fin }}</span>
              </div>
            </div>
          </div>

          <!-- Jours actifs -->
          <div class="mb-4">
            <div class="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Calendar :size="16" class="text-gray-400" />
              <span class="font-semibold">Jours actifs:</span>
            </div>
            <div class="flex flex-wrap gap-2 pl-6">
              <span
                v-for="jour in joursActifs(prog)"
                :key="jour"
                class="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold"
              >
                {{ jour }}
              </span>
              <span v-if="!prog.jours_semaine || prog.jours_semaine.length === 0" class="text-xs text-gray-400">
                Tous les jours
              </span>
            </div>
          </div>

          <!-- Chaîne cryptée preview -->
          <div class="mt-4 p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center gap-2 text-xs text-gray-600 mb-1">
              <Key :size="14" class="text-gray-400" />
              <span class="font-semibold">Chaîne cryptée:</span>
            </div>
            <p class="text-xs text-gray-500 font-mono truncate">
              {{ generatePreviewChaine(prog) }}
            </p>
          </div>

          <!-- Actions -->
          <div class="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between gap-2">
            <Can permission="manage_sirens">
              <div class="flex items-center gap-2">
                <button
                  @click="openEditModal(prog)"
                  class="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                  title="Modifier"
                >
                  <Edit :size="14" />
                  Éditer
                </button>
                <button
                  @click="confirmDelete(prog)"
                  class="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                  title="Supprimer"
                >
                  <Trash :size="14" />
                  Supprimer
                </button>
              </div>
              <button
                @click="toggleActif(prog)"
                :class="prog.actif ? 'text-gray-600 hover:bg-gray-50' : 'text-green-600 hover:bg-green-50'"
                class="px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1"
                :title="prog.actif ? 'Désactiver' : 'Activer'"
              >
                <Power :size="14" />
                {{ prog.actif ? 'Désactiver' : 'Activer' }}
              </button>
            </Can>
          </div>
        </div>
      </div>

      <!-- Empty State - No Sirene Selected -->
      <div
        v-else-if="!loading && !selectedSireneId"
        class="bg-white rounded-xl p-12 text-center border border-gray-200"
      >
        <Bell :size="64" class="text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Sélectionnez une sirène</h3>
        <p class="text-gray-600">Choisissez une sirène dans la liste ci-dessus pour voir ses programmations</p>
      </div>

      <!-- Empty State - No Programmations -->
      <div
        v-else-if="!loading && selectedSireneId && programmations.length === 0"
        class="bg-white rounded-xl p-12 text-center border border-gray-200"
      >
        <Clock :size="64" class="text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Aucune programmation</h3>
        <p class="text-gray-600 mb-4">Cette sirène n'a pas encore de programmation</p>
        <Can permission="manage_sirens">
          <button
            @click="openCreateModal"
            class="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all inline-flex items-center gap-2"
          >
            <Plus :size="20" />
            Créer la première programmation
          </button>
        </Can>
      </div>
    </div>

    <!-- Programmation Form Modal -->
    <ProgrammationFormModal
      v-if="selectedSireneId"
      :is-open="isModalOpen"
      :sirene-id="selectedSireneId"
      :programmation="selectedProgrammation"
      @close="closeModal"
      @save="handleProgrammationSaved"
    />
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DashboardLayout from '../components/layout/DashboardLayout.vue'
import ProgrammationFormModal from '../components/sirens/ProgrammationFormModal.vue'
import { Clock, Calendar, Plus, Edit, Trash, Power, Bell, Key } from 'lucide-vue-next'
import { Can } from '@/components/permissions'
import { useAsyncAction } from '@/composables/useAsyncAction'
import { useNotificationStore } from '@/stores/notifications'
import programmationService from '@/services/programmationService'
import sirenService from '@/services/sirenService'
import type { ApiProgrammation, ApiSiren } from '@/types/api'

const { loading, execute } = useAsyncAction()
const notificationStore = useNotificationStore()

const sirenes = ref<ApiSiren[]>([])
const selectedSireneId = ref<string>('')
const programmations = ref<ApiProgrammation[]>([])
const isModalOpen = ref(false)
const selectedProgrammation = ref<ApiProgrammation | null>(null)

// Mapping des jours en français
const joursMapping: Record<string, string> = {
  lundi: 'Lun',
  mardi: 'Mar',
  mercredi: 'Mer',
  jeudi: 'Jeu',
  vendredi: 'Ven',
  samedi: 'Sam',
  dimanche: 'Dim',
}

/**
 * Charger toutes les sirènes disponibles
 */
const loadSirenes = async () => {
  const result = await execute(
    () => sirenService.getAllSirens({ per_page: 1000 }),
    { errorMessage: 'Impossible de charger les sirènes' }
  )

  if (result?.success && result.data?.data) {
    sirenes.value = result.data.data
  }
}

/**
 * Charger les programmations de la sirène sélectionnée
 */
const loadProgrammations = async () => {
  if (!selectedSireneId.value) {
    programmations.value = []
    return
  }

  const result = await execute(
    () => programmationService.getProgrammations(selectedSireneId.value),
    { errorMessage: 'Impossible de charger les programmations' }
  )

  if (result?.success && result.data?.programmations) {
    programmations.value = result.data.programmations
  }
}

/**
 * Obtenir les jours actifs formatés
 */
const joursActifs = (prog: ApiProgrammation): string[] => {
  if (!prog.jours_semaine || prog.jours_semaine.length === 0) {
    return []
  }
  return prog.jours_semaine.map((jour) => joursMapping[jour.toLowerCase()] || jour)
}

/**
 * Générer une prévisualisation de la chaîne cryptée
 */
const generatePreviewChaine = (prog: ApiProgrammation): string => {
  // Simulation simplifiée - À remplacer par la vraie logique
  const base = `${prog.nom}-${prog.heure_debut}-${prog.jours_semaine?.join(',') || 'all'}`
  const hash = btoa(base).substring(0, 32)
  return `${hash}...`
}

/**
 * Ouvrir le modal de création
 */
const openCreateModal = () => {
  selectedProgrammation.value = null
  isModalOpen.value = true
}

/**
 * Ouvrir le modal d'édition
 */
const openEditModal = (prog: ApiProgrammation) => {
  selectedProgrammation.value = prog
  isModalOpen.value = true
}

/**
 * Fermer le modal
 */
const closeModal = () => {
  isModalOpen.value = false
  selectedProgrammation.value = null
}

/**
 * Gérer la sauvegarde d'une programmation
 */
const handleProgrammationSaved = () => {
  loadProgrammations()
  closeModal()
}

/**
 * Activer/Désactiver une programmation
 */
const toggleActif = async (prog: ApiProgrammation) => {
  const result = await execute(
    () =>
      programmationService.toggleActif(selectedSireneId.value, prog.id, !prog.actif),
    {
      errorMessage: 'Impossible de modifier le statut',
      showNotification: false,
    }
  )

  if (result?.success) {
    notificationStore.success(
      prog.actif ? 'Programmation désactivée' : 'Programmation activée'
    )
    loadProgrammations()
  }
}

/**
 * Confirmer la suppression
 */
const confirmDelete = (prog: ApiProgrammation) => {
  if (
    !confirm(
      `Êtes-vous sûr de vouloir supprimer la programmation "${prog.nom}" ?\n\nCette action est irréversible.`
    )
  ) {
    return
  }

  deleteProgrammation(prog)
}

/**
 * Supprimer une programmation
 */
const deleteProgrammation = async (prog: ApiProgrammation) => {
  const result = await execute(
    () => programmationService.deleteProgrammation(selectedSireneId.value, prog.id),
    {
      errorMessage: 'Impossible de supprimer la programmation',
      showNotification: false,
    }
  )

  if (result?.success) {
    notificationStore.success('Programmation supprimée')
    loadProgrammations()
  }
}

// Charger les sirènes au montage
onMounted(() => {
  loadSirenes()
})
</script>
