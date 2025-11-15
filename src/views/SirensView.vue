<template>
  <DashboardLayout>
    <div class="p-6 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Sirènes</h1>
          <p class="text-gray-600 mt-1">Inventaire des sirènes</p>
        </div>
        <button
          @click="openCreateModal"
          class="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all flex items-center gap-2"
        >
          <Plus :size="20" />
          Ajouter une sirène
        </button>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
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

      <!-- Filter -->
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <select
          v-model="filterStatus"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Tous les statuts</option>
          <option value="in_stock">En stock</option>
          <option value="installed">Installée</option>
          <option value="maintenance">Maintenance</option>
          <option value="decommissioned">Désactivée</option>
        </select>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center h-96">
        <div class="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>

      <!-- Sirens Grid -->
      <div v-if="!loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="siren in filteredSirens"
          :key="siren.id"
          class="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all transform hover:scale-[1.02]"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <Bell :size="24" class="text-white" />
            </div>
            <span :class="`text-xs px-2 py-1 rounded-full font-semibold ${statusColors[siren.status]}`">
              {{ statusLabels[siren.status] }}
            </span>
          </div>

          <h3 class="text-lg font-bold text-gray-900 mb-1">
            {{ siren.serial_number || 'N/A' }}
          </h3>
          <p class="text-sm text-gray-600 mb-4">{{ siren.siren_models?.model_name || 'Modèle inconnu' }}</p>

          <div class="space-y-2 text-sm">
            <div class="flex items-center gap-2 text-gray-600">
              <Package :size="16" class="text-gray-400" />
              <span>Modèle: {{ siren.siren_models?.model_code || 'N/A' }}</span>
            </div>
            <div class="flex items-center gap-2 text-gray-600">
              <Calendar :size="16" class="text-gray-400" />
              <span>Fabriquée le {{ formatDate(siren.date_fabrication) }}</span>
            </div>
          </div>

          <div v-if="siren.notes" class="mt-4 p-3 bg-gray-50 rounded-lg">
            <p class="text-xs text-gray-600">{{ siren.notes }}</p>
          </div>

          <div class="mt-4 pt-4 border-t border-gray-200 flex items-center justify-end gap-2">
            <button
              @click="openEditModal(siren)"
              class="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
            >
              <Edit :size="14" />
              Modifier
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && filteredSirens.length === 0" class="bg-white rounded-xl p-12 text-center border border-gray-200">
        <Bell :size="64" class="text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Aucune sirène trouvée</h3>
        <p class="text-gray-600">Aucune sirène ne correspond à vos critères</p>
      </div>
    </div>

    <!-- Siren Form Modal -->
    <SirenFormModal
      :is-open="isModalOpen"
      :siren="selectedSiren"
      @close="closeModal"
      @created="handleSirenCreated"
      @updated="handleSirenUpdated"
    />
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import DashboardLayout from '../components/layout/DashboardLayout.vue'
import SirenFormModal from '../components/sirens/SirenFormModal.vue'
import { Bell, Package, Calendar, Plus, Edit } from 'lucide-vue-next'
import { useSirens } from '@/composables/useSirens'
import type { ApiSiren } from '@/types/api'

const { sirens, loading, loadSirens } = useSirens()
const filterStatus = ref('all')
const isModalOpen = ref(false)
const selectedSiren = ref<ApiSiren | null>(null)

const statusColors: Record<string, string> = {
  in_stock: 'bg-blue-100 text-blue-700',
  installed: 'bg-green-100 text-green-700',
  maintenance: 'bg-orange-100 text-orange-700',
  decommissioned: 'bg-gray-100 text-gray-700',
  available: 'bg-blue-100 text-blue-700',
}

const statusLabels: Record<string, string> = {
  in_stock: 'En stock',
  installed: 'Installée',
  maintenance: 'Maintenance',
  decommissioned: 'Désactivée',
  available: 'Disponible',
}

const stats = computed(() => {
  const totalSirens = sirens.value.length
  const enStock = sirens.value.filter(s => s.status === 'in_stock' || s.status === 'available').length
  const installees = sirens.value.filter(s => s.status === 'installed').length
  const maintenance = sirens.value.filter(s => s.status === 'maintenance').length

  return [
    { label: 'Total', count: totalSirens, color: 'from-blue-500 to-blue-600' },
    { label: 'En stock', count: enStock, color: 'from-cyan-500 to-cyan-600' },
    { label: 'Installées', count: installees, color: 'from-green-500 to-green-600' },
    { label: 'Maintenance', count: maintenance, color: 'from-orange-500 to-orange-600' },
  ]
})

const filteredSirens = computed(() => {
  if (filterStatus.value === 'all') {
    return sirens.value
  }
  return sirens.value.filter(siren => siren.status === filterStatus.value)
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const openCreateModal = () => {
  selectedSiren.value = null
  isModalOpen.value = true
}

const openEditModal = (siren: ApiSiren) => {
  selectedSiren.value = siren
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedSiren.value = null
}

const handleSirenCreated = async () => {
  closeModal()
  await loadSirens()
}

const handleSirenUpdated = async () => {
  closeModal()
  await loadSirens()
}

onMounted(async () => {
  await loadSirens()
})
</script>
