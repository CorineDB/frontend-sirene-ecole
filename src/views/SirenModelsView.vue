<template>
  <DashboardLayout>
    <div class="p-6 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Modèles de sirènes</h1>
          <p class="text-gray-600 mt-1">Catalogue des modèles disponibles</p>
        </div>
        <button
          @click="openCreateModal"
          class="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all"
        >
          <Plus :size="20" />
          Ajouter un modèle
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center h-96">
        <div class="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>

      <!-- Models Grid -->
      <div v-if="!loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="model in sirenModels"
          :key="model.id"
          class="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <Bell :size="24" class="text-white" />
            </div>
            <span class="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
              {{ model.model_code }}
            </span>
          </div>

          <h3 class="text-lg font-bold text-gray-900 mb-1">{{ model.model_name }}</h3>
          <p v-if="model.description" class="text-sm text-gray-600 mb-4">{{ model.description }}</p>
          <p v-else class="text-sm text-gray-400 italic mb-4">Aucune description</p>

          <div class="mt-4 pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              @click="openEditModal(model)"
              class="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
            >
              <Edit :size="14" />
              Modifier
            </button>
            <button
              @click="handleDeleteModel(model.id)"
              class="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
            >
              <Trash2 :size="14" />
              Supprimer
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && sirenModels.length === 0" class="bg-white rounded-xl p-12 text-center border border-gray-200">
        <Bell :size="64" class="text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Aucun modèle de sirène</h3>
        <p class="text-gray-600 mb-4">Commencez par ajouter un modèle de sirène</p>
        <button
          @click="openCreateModal"
          class="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all"
        >
          Ajouter un modèle
        </button>
      </div>
    </div>

    <!-- Model Form Modal -->
    <ModeleSireneFormModal
      :is-open="isModalOpen"
      :model="selectedModel"
      @close="closeModal"
      @created="handleModelCreated"
      @updated="handleModelUpdated"
    />
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DashboardLayout from '../components/layout/DashboardLayout.vue'
import ModeleSireneFormModal from '../components/sirens/ModeleSireneFormModal.vue'
import { Bell, Plus, Edit, Trash2 } from 'lucide-vue-next'
import { useSirens } from '@/composables/useSirens'
import { useNotificationStore } from '@/stores/notifications'
import sirenService from '@/services/sirenService'
import type { ApiSirenModel } from '@/types/api'

const { sirenModels, loading, loadSirenModels } = useSirens()
const notificationStore = useNotificationStore()
const isModalOpen = ref(false)
const selectedModel = ref<ApiSirenModel | null>(null)

const openCreateModal = () => {
  selectedModel.value = null
  isModalOpen.value = true
}

const openEditModal = (model: ApiSirenModel) => {
  selectedModel.value = model
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedModel.value = null
}

const handleModelCreated = async () => {
  closeModal()
  await loadSirenModels()
}

const handleModelUpdated = async () => {
  closeModal()
  await loadSirenModels()
}

const handleDeleteModel = async (modelId: string) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce modèle de sirène ?')) {
    return
  }

  try {
    const response = await sirenService.deleteSirenModel(modelId)
    if (response.success) {
      notificationStore.success('Modèle supprimé', 'Le modèle de sirène a été supprimé avec succès')
      await loadSirenModels()
    }
  } catch (error) {
    console.error('Failed to delete siren model:', error)
    notificationStore.error('Erreur', 'Impossible de supprimer le modèle de sirène')
  }
}

onMounted(async () => {
  await loadSirenModels()
})
</script>
