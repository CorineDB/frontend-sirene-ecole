<template>
  <DashboardLayout>
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-6">
        <button @click="goBack" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft :size="24" />
        </button>
        <div class="flex-1">
          <h1 class="text-3xl font-bold text-gray-900">Détail du technicien</h1>
          <p class="text-gray-600 mt-1">Informations complètes et interventions</p>
        </div>
        <button
          @click="openEditModal"
          class="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
        >
          <Edit :size="20" />
          Modifier
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center h-96">
        <div class="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>

      <!-- Content -->
      <div v-else-if="technicien" class="space-y-6">
        <!-- Technician Info Card -->
        <div class="bg-white rounded-xl p-8 border border-gray-200">
          <div class="flex items-center gap-6 mb-8">
            <div class="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Wrench :size="40" class="text-white" />
            </div>
            <div class="flex-1">
              <h2 class="text-2xl font-bold text-gray-900">{{ getUserFullName() }}</h2>
              <div class="flex items-center gap-2 mt-2">
                <span class="text-sm px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold">
                  {{ technicien.specialite }}
                </span>
                <span
                  :class="[
                    'text-sm px-3 py-1 rounded-full font-semibold',
                    technicien.disponibilite ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  ]"
                >
                  {{ technicien.disponibilite ? 'Disponible' : 'Indisponible' }}
                </span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Informations personnelles -->
            <div class="md:col-span-2">
              <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Info :size="20" class="text-purple-600" />
                Informations personnelles
              </h3>
              <div class="space-y-3">
                <div class="flex items-start gap-3">
                  <User :size="20" class="text-gray-400 mt-0.5" />
                  <div>
                    <p class="text-sm text-gray-500">Nom d'utilisateur</p>
                    <p class="text-gray-900 font-medium">{{ technicien.user?.nom_utilisateur || 'N/A' }}</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <Phone :size="20" class="text-gray-400 mt-0.5" />
                  <div>
                    <p class="text-sm text-gray-500">Téléphone</p>
                    <p class="text-gray-900">{{ getUserPhone() }}</p>
                  </div>
                </div>
                <div v-if="getUserEmail()" class="flex items-start gap-3">
                  <Mail :size="20" class="text-gray-400 mt-0.5" />
                  <div>
                    <p class="text-sm text-gray-500">Email</p>
                    <p class="text-gray-900">{{ getUserEmail() }}</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <MapPin :size="20" class="text-gray-400 mt-0.5" />
                  <div>
                    <p class="text-sm text-gray-500">Ville d'affectation</p>
                    <p class="text-gray-900">{{ getUserVille() }}</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <Calendar :size="20" class="text-gray-400 mt-0.5" />
                  <div>
                    <p class="text-sm text-gray-500">Date d'embauche</p>
                    <p class="text-gray-900">{{ formatDate(technicien.date_embauche) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Statistiques -->
            <div>
              <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart :size="20" class="text-purple-600" />
                Statistiques
              </h3>
              <div class="space-y-3">
                <div>
                  <p class="text-sm text-gray-500">Note moyenne</p>
                  <div class="flex items-center gap-2">
                    <Star :size="20" class="text-yellow-500 fill-yellow-500" />
                    <p class="text-2xl font-bold text-gray-900">{{ parseFloat(technicien.review || '0').toFixed(1) }}</p>
                  </div>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Statut</p>
                  <p class="text-2xl font-bold text-gray-900 capitalize">{{ technicien.statut }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Statistics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-white rounded-xl p-6 border border-gray-200">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle :size="20" class="text-blue-600" />
              </div>
              <p class="text-sm text-gray-600">Interventions terminées</p>
            </div>
            <p class="text-3xl font-bold text-gray-900">{{ stats.completed }}</p>
          </div>

          <div class="bg-white rounded-xl p-6 border border-gray-200">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock :size="20" class="text-amber-600" />
              </div>
              <p class="text-sm text-gray-600">En cours</p>
            </div>
            <p class="text-3xl font-bold text-gray-900">{{ stats.in_progress }}</p>
          </div>

          <div class="bg-white rounded-xl p-6 border border-gray-200">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle :size="20" class="text-red-600" />
              </div>
              <p class="text-sm text-gray-600">Annulées</p>
            </div>
            <p class="text-3xl font-bold text-gray-900">{{ stats.cancelled }}</p>
          </div>

          <div class="bg-white rounded-xl p-6 border border-gray-200">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp :size="20" class="text-purple-600" />
              </div>
              <p class="text-sm text-gray-600">Taux de réussite</p>
            </div>
            <p class="text-3xl font-bold text-gray-900">{{ stats.success_rate }}%</p>
          </div>
        </div>

        <!-- Interventions History -->
        <div class="bg-white rounded-xl border border-gray-200">
          <div class="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileText :size="24" class="text-purple-600" />
                Historique des interventions
              </h3>
              <span class="text-sm font-semibold text-gray-600">
                {{ interventions.length }} intervention{{ interventions.length > 1 ? 's' : '' }}
              </span>
            </div>
          </div>

          <div class="p-6">
            <!-- Loading interventions -->
            <div v-if="loadingInterventions" class="flex items-center justify-center py-8">
              <div class="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
            </div>

            <!-- Interventions list -->
            <div v-else-if="interventions.length > 0" class="space-y-4">
              <div
                v-for="intervention in interventions"
                :key="intervention.id"
                class="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all"
              >
                <div class="flex items-start justify-between mb-3">
                  <div class="flex-1">
                    <h4 class="font-semibold text-gray-900 mb-1">{{ intervention.title }}</h4>
                    <p class="text-sm text-gray-600">{{ intervention.description }}</p>
                  </div>
                  <span
                    :class="[
                      'text-xs px-2 py-1 rounded-full font-semibold',
                      intervention.status === 'completed' ? 'bg-green-100 text-green-700' :
                      intervention.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                      intervention.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    ]"
                  >
                    {{ getStatusLabel(intervention.status) }}
                  </span>
                </div>
                <div class="flex items-center gap-4 text-sm text-gray-500">
                  <div class="flex items-center gap-1">
                    <Calendar :size="16" />
                    <span>{{ formatDate(intervention.date) }}</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <MapPin :size="16" />
                    <span>{{ intervention.location }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty state -->
            <div v-else class="text-center py-12">
              <FileText :size="48" class="text-gray-300 mx-auto mb-3" />
              <p class="text-gray-600">Aucune intervention enregistrée</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="bg-white rounded-xl p-12 text-center border border-gray-200">
        <Wrench :size="64" class="text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Technicien introuvable</h3>
        <p class="text-gray-600 mb-4">Impossible de charger les informations de ce technicien</p>
        <button
          @click="goBack"
          class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Retour à la liste
        </button>
      </div>
    </div>

    <!-- Edit Modal -->
    <TechnicienFormModal
      :is-open="editModalOpen"
      :technicien="technicien"
      @close="closeEditModal"
      @updated="handleTechnicienUpdated"
    />
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import DashboardLayout from '../components/layout/DashboardLayout.vue'
import TechnicienFormModal from '../components/technicians/TechnicienFormModal.vue'
import {
  Wrench, ArrowLeft, Info, User, Phone, Mail, MapPin, Calendar,
  BarChart, Star, CheckCircle, Clock, XCircle, TrendingUp,
  FileText, Edit
} from 'lucide-vue-next'
import technicienService, { type Technicien } from '../services/technicienService'
import { useNotificationStore } from '../stores/notifications'

const router = useRouter()
const route = useRoute()
const notificationStore = useNotificationStore()

const technicien = ref<Technicien | null>(null)
const loading = ref(true)
const loadingInterventions = ref(false)
const interventions = ref<any[]>([])
const editModalOpen = ref(false)

const stats = computed(() => {
  const completed = interventions.value.filter(i => i.status === 'completed').length
  const in_progress = interventions.value.filter(i => i.status === 'in_progress').length
  const cancelled = interventions.value.filter(i => i.status === 'cancelled').length
  const total = interventions.value.length
  const success_rate = total > 0 ? Math.round((completed / total) * 100) : 0

  return {
    completed,
    in_progress,
    cancelled,
    success_rate
  }
})

const getUserFullName = () => {
  const userInfo = technicien.value?.user?.user_info || technicien.value?.user?.userInfo
  if (!userInfo) return 'N/A'
  return userInfo.nom_complet || `${userInfo.prenom || ''} ${userInfo.nom || ''}`.trim() || 'N/A'
}

const getUserPhone = () => {
  const userInfo = technicien.value?.user?.user_info || technicien.value?.user?.userInfo
  return userInfo?.telephone || 'N/A'
}

const getUserEmail = () => {
  const userInfo = technicien.value?.user?.user_info || technicien.value?.user?.userInfo
  return userInfo?.email || null
}

const getUserVille = () => {
  const userInfo = technicien.value?.user?.user_info || technicien.value?.user?.userInfo
  return userInfo?.ville?.nom || userInfo?.nom_ville || 'N/A'
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    completed: 'Terminée',
    in_progress: 'En cours',
    cancelled: 'Annulée',
    pending: 'En attente'
  }
  return labels[status] || status
}

const loadTechnicien = async () => {
  loading.value = true
  try {
    const technicienId = route.params.id as string
    const response = await technicienService.getById(technicienId)

    if (response.success && response.data) {
      technicien.value = response.data
      loadInterventions(technicienId)
    } else {
      notificationStore.error('Erreur', 'Technicien introuvable')
    }
  } catch (error: any) {
    console.error('Failed to load technicien:', error)
    notificationStore.error('Erreur', 'Impossible de charger les détails du technicien')
  } finally {
    loading.value = false
  }
}

const loadInterventions = async (technicienId: string) => {
  loadingInterventions.value = true
  try {
    const response = await technicienService.getInterventions(technicienId)

    if (response.success && response.data) {
      interventions.value = response.data
    } else {
      // Use mock data if API fails
      interventions.value = []
    }
  } catch (error: any) {
    console.error('Failed to load interventions:', error)
    // Use mock data on error
    interventions.value = []
  } finally {
    loadingInterventions.value = false
  }
}

const goBack = () => {
  router.push('/technicians')
}

const openEditModal = () => {
  editModalOpen.value = true
}

const closeEditModal = () => {
  editModalOpen.value = false
}

const handleTechnicienUpdated = (updatedTechnicien: Technicien) => {
  technicien.value = updatedTechnicien
  closeEditModal()
}

onMounted(() => {
  loadTechnicien()
})
</script>
