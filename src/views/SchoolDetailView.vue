<template>
  <DashboardLayout>
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-6">
        <button @click="goBack" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft :size="24" />
        </button>
        <div class="flex-1">
          <h1 class="text-3xl font-bold text-gray-900">Détail de l'école</h1>
          <p class="text-gray-600 mt-1">Informations complètes de l'établissement</p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center h-96">
        <div class="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>

      <!-- Content -->
      <div v-else-if="ecole" class="space-y-6">
        <!-- School Info Card -->
        <div class="bg-white rounded-xl p-8 border border-gray-200">
          <div class="flex items-center gap-6 mb-8">
            <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <Building2 :size="40" class="text-white" />
            </div>
            <div class="flex-1">
              <h2 class="text-2xl font-bold text-gray-900">{{ ecole.nom_complet }}</h2>
              <div class="flex items-center gap-2 mt-2">
                <span
                  v-for="type in ecole.types_etablissement"
                  :key="type"
                  class="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold"
                >
                  {{ type }}
                </span>
                <span
                  :class="[
                    'text-sm px-3 py-1 rounded-full font-semibold',
                    ecole.statut === 'actif' ? 'bg-green-100 text-green-700' :
                    ecole.statut === 'inactif' ? 'bg-gray-100 text-gray-700' :
                    'bg-red-100 text-red-700'
                  ]"
                >
                  {{ ecole.statut }}
                </span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Informations générales -->
            <div class="md:col-span-2">
              <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Info :size="20" class="text-blue-600" />
                Informations générales
              </h3>
              <div class="space-y-3">
                <div class="flex items-start gap-3">
                  <Building2 :size="20" class="text-gray-400 mt-0.5" />
                  <div>
                    <p class="text-sm text-gray-500">Nom complet</p>
                    <p class="text-gray-900 font-medium">{{ ecole.nom_complet }}</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <Hash :size="20" class="text-gray-400 mt-0.5" />
                  <div>
                    <p class="text-sm text-gray-500">Code établissement</p>
                    <p class="text-gray-900 font-mono">{{ ecole.code_etablissement }}</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <Phone :size="20" class="text-gray-400 mt-0.5" />
                  <div>
                    <p class="text-sm text-gray-500">Téléphone</p>
                    <p class="text-gray-900">{{ ecole.telephone_contact }}</p>
                  </div>
                </div>
                <div v-if="ecole.email_contact" class="flex items-start gap-3">
                  <Mail :size="20" class="text-gray-400 mt-0.5" />
                  <div>
                    <p class="text-sm text-gray-500">Email</p>
                    <p class="text-gray-900">{{ ecole.email_contact }}</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <Calendar :size="20" class="text-gray-400 mt-0.5" />
                  <div>
                    <p class="text-sm text-gray-500">Date d'inscription</p>
                    <p class="text-gray-900">{{ formatDate(ecole.date_inscription) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Responsable -->
            <div>
              <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User :size="20" class="text-blue-600" />
                Responsable
              </h3>
              <div class="space-y-3">
                <div>
                  <p class="text-sm text-gray-500">Nom complet</p>
                  <p class="text-gray-900 font-medium">{{ ecole.responsable_prenom }} {{ ecole.responsable_nom }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Téléphone</p>
                  <p class="text-gray-900">{{ ecole.responsable_telephone }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Statistiques -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-white rounded-xl p-6 border border-gray-200">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPin :size="20" class="text-blue-600" />
              </div>
              <p class="text-sm text-gray-600">Total sites</p>
            </div>
            <p class="text-3xl font-bold text-gray-900">{{ ecole.sites?.length || 0 }}</p>
          </div>

          <div class="bg-white rounded-xl p-6 border border-gray-200">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Bell :size="20" class="text-purple-600" />
              </div>
              <p class="text-sm text-gray-600">Sirènes</p>
            </div>
            <p class="text-3xl font-bold text-gray-900">{{ ecole.sites?.length || 0 }}</p>
          </div>

          <div class="bg-white rounded-xl p-6 border border-gray-200">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle :size="20" class="text-green-600" />
              </div>
              <p class="text-sm text-gray-600">Abonnements actifs</p>
            </div>
            <p class="text-3xl font-bold text-gray-900">{{ ecole.abonnementActif ? 1 : 0 }}</p>
          </div>

          <div class="bg-white rounded-xl p-6 border border-gray-200">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <FileText :size="20" class="text-orange-600" />
              </div>
              <p class="text-sm text-gray-600">Référence</p>
            </div>
            <p class="text-lg font-mono font-bold text-gray-900">{{ ecole.reference }}</p>
          </div>
        </div>

        <!-- Tous les Sites (Principal + Annexes) -->
        <div v-if="ecole.sites && ecole.sites.length > 0" class="bg-white rounded-xl border border-gray-200">
          <div class="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-bold text-gray-900 flex items-center gap-2">
                <MapPin :size="24" class="text-blue-600" />
                Sites de l'école
              </h3>
              <span class="text-sm font-semibold text-gray-600">
                {{ ecole.sites.length }} site{{ ecole.sites.length > 1 ? 's' : '' }}
              </span>
            </div>
          </div>

          <div class="p-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div
                v-for="site in ecole.sites"
                :key="site.id"
                class="bg-white rounded-xl p-6 border-2 hover:shadow-lg transition-all"
                :class="site.est_principale ? 'border-blue-300 bg-blue-50/30' : 'border-gray-200'"
              >
                <!-- Header -->
                <div class="flex items-start justify-between mb-4">
                  <div class="flex items-start gap-3 flex-1">
                    <div
                      class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      :class="site.est_principale ? 'bg-blue-100' : 'bg-green-100'"
                    >
                      <Building2
                        :size="20"
                        :class="site.est_principale ? 'text-blue-600' : 'text-green-600'"
                      />
                    </div>
                    <div class="flex-1">
                      <h4 class="font-bold text-gray-900 mb-1">{{ site.nom }}</h4>
                      <span
                        v-if="site.est_principale"
                        class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700"
                      >
                        <Star :size="12" />
                        Site Principal
                      </span>
                      <span
                        v-else
                        class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700"
                      >
                        Site Annexe
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Details -->
                <div class="space-y-3 mb-4">
                  <div class="flex items-start gap-2 text-sm">
                    <MapPin :size="16" class="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div class="flex-1">
                      <p class="text-gray-600">{{ site.adresse }}</p>
                      <p v-if="site.ville" class="text-gray-500 text-xs mt-1">{{ site.ville.nom }}</p>
                    </div>
                  </div>

                  <div v-if="site.latitude && site.longitude" class="flex items-center gap-2 text-sm text-gray-600">
                    <Navigation :size="16" class="text-gray-400 flex-shrink-0" />
                    <span class="font-mono text-xs">
                      {{ site.latitude.toFixed(6) }}, {{ site.longitude.toFixed(6) }}
                    </span>
                  </div>
                </div>

                <!-- Sirène installée -->
                <div
                  v-if="site.sirene"
                  class="mt-4 pt-4 border-t border-gray-200"
                >
                  <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                    <div class="flex items-center gap-3 mb-3">
                      <div class="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Bell :size="20" class="text-white" />
                      </div>
                      <div class="flex-1">
                        <p class="text-xs text-purple-600 font-semibold">Sirène installée</p>
                        <p class="text-base font-bold text-purple-900">{{ site.sirene.numero_serie }}</p>
                      </div>
                      <span
                        :class="[
                          'px-2 py-1 rounded-full font-semibold text-xs flex-shrink-0',
                          site.sirene.statut === 'DISPONIBLE' ? 'bg-green-100 text-green-700' :
                          site.sirene.statut === 'EN_SERVICE' ? 'bg-blue-100 text-blue-700' :
                          'bg-red-100 text-red-700'
                        ]"
                      >
                        {{ site.sirene.statut }}
                      </span>
                    </div>

                    <div v-if="site.sirene.modele" class="text-xs text-gray-600">
                      <span class="font-semibold">Modèle:</span> {{ site.sirene.modele.nom }}
                    </div>
                  </div>
                </div>

                <!-- No Sirene -->
                <div v-else class="mt-4 pt-4 border-t border-gray-200">
                  <div class="bg-gray-50 rounded-lg p-3 border border-gray-200 flex items-center gap-2">
                    <AlertCircle :size="16" class="text-gray-400" />
                    <span class="text-sm text-gray-600">Aucune sirène installée</span>
                  </div>
                </div>

                <!-- Footer -->
                <div class="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <p class="text-xs text-gray-500">
                    <span v-if="site.created_at">Créé le {{ formatDate(site.created_at) }}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="bg-white rounded-xl p-12 text-center border border-gray-200">
        <Building2 :size="64" class="text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">École introuvable</h3>
        <p class="text-gray-600 mb-4">Impossible de charger les informations de cette école</p>
        <button
          @click="goBack"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retour à la liste
        </button>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import DashboardLayout from '../components/layout/DashboardLayout.vue'
import {
  Building2, MapPin, Phone, Mail, ArrowLeft, Info, User,
  Calendar, Bell, CheckCircle, FileText, Hash, Star, Navigation, AlertCircle
} from 'lucide-vue-next'
import ecoleService, { type Ecole } from '../services/ecoleService'
import { useNotificationStore } from '../stores/notifications'

const router = useRouter()
const route = useRoute()
const notificationStore = useNotificationStore()

const ecole = ref<Ecole | null>(null)
const loading = ref(true)

const sitesAnnexes = computed(() => {
  return ecole.value?.sites?.filter(site => !site.est_principale) || []
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const loadEcole = async () => {
  loading.value = true
  try {
    const ecoleId = route.params.id as string
    const response = await ecoleService.getById(ecoleId)

    if (response.success && response.data) {
      ecole.value = response.data
    } else {
      notificationStore.error('Erreur', 'École introuvable')
    }
  } catch (error: any) {
    console.error('Failed to load ecole:', error)
    notificationStore.error('Erreur', 'Impossible de charger les détails de l\'école')
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/schools')
}

onMounted(() => {
  loadEcole()
})
</script>
