<template>
  <DashboardLayout>
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Calendrier scolaire</h1>
          <p class="text-gray-600 mt-1">Gérer les périodes scolaires et jours fériés</p>
        </div>
      </div>

      <!-- Filtres -->
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Pays -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Pays</label>
            <select
              v-model="selectedPaysId"
              @change="onPaysChange"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sélectionner un pays</option>
              <option v-for="pays in paysList" :key="pays.id" :value="pays.id">
                {{ pays.nom }}
              </option>
            </select>
          </div>

          <!-- Année scolaire -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Année scolaire</label>
            <select
              v-model="selectedAnneeScolaire"
              @change="onAnneeScolaireChange"
              :disabled="!selectedPaysId"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Sélectionner une année</option>
              <option
                v-for="annee in annesScolairesDisponibles"
                :key="annee.annee"
                :value="annee.annee"
                :class="{ 'font-semibold': annee.hasCalendrier }"
              >
                {{ annee.annee }}{{ annee.hasCalendrier ? ' ✓' : '' }}
              </option>
            </select>
          </div>

          <!-- École -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              École <span class="text-xs text-gray-500">(optionnel, pour jours fériés spécifiques)</span>
            </label>
            <select
              v-model="selectedEcoleId"
              @change="onEcoleChange"
              :disabled="!selectedCalendrierId"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Toutes les écoles (calendrier national)</option>
              <option v-for="ecole in ecoles" :key="ecole.id" :value="ecole.id">
                {{ ecole.nom_complet }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center h-64">
        <div class="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>

      <!-- No calendar selected -->
      <div v-else-if="!selectedAnneeScolaire" class="bg-white rounded-xl p-12 text-center border border-gray-200">
        <Calendar :size="64" class="text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          {{ !selectedPaysId ? 'Sélectionnez un pays' : 'Sélectionnez une année scolaire' }}
        </h3>
        <p class="text-gray-600">
          {{ !selectedPaysId ? 'Choisissez un pays pour voir les calendriers disponibles' : 'Choisissez une année pour voir le calendrier national' }}
        </p>
      </div>

      <!-- No calendar data for selected year -->
      <div v-else-if="!selectedCalendrierId" class="bg-white rounded-xl p-12 text-center border border-gray-200">
        <Calendar :size="64" class="text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Aucun calendrier disponible</h3>
        <p class="text-gray-600 mb-4">
          Aucun calendrier n'existe pour l'année {{ selectedAnneeScolaire }}
        </p>
        <button
          @click="createCalendrier"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus :size="16" class="inline mr-2" />
          Créer un calendrier
        </button>
      </div>

      <!-- Calendrier principal -->
      <template v-else>
        <!-- Statistiques -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-white rounded-xl border border-gray-200 p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 mb-1">Année scolaire</p>
                <p class="text-xl font-bold text-gray-900">{{ currentCalendrier?.annee_scolaire }}</p>
              </div>
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar :size="20" class="text-blue-600" />
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl border border-gray-200 p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 mb-1">Périodes</p>
                <p class="text-2xl font-bold text-gray-900">{{ periodes.length }}</p>
              </div>
              <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <CalendarDays :size="20" class="text-purple-600" />
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl border border-gray-200 p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 mb-1">Jours d'école</p>
                <p class="text-2xl font-bold text-gray-900">{{ schoolDays }}</p>
              </div>
              <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <School :size="20" class="text-green-600" />
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl border border-gray-200 p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 mb-1">Jours fériés</p>
                <p class="text-2xl font-bold text-gray-900">{{ joursFeriesSorted.length }}</p>
              </div>
              <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Star :size="20" class="text-red-600" />
              </div>
            </div>
          </div>
        </div>

        <!-- Grille principale : Calendrier + Jours fériés -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Calendrier mensuel -->
          <div class="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-4">
              <button
                @click="previousMonth"
                class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft :size="20" class="text-gray-600" />
              </button>
              <h2 class="text-lg font-bold text-gray-900">
                {{ currentMonthName }} {{ currentYear }}
              </h2>
              <button
                @click="nextMonth"
                class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight :size="20" class="text-gray-600" />
              </button>
            </div>

            <!-- Grille du calendrier -->
            <div class="grid grid-cols-7 gap-2 text-center">
              <!-- En-têtes jours de la semaine -->
              <div
                v-for="day in weekDays"
                :key="day"
                class="font-semibold text-gray-600 py-2 text-sm"
              >
                {{ day }}
              </div>

              <!-- Jours du mois -->
              <div
                v-for="day in calendarDays"
                :key="day.key"
                :class="getDayClass(day)"
                class="aspect-square flex flex-col items-center justify-center rounded-lg cursor-pointer border transition-all"
              >
                <span class="text-sm font-medium">{{ day.number }}</span>
                <div v-if="day.isHoliday" class="w-1 h-1 bg-red-500 rounded-full mt-1"></div>
                <div v-if="day.isVacation" class="w-1 h-1 bg-blue-500 rounded-full mt-1"></div>
              </div>
            </div>

            <!-- Légende -->
            <div class="flex items-center gap-4 mt-4 text-xs text-gray-600">
              <div class="flex items-center gap-1">
                <div class="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                <span>Jour férié</span>
              </div>
              <div class="flex items-center gap-1">
                <div class="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                <span>Vacances</span>
              </div>
              <div class="flex items-center gap-1">
                <div class="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                <span>Aujourd'hui</span>
              </div>
            </div>
          </div>

          <!-- Jours fériés sidebar -->
          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Star :size="20" class="text-red-600" />
                Jours fériés
              </h2>
              <button
                @click="openAddJourFerieModal"
                class="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
              >
                <Plus :size="14" />
                Ajouter
              </button>
            </div>
            <div class="space-y-3 max-h-96 overflow-y-auto">
              <div
                v-for="jourFerie in joursFeriesSorted"
                :key="jourFerie.id"
                class="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1">
                    <p class="font-semibold text-gray-900 text-sm">{{ jourFerie.intitule_journee }}</p>
                    <p class="text-xs text-gray-600 mt-1">{{ formatDateShort(jourFerie.date) }}</p>
                  </div>
                  <span
                    :class="getJourFerieTypeClass(jourFerie)"
                    class="text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap"
                  >
                    {{ getJourFerieTypeLabel(jourFerie) }}
                  </span>
                </div>
                <div v-if="jourFerie.recurrent" class="mt-2">
                  <span class="text-xs text-purple-600 flex items-center gap-1">
                    <Clock :size="12" />
                    Récurrent
                  </span>
                </div>
              </div>
              <div v-if="joursFeriesSorted.length === 0" class="text-center py-8 text-gray-500 text-sm">
                Aucun jour férié
              </div>
            </div>
          </div>
        </div>

        <!-- Périodes de vacances en bas -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Palmtree :size="20" class="text-green-600" />
            Périodes de vacances
          </h2>
          <div class="space-y-3">
            <div
              v-for="periode in periodesSorted"
              :key="periode.nom"
              class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div class="flex-1">
                <div class="flex items-center gap-3">
                  <p class="font-semibold text-gray-900">{{ periode.nom }}</p>
                  <span
                    :class="getPeriodeStatusClass(periode)"
                    class="text-xs px-2 py-1 rounded-full font-semibold"
                  >
                    {{ getPeriodeStatus(periode) }}
                  </span>
                </div>
                <div class="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span>Du {{ formatDateShort(periode.date_debut) }} au {{ formatDateShort(periode.date_fin) }}</span>
                  <span class="text-xs text-gray-500">• {{ calculerDuree(periode) }} jours</span>
                </div>
              </div>
            </div>
            <div v-if="periodes.length === 0" class="text-center py-8 text-gray-500">
              Aucune période de vacances définie
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Modal Créer Calendrier -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Créer un calendrier pour {{ selectedAnneeScolaire }}</h2>

        <div class="space-y-4">
          <!-- Dates -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date de rentrée</label>
              <input type="date" v-model="newCalendrier.date_rentree" class="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date de fin d'année</label>
              <input type="date" v-model="newCalendrier.date_fin_annee" class="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>

          <!-- Périodes de vacances -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm font-medium text-gray-700">Périodes de vacances</label>
              <button @click="addPeriodeVacances" class="text-blue-600 text-sm hover:underline">+ Ajouter</button>
            </div>
            <div v-for="(periode, index) in newCalendrier.periodes_vacances" :key="index" class="flex gap-2 mb-2">
              <input type="text" v-model="periode.nom" placeholder="Nom" class="flex-1 px-3 py-2 border rounded-lg" />
              <input type="date" v-model="periode.date_debut" class="px-3 py-2 border rounded-lg" />
              <input type="date" v-model="periode.date_fin" class="px-3 py-2 border rounded-lg" />
              <button @click="removePeriodeVacances(index)" class="text-red-500 px-2">×</button>
            </div>
          </div>

          <!-- Jours fériés -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm font-medium text-gray-700">Jours fériés</label>
              <button @click="addJourFerie" class="text-blue-600 text-sm hover:underline">+ Ajouter</button>
            </div>
            <div v-for="(jour, index) in newCalendrier.jours_feries_defaut" :key="index" class="flex items-center gap-2 mb-2">
              <input type="text" v-model="jour.intitule_journee" placeholder="Intitulé" class="flex-1 px-3 py-2 border rounded-lg" />
              <input type="date" v-model="jour.date" class="px-3 py-2 border rounded-lg" />
              <label class="flex items-center gap-1 text-xs">
                <input type="checkbox" v-model="jour.recurrent" />
                Récurrent
              </label>
              <button @click="removeJourFerie(index)" class="text-red-500 px-2">×</button>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button @click="showCreateModal = false" class="px-4 py-2 border rounded-lg hover:bg-gray-50">Annuler</button>
          <button @click="submitCreateCalendrier" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Créer</button>
        </div>
      </div>
    </div>

    <!-- Modal Ajouter Jour Férié -->
    <div v-if="showAddJourFerieModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Ajouter un jour férié</h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Pays</label>
            <select v-model="newJourFerie.pays_id" class="w-full px-3 py-2 border rounded-lg">
              <option value="">Aucun pays</option>
              <option v-for="pays in paysList" :key="pays.id" :value="pays.id">{{ pays.nom }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">École <span class="text-xs text-gray-500">(optionnel)</span></label>
            <select v-model="newJourFerie.ecole_id" class="w-full px-3 py-2 border rounded-lg">
              <option value="">Aucune école</option>
              <option v-for="ecole in ecoles" :key="ecole.id" :value="ecole.id">{{ ecole.nom }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Intitulé</label>
            <input type="text" v-model="newJourFerie.intitule_journee" class="w-full px-3 py-2 border rounded-lg" placeholder="Ex: Jour de l'An" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" v-model="newJourFerie.date" class="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div class="flex gap-4">
            <label class="flex items-center gap-2">
              <input type="checkbox" v-model="newJourFerie.est_national" />
              <span class="text-sm">National</span>
            </label>
            <label class="flex items-center gap-2">
              <input type="checkbox" v-model="newJourFerie.recurrent" />
              <span class="text-sm">Récurrent (chaque année)</span>
            </label>
          </div>
        </div>

        <div class="flex items-center justify-between mt-6">
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="continueAddingJourFerie" />
            <span class="text-sm text-gray-600">Continuer à ajouter</span>
          </label>
          <div class="flex gap-3">
            <button @click="showAddJourFerieModal = false" class="px-4 py-2 border rounded-lg hover:bg-gray-50">Annuler</button>
            <button @click="submitAddJourFerie" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Ajouter</button>
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
  Calendar, CalendarDays, Plus, Clock, Palmtree, School, Star, ChevronLeft, ChevronRight
} from 'lucide-vue-next'
import calendrierScolaireService, { type CalendrierScolaire, type PeriodeVacances, type JourFerie } from '../services/calendrierScolaireService'
import ecoleService, { type Ecole } from '../services/ecoleService'
import paysService, { type Pays } from '../services/paysService'
import jourFerieService from '../services/jourFerieService'
import { useNotificationStore } from '../stores/notifications'

const notificationStore = useNotificationStore()

const paysList = ref<Pays[]>([])
const calendriers = ref<CalendrierScolaire[]>([])
const ecoles = ref<Ecole[]>([])
const periodes = ref<PeriodeVacances[]>([])
const joursFeries = ref<JourFerie[]>([])
const selectedPaysId = ref<string>('')
const selectedAnneeScolaire = ref<string>('')
const selectedCalendrierId = ref<string>('')
const selectedEcoleId = ref<string>('')
const currentCalendrier = ref<CalendrierScolaire | null>(null)
const schoolDays = ref<number>(0)
const loading = ref(false)
const showCreateModal = ref(false)
const showAddJourFerieModal = ref(false)
const newJourFerie = ref({
  pays_id: '',
  ecole_id: '',
  intitule_journee: '',
  date: '',
  est_national: false,
  recurrent: false
})
const continueAddingJourFerie = ref(false)
const newCalendrier = ref({
  date_rentree: '',
  date_fin_annee: '',
  periodes_vacances: [] as { nom: string; date_debut: string; date_fin: string }[],
  jours_feries_defaut: [] as { intitule_journee: string; date: string; recurrent: boolean }[]
})

// Calendar navigation
const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())
const weekDays = ref(['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'])

const currentMonthName = computed(() => {
  const date = new Date(currentYear.value, currentMonth.value, 1)
  return date.toLocaleDateString('fr-FR', { month: 'long' })
})

const previousMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

interface CalendarDay {
  key: string
  number: number
  isCurrentMonth: boolean
  isToday: boolean
  isHoliday: boolean
  isVacation: boolean
  date: Date
}

const calendarDays = computed(() => {
  const days: CalendarDay[] = []
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Get first day of week (0 = Sunday, 1 = Monday, etc.)
  let firstDayOfWeek = firstDay.getDay()
  // Convert Sunday (0) to 7 for easier calculation
  if (firstDayOfWeek === 0) firstDayOfWeek = 7
  // Adjust to Monday start (1 = Monday becomes 0 offset)
  const offset = firstDayOfWeek - 1

  // Add days from previous month
  const prevMonthLastDay = new Date(currentYear.value, currentMonth.value, 0).getDate()
  for (let i = offset - 1; i >= 0; i--) {
    const date = new Date(currentYear.value, currentMonth.value - 1, prevMonthLastDay - i)
    days.push({
      key: `prev-${i}`,
      number: prevMonthLastDay - i,
      isCurrentMonth: false,
      isToday: false,
      isHoliday: isDateHoliday(date),
      isVacation: isDateVacation(date),
      date
    })
  }

  // Add days from current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(currentYear.value, currentMonth.value, i)
    const isTodayDate = date.getTime() === today.getTime()

    days.push({
      key: `current-${i}`,
      number: i,
      isCurrentMonth: true,
      isToday: isTodayDate,
      isHoliday: isDateHoliday(date),
      isVacation: isDateVacation(date),
      date
    })
  }

  // Add days from next month to fill the grid (up to 42 days = 6 weeks)
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(currentYear.value, currentMonth.value + 1, i)
    days.push({
      key: `next-${i}`,
      number: i,
      isCurrentMonth: false,
      isToday: false,
      isHoliday: isDateHoliday(date),
      isVacation: isDateVacation(date),
      date
    })
  }

  return days
})

const isDateHoliday = (date: Date): boolean => {
  const dateStr = date.toISOString().split('T')[0]
  return joursFeries.value.some(jf => {
    const jfDate = new Date(jf.date).toISOString().split('T')[0]
    return jfDate === dateStr && jf.actif
  })
}

const isDateVacation = (date: Date): boolean => {
  return periodes.value.some(p => {
    const start = new Date(p.date_debut)
    const end = new Date(p.date_fin)
    return date >= start && date <= end
  })
}

const getDayClass = (day: CalendarDay) => {
  const classes = []

  if (!day.isCurrentMonth) {
    classes.push('text-gray-300 border-gray-100')
  } else if (day.isToday) {
    classes.push('bg-green-100 border-green-300 text-green-900 font-bold')
  } else if (day.isHoliday) {
    classes.push('bg-red-50 border-red-200 text-red-900 hover:bg-red-100')
  } else if (day.isVacation) {
    classes.push('bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100')
  } else {
    classes.push('border-gray-200 hover:bg-gray-50')
  }

  return classes.join(' ')
}

const formatDateShort = (dateString: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
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

// Générer une liste d'années scolaires disponibles
const annesScolairesDisponibles = computed(() => {
  const annees: Array<{ annee: string, hasCalendrier: boolean, calendrierId?: string }> = []
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1 // 1-12

  // Déterminer jusqu'à quelle année on peut aller dans le futur
  // Si on est entre septembre et décembre, on peut avoir l'année N+1
  // Sinon, on reste sur l'année en cours maximum
  const maxFutureYear = currentMonth >= 9 ? 1 : 0

  // Générer de 5 ans avant à maxFutureYear après l'année actuelle
  for (let i = -5; i <= maxFutureYear; i++) {
    const year = currentYear + i
    const anneeScolaire = `${year}-${year + 1}`

    // Vérifier si un calendrier existe pour cette année
    const calendrier = calendriers.value.find(cal => cal.annee_scolaire === anneeScolaire)

    annees.push({
      annee: anneeScolaire,
      hasCalendrier: !!calendrier,
      calendrierId: calendrier?.id
    })
  }

  return annees
})

const calendriersFiltered = computed(() => {
  return calendriers.value
})

const periodesSorted = computed(() => {
  return [...periodes.value].sort((a, b) => {
    return new Date(a.date_debut).getTime() - new Date(b.date_debut).getTime()
  })
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

const loadPays = async () => {
  try {
    const response = await paysService.getAllPays()
    if (response.success && response.data) {
      paysList.value = response.data
    }
  } catch (error: any) {
    console.error('Failed to load pays:', error)
    notificationStore.error('Erreur', 'Impossible de charger les pays')
  }
}


const onAnneeScolaireChange = async () => {
  if (!selectedAnneeScolaire.value || !selectedPaysId.value) return

  // Get selected pays object
  const selectedPays = paysList.value.find(p => p.id === selectedPaysId.value)
  if (!selectedPays) return

  loading.value = true
  try {
    // Charger le calendrier avec code_iso ET annee_scolaire
    const response = await calendrierScolaireService.getAll(
      1,
      selectedPays.code_iso,
      selectedAnneeScolaire.value,
      true
    )

    if (response.success && response.data && response.data.length > 0) {
      // Calendrier trouvé
      const calendrier = response.data[0]
      selectedCalendrierId.value = calendrier.id
      currentCalendrier.value = calendrier
      periodes.value = calendrier.periodes_vacances || []
      joursFeries.value = calendrier.jours_feries_defaut || []

      // Calculate school days
    } else {
      // Aucun calendrier pour cette année
      selectedCalendrierId.value = ''
      periodes.value = []
      joursFeries.value = []
      currentCalendrier.value = null
      schoolDays.value = 0

      notificationStore.warning(
        'Aucun calendrier',
        `Aucun calendrier disponible pour l'année ${selectedAnneeScolaire.value}`
      )
    }
  } catch (error: any) {
    console.error('Failed to load calendrier:', error)
    notificationStore.error('Erreur', 'Impossible de charger le calendrier')
  } finally {
    loading.value = false
  }
}

const createCalendrier = async () => {
  console.log('createCalendrier appelé', { selectedPaysId: selectedPaysId.value, selectedAnneeScolaire: selectedAnneeScolaire.value })
  if (!selectedPaysId.value || !selectedAnneeScolaire.value) return

  // Initialiser avec dates par défaut
  const [startYear] = selectedAnneeScolaire.value.split('-').map(Number)

  // Charger les jours fériés nationaux du pays
  let joursFeriesNationaux: { intitule_journee: string; date: string; recurrent: boolean }[] = []
  try {
    const response = await jourFerieService.getJoursFeries({ pays_id: selectedPaysId.value })
    if (response.success && response.data) {
      joursFeriesNationaux = response.data
        .filter(jf => !jf.ecole_id)
        .map(jf => ({
          intitule_journee: jf.intitule_journee,
          date: jf.date.split('T')[0],
          recurrent: jf.recurrent || false
        }))
    }
  } catch (error) {
    console.error('Failed to load jours feries nationaux:', error)
  }

  newCalendrier.value = {
    date_rentree: `${startYear}-09-01`,
    date_fin_annee: `${startYear + 1}-07-31`,
    periodes_vacances: [],
    jours_feries_defaut: joursFeriesNationaux
  }
  showCreateModal.value = true
}

const addPeriodeVacances = () => {
  newCalendrier.value.periodes_vacances.push({ nom: '', date_debut: '', date_fin: '' })
}

const removePeriodeVacances = (index: number) => {
  newCalendrier.value.periodes_vacances.splice(index, 1)
}

const addJourFerie = () => {
  newCalendrier.value.jours_feries_defaut.push({ intitule_journee: '', date: '', recurrent: false })
}

const removeJourFerie = (index: number) => {
  newCalendrier.value.jours_feries_defaut.splice(index, 1)
}

const submitCreateCalendrier = async () => {
  try {
    loading.value = true
    const response = await calendrierScolaireService.create({
      pays_id: selectedPaysId.value,
      annee_scolaire: selectedAnneeScolaire.value,
      date_rentree: newCalendrier.value.date_rentree,
      date_fin_annee: newCalendrier.value.date_fin_annee,
      periodes_vacances: newCalendrier.value.periodes_vacances.filter(p => p.nom && p.date_debut && p.date_fin),
      jours_feries_defaut: newCalendrier.value.jours_feries_defaut
        .filter(j => j.intitule_journee && j.date)
        .map(j => ({ nom: j.intitule_journee, date: j.date })),
      actif: true
    })

    if (response.success && response.data) {
      notificationStore.success('Succès', 'Calendrier créé avec succès')
      showCreateModal.value = false
      await onAnneeScolaireChange()
    }
  } catch (error: any) {
    console.error('Failed to create calendrier:', error)
    notificationStore.error('Erreur', 'Impossible de créer le calendrier')
  } finally {
    loading.value = false
  }
}

const openAddJourFerieModal = () => {
  newJourFerie.value = {
    pays_id: selectedPaysId.value,
    ecole_id: selectedEcoleId.value || '',
    intitule_journee: '',
    date: '',
    est_national: false,
    recurrent: false
  }
  showAddJourFerieModal.value = true
}

const submitAddJourFerie = async () => {
  if (!newJourFerie.value.intitule_journee || !newJourFerie.value.date || !selectedCalendrierId.value) return

  try {
    loading.value = true
    const response = await jourFerieService.createJourFerie({
      calendrier_id: selectedCalendrierId.value,
      pays_id: newJourFerie.value.pays_id || null,
      ecole_id: newJourFerie.value.ecole_id || null,
      intitule_journee: newJourFerie.value.intitule_journee,
      date: newJourFerie.value.date,
      recurrent: newJourFerie.value.recurrent,
      actif: true
    })

    if (response.success) {
      notificationStore.success('Succès', 'Jour férié ajouté avec succès')
      newJourFerie.value = { pays_id: selectedPaysId.value, ecole_id: '', intitule_journee: '', date: '', est_national: false, recurrent: false }
      await onAnneeScolaireChange()

      if (!continueAddingJourFerie.value) {
        showAddJourFerieModal.value = false
      }
    }
  } catch (error: any) {
    console.error('Failed to add jour ferie:', error)
    notificationStore.error('Erreur', 'Impossible d\'ajouter le jour férié')
  } finally {
    loading.value = false
  }
}

const onPaysChange = async () => {
  // Reset selections
  selectedAnneeScolaire.value = ''
  selectedCalendrierId.value = ''
  selectedEcoleId.value = ''
  periodes.value = []
  joursFeries.value = []
  currentCalendrier.value = null
  schoolDays.value = 0
  calendriers.value = []

  if (!selectedPaysId.value) {
    return
  }

  // Get selected pays object
  const selectedPays = paysList.value.find(p => p.id === selectedPaysId.value)
  if (!selectedPays) return

  // Auto-select calendrier de l'année en cours pour ce pays
  const now = new Date()
  const currentMonth = now.getMonth() + 1 // 1-12

  let targetYear: string
  if (currentMonth >= 9) {
    // Septembre à décembre: année scolaire YYYY-(YYYY+1)
    const year = now.getFullYear()
    targetYear = `${year}-${year + 1}`
  } else {
    // Janvier à août: année scolaire (YYYY-1)-YYYY
    const year = now.getFullYear()
    targetYear = `${year - 1}-${year}`
  }

  // Auto-select année en cours
  selectedAnneeScolaire.value = targetYear
  await onAnneeScolaireChange()
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
    const response = await calendrierScolaireService.getJoursFeries(selectedCalendrierId.value, selectedEcoleId.value)
    if (response.success && response.data) {
      // Combine national jours fériés (from calendrier) with école-specific ones
      const joursFeriesNationaux = currentCalendrier.value?.jours_feries_defaut || []
      joursFeries.value = [...joursFeriesNationaux, ...response.data]
    }
  } catch (error: any) {
    console.error('Failed to load jours feries ecole:', error)
    // Keep only national jours fériés on error
    joursFeries.value = currentCalendrier.value?.jours_feries_defaut || []
  }
}

const onEcoleChange = async () => {
  if (!selectedCalendrierId.value) return

  if (!selectedEcoleId.value) {
    // Pas d'école sélectionnée, afficher uniquement les jours fériés nationaux du calendrier
    joursFeries.value = currentCalendrier.value?.jours_feries_defaut || []
  } else {
    // École sélectionnée, charger les jours fériés spécifiques à l'école
    await loadJoursFeriesEcole()
  }

  // Recalculer les jours d'école
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

onMounted(async () => {
  await Promise.all([
    loadPays(),
    loadEcoles()
  ])

  // Sélectionner le premier pays par défaut
  if (paysList.value.length > 0) {
    selectedPaysId.value = paysList.value[0].id
    await onPaysChange()
  }
})
</script>
