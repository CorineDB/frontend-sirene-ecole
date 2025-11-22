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
          class="bg-white rounded-xl border border-gray-200 hover:shadow-xl transition-all overflow-hidden flex flex-col"
        >
          <!-- SECTION HEADER: Informations générales -->
          <div class="bg-gradient-to-r from-purple-500 to-purple-600 p-4">
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <h3 class="text-lg font-bold text-white mb-1">
                  {{ prog.nom_programmation }}
                </h3>
                <p v-if="prog.calendrier" class="text-xs text-purple-100 mb-2">
                  Année scolaire {{ prog.calendrier.nom }}
                </p>
                <div v-if="prog.sirene" class="text-xs text-purple-100 space-y-0.5">
                  <div class="flex items-center gap-1">
                    <Bell :size="12" />
                    <span>{{ prog.sirene.numero_serie }}</span>
                  </div>
                  <div v-if="prog.sirene.modele_sirene" class="opacity-90">
                    {{ prog.sirene.modele_sirene.nom }}
                  </div>
                </div>
              </div>
              <div class="flex flex-col items-end gap-2">
                <span
                  :class="prog.actif ? 'bg-green-400 text-green-900' : 'bg-gray-300 text-gray-700'"
                  class="text-xs px-2 py-1 rounded-full font-semibold"
                >
                  {{ prog.actif ? 'Active' : 'Inactive' }}
                </span>
                <div v-if="getDureeSonnerie(prog)" class="text-xs bg-white bg-opacity-20 px-2 py-1 rounded text-white font-medium">
                  {{ getDureeSonnerie(prog) }}s
                </div>
              </div>
            </div>
          </div>

          <!-- SECTION CONTENT -->
          <div class="p-4 space-y-4 flex-1">
            <!-- Sous-Section Horaires -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <div class="w-1 h-4 bg-blue-500 rounded"></div>
                  <span class="text-sm font-bold text-gray-700">Horaires de sonnerie</span>
                </div>
                <button
                  v-if="prog.chaine_cryptee"
                  @click="copierChaineCryptee(prog.chaine_cryptee)"
                  class="flex items-center gap-1 px-2 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
                  title="Copier la chaîne cryptée"
                >
                  <Copy :size="12" />
                  Copier
                </button>
              </div>
              <div class="space-y-2">
                <!-- Afficher 3 premiers horaires ou tous si expanded -->
                <div
                  v-for="(horaire, idx) in expandedHoraires.has(prog.id) ? prog.horaires_sonneries : prog.horaires_sonneries.slice(0, 3)"
                  :key="idx"
                  class="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-100"
                >
                  <div class="flex items-center gap-2">
                    <Clock :size="14" class="text-blue-500" />
                    <span class="text-blue-700 font-bold font-mono text-sm">
                      {{ formatHoraire(horaire) }}
                    </span>
                  </div>
                  <div class="flex gap-1 flex-wrap">
                    <span
                      v-for="jourNum in horaire.jours"
                      :key="jourNum"
                      class="px-1.5 py-0.5 bg-blue-200 text-blue-800 rounded text-xs font-semibold"
                    >
                      {{ getJourLabel(jourNum) }}
                    </span>
                  </div>
                </div>
                <!-- Bouton Voir +/- -->
                <button
                  v-if="prog.horaires_sonneries.length > 3"
                  @click="toggleExpandHoraires(prog.id)"
                  class="w-full py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors flex items-center justify-center gap-1"
                >
                  <component :is="expandedHoraires.has(prog.id) ? ChevronUp : ChevronDown" :size="14" />
                  {{ expandedHoraires.has(prog.id) ? 'Voir moins' : `Voir ${prog.horaires_sonneries.length - 3} de plus` }}
                </button>
              </div>
            </div>

            <!-- Sous-Section Exceptions -->
            <div>
              <div class="flex items-center gap-2 mb-2">
                <div class="w-1 h-4 bg-amber-500 rounded"></div>
                <span class="text-sm font-bold text-gray-700">Exceptions</span>
              </div>
              <div class="space-y-2">
                <!-- Jours fériés inclus/exclus -->
                <div class="flex items-center gap-2">
                  <Star :size="14" class="text-amber-500" />
                  <span class="text-xs text-gray-700">
                    Jours fériés:
                    <span :class="prog.jours_feries_inclus ? 'text-green-600 font-semibold' : 'text-gray-600 font-semibold'">
                      {{ prog.jours_feries_inclus ? 'Inclus' : 'Exclus' }}
                    </span>
                  </span>
                </div>
                <!-- Liste exceptions spécifiques -->
                <div v-if="prog.jours_feries_exceptions && prog.jours_feries_exceptions.length > 0" class="bg-amber-50 rounded-lg border border-amber-200 p-2">
                  <div class="text-xs font-semibold text-amber-800 mb-1">
                    {{ prog.jours_feries_exceptions.length }} exception(s) spécifique(s):
                  </div>
                  <div class="space-y-1">
                    <div
                      v-for="(exception, idx) in prog.jours_feries_exceptions.slice(0, 3)"
                      :key="idx"
                      class="flex items-center justify-between text-xs"
                    >
                      <span class="text-amber-700">{{ formatDate(exception.date) }}</span>
                      <span
                        :class="exception.action === 'include' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                        class="px-2 py-0.5 rounded text-xs font-medium"
                      >
                        {{ exception.action === 'include' ? 'Inclure' : 'Exclure' }}
                      </span>
                    </div>
                    <div v-if="prog.jours_feries_exceptions.length > 3" class="text-xs text-amber-600 italic">
                      +{{ prog.jours_feries_exceptions.length - 3 }} autre(s)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- SECTION ACTIONS: Validation -->
          <div class="px-4 py-3 bg-gray-50 border-t border-gray-200 space-y-3">
            <!-- Prévisualisation chaîne programmée -->
            <div v-if="prog.chaine_programmee" class="bg-indigo-50 rounded-lg p-2 border border-indigo-200">
              <div class="flex items-center justify-between gap-2 mb-1">
                <div class="flex items-center gap-2">
                  <Key :size="12" class="text-indigo-500" />
                  <span class="text-xs font-semibold text-indigo-700">Chaîne programmée:</span>
                </div>
                <button
                  @click="previewChaineId = prog.id"
                  class="flex items-center gap-1 px-2 py-0.5 text-xs text-indigo-600 hover:bg-indigo-100 rounded transition-colors"
                  title="Voir la chaîne complète"
                >
                  <Eye :size="12" />
                  Voir
                </button>
              </div>
              <p class="text-xs text-indigo-600 font-mono truncate">
                {{ prog.chaine_programmee }}
              </p>
            </div>

            <!-- Actions buttons -->
            <div class="flex items-center justify-between gap-2">
              <Can permission="manage_sirens">
                <div class="flex items-center gap-2 flex-1">
                  <button
                    @click="openEditModal(prog)"
                    class="px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1 font-medium"
                  >
                    <Edit :size="14" />
                    Modifier
                  </button>
                  <button
                    @click="genererEtEnvoyer(prog)"
                    class="px-3 py-1.5 text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-1 font-medium"
                    title="Générer et envoyer à la sirène"
                  >
                    <Send :size="14" />
                    Envoyer
                  </button>
                </div>

                <!-- Dropdown menu (three vertical dots) -->
                <div class="relative">
                  <button
                    @click="toggleDropdown(prog.id)"
                    class="p-1.5 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Plus d'actions"
                  >
                    <MoreVertical :size="18" />
                  </button>

                  <!-- Dropdown content -->
                  <div
                    v-if="openDropdownId === prog.id"
                    class="absolute right-0 bottom-full mb-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[160px]"
                  >
                    <button
                      @click="toggleActif(prog); toggleDropdown(prog.id)"
                      class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 transition-colors"
                      :class="prog.actif ? 'text-gray-700' : 'text-green-600'"
                    >
                      <Power :size="14" />
                      {{ prog.actif ? 'Désactiver' : 'Activer' }}
                    </button>
                    <button
                      @click="confirmDelete(prog); toggleDropdown(prog.id)"
                      class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      <Trash :size="14" />
                      Supprimer
                    </button>
                  </div>
                </div>
              </Can>
            </div>
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

    <!-- Modal de prévisualisation de la chaîne programmée -->
    <div
      v-if="previewChaineId"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="previewChaineId = null"
    >
      <div class="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="bg-gradient-to-r from-indigo-500 to-indigo-600 p-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur">
              <Key :size="20" class="text-white" />
            </div>
            <div>
              <h3 class="text-lg font-bold text-white">Chaîne programmée</h3>
              <p class="text-xs text-indigo-100">
                {{ programmations.find(p => p.id === previewChaineId)?.nom_programmation }}
              </p>
            </div>
          </div>
          <button
            @click="previewChaineId = null"
            class="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X :size="20" class="text-white" />
          </button>
        </div>

        <!-- Content -->
        <div class="p-6 overflow-y-auto flex-1">
          <div class="space-y-4">
            <!-- Chaîne programmée -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="text-sm font-semibold text-gray-700">Chaîne programmée</label>
                <button
                  @click="copierChaineCryptee(programmations.find(p => p.id === previewChaineId)?.chaine_programmee || '')"
                  class="flex items-center gap-1 px-3 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
                >
                  <Copy :size="12" />
                  Copier
                </button>
              </div>
              <div class="bg-gray-50 rounded-lg border border-gray-200 p-4">
                <pre class="text-xs text-gray-700 font-mono whitespace-pre-wrap break-all">{{ programmations.find(p => p.id === previewChaineId)?.chaine_programmee }}</pre>
              </div>
            </div>

            <!-- Chaîne cryptée -->
            <div v-if="programmations.find(p => p.id === previewChaineId)?.chaine_cryptee">
              <div class="flex items-center justify-between mb-2">
                <label class="text-sm font-semibold text-gray-700">Chaîne cryptée ESP8266</label>
                <button
                  @click="copierChaineCryptee(programmations.find(p => p.id === previewChaineId)?.chaine_cryptee || '')"
                  class="flex items-center gap-1 px-3 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
                >
                  <Copy :size="12" />
                  Copier
                </button>
              </div>
              <div class="bg-gray-50 rounded-lg border border-gray-200 p-4">
                <pre class="text-xs text-gray-700 font-mono whitespace-pre-wrap break-all">{{ programmations.find(p => p.id === previewChaineId)?.chaine_cryptee }}</pre>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            @click="previewChaineId = null"
            class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DashboardLayout from '../components/layout/DashboardLayout.vue'
import ProgrammationFormModal from '../components/sirens/ProgrammationFormModal.vue'
import { Clock, Calendar, Plus, Edit, Trash, Power, Bell, Key, Star, Building2, MapPin, Copy, MoreVertical, ChevronDown, ChevronUp, Send, Eye, X } from 'lucide-vue-next'
import { Can } from '@/components/permissions'
import { useAsyncAction } from '@/composables/useAsyncAction'
import { useNotificationStore } from '@/stores/notifications'
import programmationService from '@/services/programmationService'
import sirenService from '@/services/sirenService'
import type { ApiProgrammation, ApiSiren, HoraireSonnerie } from '@/types/api'

const { loading, execute } = useAsyncAction()
const notificationStore = useNotificationStore()

const sirenes = ref<ApiSiren[]>([])
const selectedSireneId = ref<string>('')
const programmations = ref<ApiProgrammation[]>([])
const isModalOpen = ref(false)
const selectedProgrammation = ref<ApiProgrammation | null>(null)
const expandedHoraires = ref<Set<string>>(new Set())
const openDropdownId = ref<string | null>(null)
const previewChaineId = ref<string | null>(null)

// Mapping des jours (0=Dimanche, 1=Lundi, ..., 6=Samedi)
const joursMapping: Record<number, string> = {
  0: 'Dim',
  1: 'Lun',
  2: 'Mar',
  3: 'Mer',
  4: 'Jeu',
  5: 'Ven',
  6: 'Sam',
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

  if (result?.success && result.data) {
    // L'API peut retourner soit un tableau direct, soit un objet avec programmations/data
    if (Array.isArray(result.data)) {
      programmations.value = result.data
    } else if (result.data.programmations) {
      programmations.value = result.data.programmations
    } else if (result.data.data) {
      programmations.value = result.data.data
    }
  }
}

/**
 * Obtenir le libellé d'un jour depuis son numéro
 */
const getJourLabel = (jourNum: number): string => {
  return joursMapping[jourNum] || String(jourNum)
}

/**
 * Formater un horaire (heure:minute)
 */
const formatHoraire = (horaire: HoraireSonnerie): string => {
  return `${String(horaire.heure).padStart(2, '0')}:${String(horaire.minute).padStart(2, '0')}`
}

/**
 * Formater une date YYYY-MM-DD en DD/MM/YYYY
 */
const formatDate = (date: string): string => {
  if (!date) return 'N/A'
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
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
      `Êtes-vous sûr de vouloir supprimer la programmation "${prog.nom_programmation}" ?\n\nCette action est irréversible.`
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

/**
 * Copier la chaîne cryptée dans le presse-papier
 */
const copierChaineCryptee = async (chaine: string) => {
  try {
    await navigator.clipboard.writeText(chaine)
    notificationStore.success('Chaîne cryptée copiée dans le presse-papier')
  } catch (err) {
    notificationStore.error('Erreur lors de la copie')
  }
}

/**
 * Toggle l'expansion des horaires
 */
const toggleExpandHoraires = (progId: string) => {
  if (expandedHoraires.value.has(progId)) {
    expandedHoraires.value.delete(progId)
  } else {
    expandedHoraires.value.add(progId)
  }
  // Force reactivity
  expandedHoraires.value = new Set(expandedHoraires.value)
}

/**
 * Toggle dropdown menu
 */
const toggleDropdown = (progId: string) => {
  openDropdownId.value = openDropdownId.value === progId ? null : progId
}

/**
 * Générer et envoyer la chaîne cryptée à la sirène
 */
const genererEtEnvoyer = async (prog: ApiProgrammation) => {
  if (!confirm(
    `Voulez-vous générer une nouvelle chaîne cryptée et l'envoyer à la sirène ?\n\nCela mettra à jour la programmation "${prog.nom_programmation}".`
  )) {
    return
  }

  // D'abord générer la chaîne
  const genererResult = await execute(
    () => programmationService.genererChaineCryptee(selectedSireneId.value, prog.id),
    {
      errorMessage: 'Impossible de générer la chaîne cryptée',
      showNotification: false,
    }
  )

  if (!genererResult?.success) {
    notificationStore.error('Échec de la génération de la chaîne cryptée')
    return
  }

  // Ensuite envoyer à la sirène
  const envoyerResult = await execute(
    () => programmationService.envoyerSirene(selectedSireneId.value, prog.id),
    {
      errorMessage: 'Impossible d\'envoyer à la sirène',
      showNotification: false,
    }
  )

  if (envoyerResult?.success) {
    notificationStore.success('Chaîne cryptée générée et envoyée à la sirène avec succès')
    loadProgrammations()
  } else {
    notificationStore.error('La chaîne a été générée mais l\'envoi a échoué')
    loadProgrammations()
  }
}

/**
 * Obtenir la sirène sélectionnée
 */
const getSelectedSirene = () => {
  return sirenes.value.find(s => s.id === selectedSireneId.value)
}

/**
 * Obtenir la durée de sonnerie commune (si toutes identiques)
 */
const getDureeSonnerie = (prog: ApiProgrammation): number | null => {
  if (!prog.horaires_sonneries || prog.horaires_sonneries.length === 0) {
    return null
  }

  const durees = prog.horaires_sonneries.map(h => h.duree_sonnerie).filter(d => d !== undefined && d !== null)
  if (durees.length === 0) return null

  // Si toutes les durées sont identiques
  const firstDuree = durees[0]
  if (durees.every(d => d === firstDuree)) {
    return firstDuree as number
  }

  return null
}

// Charger les sirènes au montage
onMounted(() => {
  loadSirenes()
})
</script>
