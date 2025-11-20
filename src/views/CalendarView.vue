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
                Calendrier Scolaire National
              </h1>
              <p class="text-gray-600 mt-1">Gérez les périodes de vacances et jours fériés</p>
            </div>
          </div>

          <!-- Filtres -->
          <div class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Année scolaire -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Année scolaire</label>
                <select
                  v-model="selectedCalendrierId"
                  @change="loadCalendrierData"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner une année</option>
                  <option v-for="cal in calendriers" :key="cal.id" :value="cal.id">
                    {{ cal.annee_scolaire }}
                  </option>
                </select>
              </div>

              <!-- École (optionnel, pour jours fériés spécifiques) -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  École <span class="text-xs text-gray-500">(optionnel, pour jours fériés spécifiques)</span>
                </label>
                <select
                  v-model="selectedEcoleId"
                  @change="loadJoursFeries"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Toutes les écoles</option>
                  <option v-for="ecole in ecoles" :key="ecole.id" :value="ecole.id">
                    {{ ecole.nom_complet }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex items-center justify-center h-64">
          <div class="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>

        <!-- No calendar selected -->
        <div v-else-if="!selectedCalendrierId" class="bg-white rounded-xl p-12 text-center border border-gray-200">
          <Calendar :size="64" class="text-gray-300 mx-auto mb-4" />
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Sélectionnez une année scolaire</h3>
          <p class="text-gray-600">Choisissez une année pour voir le calendrier national</p>
        </div>

        <!-- Calendrier content -->
        <div v-else>
          <!-- Stats -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600 mb-1">Année scolaire</p>
                  <p class="text-xl font-bold text-gray-900">{{ currentCalendrier?.annee_scolaire }}</p>
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
                  <p class="text-sm text-gray-600 mb-1">Jours d'école</p>
                  <p class="text-3xl font-bold text-gray-900">{{ schoolDays }}</p>
                </div>
                <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <School :size="24" class="text-indigo-600" />
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

          <!-- Périodes de vacances -->
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
            <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 class="text-lg font-semibold text-gray-900">Périodes de vacances nationales</h2>
            </div>

            <div v-if="periodes.length === 0" class="p-12 text-center">
              <Palmtree :size="64" class="text-gray-300 mx-auto mb-4" />
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Aucune période</h3>
              <p class="text-gray-600">Aucune période de vacances définie pour cette année scolaire</p>
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
                </div>
              </div>
            </div>
          </div>

          <!-- Jours Fériés Section -->
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div>
                <h2 class="text-lg font-semibold text-gray-900">Jours Fériés</h2>
                <p class="text-xs text-gray-600 mt-0.5">
                  {{ selectedEcoleId ? 'Nationaux + spécifiques à l\'école sélectionnée' : 'Nationaux uniquement' }}
                </p>
              </div>
            </div>

            <div v-if="joursFeries.length === 0" class="p-12 text-center">
              <Calendar :size="64" class="text-gray-300 mx-auto mb-4" />
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Aucun jour férié</h3>
              <p class="text-gray-600">Aucun jour férié défini pour cette année scolaire</p>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              <div
                v-for="jourFerie in joursFeriesSorted"
                :key="jourFerie.id"
                class="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-sm transition-all"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <h3 class="font-bold text-gray-900">{{ jourFerie.intitule_journee }}</h3>
                      <span
                        :class="getJourFerieTypeClass(jourFerie)"
                        class="text-xs px-2 py-0.5 rounded-full font-semibold"
                      >
                        {{ getJourFerieTypeLabel(jourFerie) }}
                      </span>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar :size="14" class="text-gray-400" />
                      <span>{{ formatDate(jourFerie.date) }}</span>
                    </div>
                    <div v-if="jourFerie.recurrent" class="mt-1">
                      <span class="text-xs text-purple-600 flex items-center gap-1">
                        <Clock :size="12" />
                        Récurrent
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import DashboardLayout from '../components/layout/DashboardLayout.vue'
import {
  Calendar, CalendarDays, Clock, Palmtree, School
} from 'lucide-vue-next'
import calendrierScolaireService, { type CalendrierScolaire, type PeriodeVacances, type JourFerie } from '../services/calendrierScolaireService'
import ecoleService, { type Ecole } from '../services/ecoleService'
import { useNotificationStore } from '../stores/notifications'

const notificationStore = useNotificationStore()

const calendriers = ref<CalendrierScolaire[]>([])
const ecoles = ref<Ecole[]>([])
const periodes = ref<PeriodeVacances[]>([])
const joursFeries = ref<JourFerie[]>([])
const selectedCalendrierId = ref<string>('')
const selectedEcoleId = ref<string>('')
const currentCalendrier = ref<CalendrierScolaire | null>(null)
const schoolDays = ref<number>(0)
const loading = ref(false)

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

// Jours Fériés functions
const joursFeriesSorted = computed(() => {
  // Filter only active jours fériés and sort by date
  return [...joursFeries.value]
    .filter(jf => jf.actif)
    .sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    })
})

const getJourFerieTypeLabel = (jourFerie: JourFerie) => {
  if (jourFerie.est_national) return 'National'
  if (jourFerie.ecole_id) return 'École'
  return 'Défaut'
}

const getJourFerieTypeClass = (jourFerie: JourFerie) => {
  if (jourFerie.est_national) return 'bg-blue-100 text-blue-700'
  if (jourFerie.ecole_id) return 'bg-purple-100 text-purple-700'
  return 'bg-gray-100 text-gray-700'
}

const loadCalendriers = async () => {
  try {
    const response = await calendrierScolaireService.getAll(100)
    if (response.success && response.data) {
      calendriers.value = response.data

      // Auto-select current year
      const currentYearResponse = await calendrierScolaireService.getCurrentYear()
      if (currentYearResponse.success && currentYearResponse.data) {
        selectedCalendrierId.value = currentYearResponse.data.id
        await loadCalendrierData()
      }
    }
  } catch (error: any) {
    console.error('Failed to load calendriers:', error)
    notificationStore.error('Erreur', 'Impossible de charger les calendriers scolaires')
  }
}

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

const loadCalendrierData = async () => {
  if (!selectedCalendrierId.value) return

  loading.value = true
  try {
    // Load calendrier details
    const calendrierResponse = await calendrierScolaireService.getById(selectedCalendrierId.value)
    if (calendrierResponse.success && calendrierResponse.data) {
      currentCalendrier.value = calendrierResponse.data

      // Load periodes from calendrier
      periodes.value = calendrierResponse.data.periodes_vacances || []

      // Load jours fériés défaut (nationaux) from calendrier
      joursFeries.value = calendrierResponse.data.jours_feries_defaut || []
    }

    // If école is selected, load école-specific jours fériés
    if (selectedEcoleId.value) {
      await loadJoursFeriesEcole()
    }

    // Calculate school days
    await calculateSchoolDays()
  } catch (error: any) {
    console.error('Failed to load calendrier data:', error)
    notificationStore.error('Erreur', 'Impossible de charger les données du calendrier')
  } finally {
    loading.value = false
  }
}

const loadJoursFeriesEcole = async () => {
  if (!selectedCalendrierId.value || !selectedEcoleId.value) return

  try {
    // Load école-specific jours fériés and merge with national ones
    const response = await calendrierScolaireService.getJoursFeries(selectedCalendrierId.value)
    if (response.success && response.data) {
      // Combine national jours fériés (from calendrier) with école-specific ones
      const joursFeriesNationaux = currentCalendrier.value?.jours_feries_defaut || []
      const joursFeriesEcole = response.data.filter(jf => jf.ecole_id === selectedEcoleId.value)

      joursFeries.value = [...joursFeriesNationaux, ...joursFeriesEcole]
    }
  } catch (error: any) {
    console.error('Failed to load jours feries ecole:', error)
    // Keep only national jours fériés on error
    joursFeries.value = currentCalendrier.value?.jours_feries_defaut || []
  }
}

const loadJoursFeries = async () => {
  if (!selectedEcoleId.value) {
    // No école selected, show only national jours fériés
    joursFeries.value = currentCalendrier.value?.jours_feries_defaut || []
  } else {
    // École selected, load and merge école-specific jours fériés
    await loadJoursFeriesEcole()
  }

  // Recalculate school days when jours fériés change
  await calculateSchoolDays()
}

const calculateSchoolDays = async () => {
  if (!selectedCalendrierId.value) return

  try {
    const response = await calendrierScolaireService.calculateSchoolDays(
      selectedCalendrierId.value,
      selectedEcoleId.value || undefined
    )
    if (response.success && response.data) {
      schoolDays.value = response.data.school_days
    }
  } catch (error: any) {
    console.error('Failed to calculate school days:', error)
    schoolDays.value = 0
  }
}

onMounted(() => {
  loadCalendriers()
  loadEcoles()
})
</script>
