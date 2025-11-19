<template>
  <DashboardLayout>
    <div class="p-6 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Techniciens</h1>
          <p class="text-gray-600 mt-1">Gérer l'équipe de maintenance</p>
        </div>
        <button
          @click="formModalOpen = true"
          class="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02]"
        >
          <Plus :size="20" />
          Nouveau technicien
        </button>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="bg-white rounded-xl p-6 border border-gray-200"
        >
          <p class="text-sm text-gray-600 mb-2">{{ stat.label }}</p>
          <p class="text-3xl font-bold text-gray-900">{{ stat.count }}</p>
          <div :class="`mt-3 h-1 rounded-full bg-gradient-to-r ${stat.color}`"></div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center h-96">
        <div class="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>

      <!-- Technicians Grid -->
      <div v-if="!loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <router-link
          v-for="tech in technicians"
          :key="tech.id"
          :to="`/technicians/${tech.id}`"
          class="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all transform hover:scale-[1.02]"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Wrench :size="24" class="text-white" />
            </div>
            <span :class="`text-xs px-2 py-1 rounded-full font-semibold ${tech.disponibilite ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`">
              {{ tech.disponibilite ? 'Disponible' : 'Indisponible' }}
            </span>
          </div>

          <h3 class="text-lg font-bold text-gray-900 mb-1">{{ getUserFullName(tech) }}</h3>
          <p v-if="tech.specialite" class="text-sm text-gray-600 mb-3">{{ tech.specialite }}</p>

          <div class="space-y-2 mb-4">
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <Phone :size="16" class="text-gray-400" />
              <span>{{ tech.user?.userInfo?.telephone || 'N/A' }}</span>
            </div>
            <div v-if="tech.ville" class="flex items-center gap-2 text-sm text-gray-600">
              <MapPin :size="16" class="text-gray-400" />
              <span>{{ tech.ville.nom }}</span>
            </div>
          </div>

          <div class="flex items-center justify-between pt-4 border-t border-gray-100">
            <div class="flex items-center gap-1">
              <Star :size="16" class="text-yellow-500 fill-yellow-500" />
              <span class="text-sm font-semibold text-gray-900">
                {{ (tech.rating || 0).toFixed(1) }}
              </span>
            </div>
            <span class="text-sm text-gray-600">
              {{ tech.total_interventions || 0 }} interventions
            </span>
          </div>
        </router-link>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && technicians.length === 0" class="bg-white rounded-xl p-12 text-center border border-gray-200">
        <Wrench :size="64" class="text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Aucun technicien</h3>
        <p class="text-gray-600">Ajoutez votre premier technicien</p>
      </div>

      <!-- Technicien Form Modal -->
      <TechnicienFormModal
        :is-open="formModalOpen"
        @close="closeFormModal"
        @created="handleTechnicienCreated"
      />
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import DashboardLayout from '../components/layout/DashboardLayout.vue'
import TechnicienFormModal from '../components/technicians/TechnicienFormModal.vue'
import { Wrench, Star, MapPin, Phone, Plus } from 'lucide-vue-next'
import technicienService, { type Technicien } from '../services/technicienService'
import { useNotificationStore } from '../stores/notifications'

const notificationStore = useNotificationStore()

const technicians = ref<Technicien[]>([])
const loading = ref(true)
const formModalOpen = ref(false)

const stats = computed(() => [
  { label: 'Total', count: technicians.value.length, color: 'from-blue-500 to-blue-600' },
  { label: 'Disponibles', count: technicians.value.filter(t => t.disponibilite).length, color: 'from-green-500 to-green-600' },
  { label: 'Indisponibles', count: technicians.value.filter(t => !t.disponibilite).length, color: 'from-gray-500 to-gray-600' },
])

const getUserFullName = (tech: Technicien) => {
  if (!tech.user?.userInfo) return 'N/A'
  const { nom, prenom } = tech.user.userInfo
  return `${prenom || ''} ${nom || ''}`.trim() || 'N/A'
}

const closeFormModal = () => {
  formModalOpen.value = false
}

const handleTechnicienCreated = (technicien: Technicien) => {
  // Reload technicians after creation
  fetchTechnicians()
  closeFormModal()
}

const fetchTechnicians = async () => {
  loading.value = true
  try {
    const response = await technicienService.getAll(100)
    if (response.success && response.data?.data) {
      technicians.value = response.data.data
    } else {
      technicians.value = []
    }
  } catch (error: any) {
    console.error('Failed to load technicians:', error)
    notificationStore.error('Erreur', 'Impossible de charger les techniciens')
    technicians.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTechnicians()
})
</script>
