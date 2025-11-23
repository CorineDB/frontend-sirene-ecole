<template>
  <div class="bg-white rounded-xl border border-gray-200 p-4 mb-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <Filter :size="20" class="text-blue-600" />
        Filtres
      </h3>
      <button
        v-if="hasActiveFilters"
        @click="clearFilters"
        class="text-sm text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
      >
        <X :size="16" />
        Réinitialiser
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Statut Filter -->
      <div v-if="showStatut" class="flex flex-col">
        <label class="text-sm font-semibold text-gray-700 mb-1">Statut</label>
        <select
          v-model="localFilters.statut"
          @change="emitFilters"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Tous les statuts</option>
          <option value="en_attente">En attente</option>
          <option value="planifiee">Planifiée</option>
          <option value="en_cours">En cours</option>
          <option value="terminee">Terminée</option>
          <option value="annulee">Annulée</option>
        </select>
      </div>

      <!-- École Filter -->
      <div v-if="showEcole && ecoles.length > 0" class="flex flex-col">
        <label class="text-sm font-semibold text-gray-700 mb-1">École</label>
        <select
          v-model="localFilters.ecole_id"
          @change="emitFilters"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Toutes les écoles</option>
          <option v-for="ecole in ecoles" :key="ecole.id" :value="ecole.id">
            {{ ecole.nom || ecole.nom_complet }}
          </option>
        </select>
      </div>

      <!-- Site Filter -->
      <div v-if="showSite && sites.length > 0" class="flex flex-col">
        <label class="text-sm font-semibold text-gray-700 mb-1">Site</label>
        <select
          v-model="localFilters.site_id"
          @change="emitFilters"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Tous les sites</option>
          <option v-for="site in sites" :key="site.id" :value="site.id">
            {{ site.nom }}
          </option>
        </select>
      </div>

      <!-- Technicien Filter -->
      <div v-if="showTechnicien && techniciens.length > 0" class="flex flex-col">
        <label class="text-sm font-semibold text-gray-700 mb-1">Technicien</label>
        <select
          v-model="localFilters.technicien_id"
          @change="emitFilters"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Tous les techniciens</option>
          <option v-for="tech in techniciens" :key="tech.id" :value="tech.id">
            {{ tech.nom }}
          </option>
        </select>
      </div>

      <!-- Ville Filter -->
      <div v-if="showVille && villes.length > 0" class="flex flex-col">
        <label class="text-sm font-semibold text-gray-700 mb-1">Ville</label>
        <select
          v-model="localFilters.ville_id"
          @change="emitFilters"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Toutes les villes</option>
          <option v-for="ville in villes" :key="ville.id" :value="ville.id">
            {{ ville.nom }}
          </option>
        </select>
      </div>

      <!-- Priorité Filter -->
      <div v-if="showPriorite" class="flex flex-col">
        <label class="text-sm font-semibold text-gray-700 mb-1">Priorité</label>
        <select
          v-model="localFilters.priorite"
          @change="emitFilters"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Toutes les priorités</option>
          <option value="faible">Faible</option>
          <option value="moyenne">Moyenne</option>
          <option value="haute">Haute</option>
        </select>
      </div>

      <!-- Date Début Filter -->
      <div v-if="showDateDebut" class="flex flex-col">
        <label class="text-sm font-semibold text-gray-700 mb-1">Date début</label>
        <input
          type="date"
          v-model="localFilters.date_debut"
          @change="emitFilters"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <!-- Date Fin Filter -->
      <div v-if="showDateFin" class="flex flex-col">
        <label class="text-sm font-semibold text-gray-700 mb-1">Date fin</label>
        <input
          type="date"
          v-model="localFilters.date_fin"
          @change="emitFilters"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Filter, X } from 'lucide-vue-next'

interface FilterValue {
  statut?: string
  ecole_id?: string
  site_id?: string
  technicien_id?: string
  ville_id?: string
  priorite?: string
  date_debut?: string
  date_fin?: string
}

interface Props {
  // Quels filtres afficher
  showStatut?: boolean
  showEcole?: boolean
  showSite?: boolean
  showTechnicien?: boolean
  showVille?: boolean
  showPriorite?: boolean
  showDateDebut?: boolean
  showDateFin?: boolean

  // Données pour les selects
  ecoles?: any[]
  sites?: any[]
  techniciens?: any[]
  villes?: any[]

  // Valeurs initiales
  initialFilters?: FilterValue
}

const props = withDefaults(defineProps<Props>(), {
  showStatut: false,
  showEcole: false,
  showSite: false,
  showTechnicien: false,
  showVille: false,
  showPriorite: false,
  showDateDebut: false,
  showDateFin: false,
  ecoles: () => [],
  sites: () => [],
  techniciens: () => [],
  villes: () => [],
  initialFilters: () => ({})
})

const emit = defineEmits<{
  (e: 'filter-change', filters: FilterValue): void
}>()

// Local state
const localFilters = ref<FilterValue>({ ...props.initialFilters })

// Computed
const hasActiveFilters = computed(() => {
  return Object.values(localFilters.value).some(value => value !== undefined && value !== '')
})

// Methods
const emitFilters = () => {
  // Only emit non-empty filters
  const activeFilters: FilterValue = {}
  Object.entries(localFilters.value).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      activeFilters[key as keyof FilterValue] = value
    }
  })
  emit('filter-change', activeFilters)
}

const clearFilters = () => {
  localFilters.value = {}
  emitFilters()
}

// Watch for external filter changes
watch(() => props.initialFilters, (newFilters) => {
  localFilters.value = { ...newFilters }
}, { deep: true })
</script>
