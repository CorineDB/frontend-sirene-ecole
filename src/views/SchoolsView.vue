<template>
  <DashboardLayout>
    <div class="p-6 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Gestion des écoles</h1>
          <p class="text-gray-600 mt-1">Gérer les établissements scolaires du système</p>
        </div>
        <button
          @click="formModalOpen = true"
          class="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all transform hover:scale-[1.02]"
        >
          <Plus :size="20" />
          Nouvelle école
        </button>
      </div>

      <!-- Search and Filters -->
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1 relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une école par nom ou ville..."
              v-model="searchTerm"
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div class="flex gap-2">
            <select
              v-model="filterType"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les types</option>
              <option value="maternelle">Maternelle</option>
              <option value="primaire">Primaire</option>
              <option value="secondaire">Secondaire</option>
              <option value="superieur">Supérieur</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center h-96">
        <div class="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>

      <!-- Schools Grid -->
      <div v-if="!loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <router-link
          v-for="school in filteredSchools"
          :key="school.id"
          :to="`/schools/${school.id}`"
          class="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all transform hover:scale-[1.02]"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <Building2 :size="24" class="text-white" />
            </div>
            <div class="flex gap-2">
              <span :class="`text-xs px-2 py-1 rounded-full font-semibold ${typeColors[school.type]}`">
                {{ school.type }}
              </span>
              <span :class="`text-xs px-2 py-1 rounded-full font-semibold ${statusColors[school.status]}`">
                {{ school.status }}
              </span>
            </div>
          </div>

          <h3 class="text-lg font-bold text-gray-900 mb-2">{{ school.name }}</h3>

          <div class="space-y-2 text-sm text-gray-600">
            <div class="flex items-center gap-2">
              <MapPin :size="16" class="text-gray-400" />
              <span>{{ school.city }}, {{ school.region }}</span>
            </div>
            <div class="flex items-center gap-2">
              <Phone :size="16" class="text-gray-400" />
              <span>{{ school.phone }}</span>
            </div>
            <div v-if="school.email" class="flex items-center gap-2">
              <Mail :size="16" class="text-gray-400" />
              <span class="truncate">{{ school.email }}</span>
            </div>
          </div>

          <div class="mt-4 pt-4 border-t border-gray-100">
            <p class="text-xs text-gray-500">
              Créée le {{ formatDate(school.created_at) }}
            </p>
          </div>
        </router-link>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && filteredSchools.length === 0" class="bg-white rounded-xl p-12 text-center border border-gray-200">
        <Building2 :size="64" class="text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Aucune école trouvée</h3>
        <p class="text-gray-600">
          {{ searchTerm || filterType !== 'all'
            ? 'Essayez de modifier vos filtres de recherche'
            : 'Commencez par ajouter votre première école' }}
        </p>
      </div>

      <!-- École Form Modal -->
      <EcoleFormModal
        :is-open="formModalOpen"
        @close="closeFormModal"
        @created="handleEcoleCreated"
      />
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import DashboardLayout from '../components/layout/DashboardLayout.vue'
import EcoleFormModal from '../components/schools/EcoleFormModal.vue'
import { Building2, Plus, Search, MapPin, Phone, Mail } from 'lucide-vue-next'
import ecoleService, { type Ecole } from '../services/ecoleService'
import { useNotificationStore } from '../stores/notifications'

interface School {
  id: string
  name: string
  type: string
  phone: string
  email: string | null
  address: string
  city: string
  region: string
  status: string
  created_at: string
}

const notificationStore = useNotificationStore()

const schools = ref<School[]>([])
const loading = ref(true)
const searchTerm = ref('')
const filterType = ref('all')
const formModalOpen = ref(false)

const typeColors: Record<string, string> = {
  maternelle: 'bg-pink-100 text-pink-700',
  primaire: 'bg-blue-100 text-blue-700',
  secondaire: 'bg-purple-100 text-purple-700',
  superieur: 'bg-indigo-100 text-indigo-700',
}

const statusColors: Record<string, string> = {
  actif: 'bg-green-100 text-green-700',
  active: 'bg-green-100 text-green-700',
  inactif: 'bg-gray-100 text-gray-700',
  inactive: 'bg-gray-100 text-gray-700',
  suspendu: 'bg-red-100 text-red-700',
  suspended: 'bg-red-100 text-red-700',
}

const filteredSchools = computed(() => {
  return schools.value.filter(school => {
    const matchesSearch = school.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      school.city.toLowerCase().includes(searchTerm.value.toLowerCase())
    const matchesType = filterType.value === 'all' || school.type === filterType.value
    return matchesSearch && matchesType
  })
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const closeFormModal = () => {
  formModalOpen.value = false
}

const handleEcoleCreated = (ecole: Ecole) => {
  // Reload schools after creation
  fetchSchools()
  closeFormModal()
}

const fetchSchools = async () => {
  loading.value = true
  try {
    const response = await ecoleService.getAll(100)
    if (response.success && response.data?.data) {
      // Map Ecole to School format
      schools.value = response.data.data.map((ecole: Ecole) => {
        // Safely get type from types_etablissement array
        let type = 'primaire'
        if (Array.isArray(ecole.types_etablissement) && ecole.types_etablissement.length > 0) {
          type = ecole.types_etablissement[0]
        }

        return {
          id: ecole.id,
          name: ecole.nom_complet || ecole.nom || 'École sans nom',
          type: type,
          phone: ecole.telephone_contact || 'N/A',
          email: ecole.email_contact || null,
          address: ecole.site_principal?.adresse || 'N/A',
          city: ecole.site_principal?.ville?.nom || 'N/A',
          region: ecole.site_principal?.ville?.pays?.nom || 'N/A',
          status: ecole.statut || 'actif',
          created_at: ecole.created_at || new Date().toISOString(),
        }
      })
    } else {
      // Empty if no data
      schools.value = []
    }
  } catch (error: any) {
    console.error('Failed to load schools:', error)
    notificationStore.error('Erreur', 'Impossible de charger les écoles')
    schools.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchSchools()
})
</script>
