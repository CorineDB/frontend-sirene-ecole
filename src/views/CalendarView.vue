<template>
  <DashboardLayout>
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Calendar :size="32" class="text-blue-600" />
                Calendrier Scolaire
              </h1>
              <p class="text-gray-600 mt-1">Gérez les périodes de vacances et jours fériés</p>
            </div>
            <button
              @click="openCreateModal"
              class="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2 shadow-lg"
            >
              <Plus :size="20" />
              Nouvelle période
            </button>
          </div>

          <!-- École sélecteur -->
          <div class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <label class="block text-sm font-semibold text-gray-700 mb-2">École</label>
            <select
              v-model="selectedEcoleId"
              @change="loadPeriodes"
              class="w-full md:w-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sélectionner une école</option>
              <option v-for="ecole in ecoles" :key="ecole.id" :value="ecole.id">
                {{ ecole.nom_complet }}
              </option>
            </select>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex items-center justify-center h-64">
          <div class="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>

        <!-- No school selected -->
        <div v-else-if="!selectedEcoleId" class="bg-white rounded-xl p-12 text-center border border-gray-200">
          <School :size="64" class="text-gray-300 mx-auto mb-4" />
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Sélectionnez une école</h3>
          <p class="text-gray-600">Choisissez une école pour voir son calendrier</p>
        </div>

        <!-- Périodes de vacances -->
        <div v-else>
          <!-- Stats -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600 mb-1">Total périodes</p>
                  <p class="text-3xl font-bold text-gray-900">{{ periodes.length }}</p>
                </div>
                <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Calendar :size="24" class="text-blue-600" />
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600 mb-1">Jours de vacances</p>
                  <p class="text-3xl font-bold text-gray-900">{{ totalJoursVacances }}</p>
                </div>
                <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Palmtree :size="24" class="text-green-600" />
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600 mb-1">Prochaine vacances</p>
                  <p class="text-lg font-bold text-gray-900">{{ prochainePeriode?.nom || 'Aucune' }}</p>
                  <p v-if="prochainePeriode" class="text-xs text-gray-500">{{ formatDate(prochainePeriode.date_debut) }}</p>
                </div>
                <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Clock :size="24" class="text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          <!-- Liste des périodes -->
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 class="text-lg font-semibold text-gray-900">Périodes de vacances</h2>
            </div>

            <div v-if="periodes.length === 0" class="p-12 text-center">
              <Palmtree :size="64" class="text-gray-300 mx-auto mb-4" />
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Aucune période</h3>
              <p class="text-gray-600 mb-4">Ajoutez votre première période de vacances</p>
              <button
                @click="openCreateModal"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Créer une période
              </button>
            </div>

            <div v-else class="divide-y divide-gray-200">
              <div
                v-for="periode in periodesSorted"
                :key="periode.id"
                class="p-6 hover:bg-gray-50 transition-colors"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <h3 class="text-lg font-bold text-gray-900">{{ periode.nom }}</h3>
                      <span
                        :class="getPeriodeStatusClass(periode)"
                        class="text-xs px-2 py-1 rounded-full font-semibold"
                      >
                        {{ getPeriodeStatus(periode) }}
                      </span>
                    </div>
                    <div class="flex items-center gap-4 text-sm text-gray-600">
                      <div class="flex items-center gap-2">
                        <CalendarDays :size="16" class="text-gray-400" />
                        <span>{{ formatDate(periode.date_debut) }} → {{ formatDate(periode.date_fin) }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <Clock :size="16" class="text-gray-400" />
                        <span>{{ calculerDuree(periode) }} jours</span>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center gap-2">
                    <button
                      @click="openEditModal(periode)"
                      class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit :size="20" />
                    </button>
                    <button
                      @click="confirmDelete(periode)"
                      class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 :size="20" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Calendrier Form Modal -->
        <CalendrierFormModal
          :is-open="formModalOpen"
          :ecole-id="selectedEcoleId"
          :periode="selectedPeriode"
          @close="closeFormModal"
          @created="handlePeriodeCreated"
          @updated="handlePeriodeUpdated"
        />
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import DashboardLayout from '../components/layout/DashboardLayout.vue'
import CalendrierFormModal from '../components/calendrier/CalendrierFormModal.vue'
import {
  Calendar, CalendarDays, Plus, Edit, Trash2, Clock, Palmtree, School
} from 'lucide-vue-next'
import calendrierService, { type PeriodeVacances } from '../services/calendrierService'
import ecoleService, { type Ecole } from '../services/ecoleService'
import { useNotificationStore } from '../stores/notifications'

const notificationStore = useNotificationStore()

const ecoles = ref<Ecole[]>([])
const periodes = ref<PeriodeVacances[]>([])
const selectedEcoleId = ref<string>('')
const loading = ref(false)
const formModalOpen = ref(false)
const selectedPeriode = ref<PeriodeVacances | null>(null)

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const calculerDuree = (periode: PeriodeVacances) => {
  const debut = new Date(periode.date_debut)
  const fin = new Date(periode.date_fin)
  const diffTime = Math.abs(fin.getTime() - debut.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays + 1
}

const getPeriodeStatus = (periode: PeriodeVacances) => {
  const now = new Date()
  const debut = new Date(periode.date_debut)
  const fin = new Date(periode.date_fin)

  if (now < debut) return 'À venir'
  if (now > fin) return 'Passée'
  return 'En cours'
}

const getPeriodeStatusClass = (periode: PeriodeVacances) => {
  const status = getPeriodeStatus(periode)
  if (status === 'À venir') return 'bg-blue-100 text-blue-700'
  if (status === 'En cours') return 'bg-green-100 text-green-700'
  return 'bg-gray-100 text-gray-700'
}

const periodesSorted = computed(() => {
  return [...periodes.value].sort((a, b) => {
    return new Date(a.date_debut).getTime() - new Date(b.date_debut).getTime()
  })
})

const totalJoursVacances = computed(() => {
  return periodes.value.reduce((total, periode) => {
    return total + calculerDuree(periode)
  }, 0)
})

const prochainePeriode = computed(() => {
  const now = new Date()
  return periodes.value
    .filter(p => new Date(p.date_debut) > now)
    .sort((a, b) => new Date(a.date_debut).getTime() - new Date(b.date_debut).getTime())[0]
})

const loadEcoles = async () => {
  try {
    const response = await ecoleService.getAll(100)
    if (response.success && response.data?.data) {
      ecoles.value = response.data.data
    }
  } catch (error: any) {
    console.error('Failed to load ecoles:', error)
    notificationStore.error('Erreur', 'Impossible de charger les écoles')
  }
}

const loadPeriodes = async () => {
  if (!selectedEcoleId.value) return

  loading.value = true
  try {
    const response = await calendrierService.getPeriodeVacances(selectedEcoleId.value)
    if (response.success && response.data) {
      periodes.value = response.data
    }
  } catch (error: any) {
    console.error('Failed to load periodes:', error)
    notificationStore.error('Erreur', 'Impossible de charger les périodes')
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  if (!selectedEcoleId.value) {
    notificationStore.warning('Attention', 'Veuillez sélectionner une école')
    return
  }
  selectedPeriode.value = null
  formModalOpen.value = true
}

const openEditModal = (periode: PeriodeVacances) => {
  selectedPeriode.value = periode
  formModalOpen.value = true
}

const closeFormModal = () => {
  formModalOpen.value = false
  selectedPeriode.value = null
}

const handlePeriodeCreated = (periode: PeriodeVacances) => {
  periodes.value.push(periode)
}

const handlePeriodeUpdated = (updatedPeriode: PeriodeVacances) => {
  const index = periodes.value.findIndex(p => p.id === updatedPeriode.id)
  if (index !== -1) {
    periodes.value[index] = updatedPeriode
  }
}

const confirmDelete = (periode: PeriodeVacances) => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer "${periode.nom}" ?`)) {
    deletePeriode(periode.id)
  }
}

const deletePeriode = async (id: string) => {
  try {
    const response = await calendrierService.deletePeriodeVacances(id)
    if (response.success) {
      periodes.value = periodes.value.filter(p => p.id !== id)
      notificationStore.success('Supprimé', 'La période a été supprimée avec succès')
    }
  } catch (error: any) {
    console.error('Failed to delete periode:', error)
    notificationStore.error('Erreur', 'Impossible de supprimer la période')
  }
}

onMounted(() => {
  loadEcoles()
})
</script>
