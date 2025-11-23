<template>
  <DashboardLayout>
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Mon école</h1>
          <p class="text-gray-600 mt-1">Gérer les informations de votre établissement</p>
        </div>
        <button
          @click="handleRefresh"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors flex items-center gap-2"
        >
          <RefreshCw :size="18" :class="{ 'animate-spin': loading }" />
          Actualiser
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading && !ecole" class="flex items-center justify-center h-96">
        <div class="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>

      <!-- Error State -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-xl p-4">
        <div class="flex items-center gap-3">
          <AlertCircle :size="24" class="text-red-600" />
          <div>
            <h3 class="font-semibold text-red-900">Erreur</h3>
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div v-if="!loading && ecole" class="space-y-6">
        <!-- Main Info Card -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <div class="flex items-start justify-between mb-6">
            <div>
              <h2 class="text-xl font-bold text-gray-900 mb-2">Informations générales</h2>
              <span
                :class="getStatutClass(ecole.statut)"
                class="px-3 py-1 rounded-full text-sm font-semibold"
              >
                {{ ecole.statut }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p class="text-sm text-gray-600 mb-1">Nom complet</p>
              <p class="text-lg font-semibold text-gray-900">{{ ecole.nom_complet }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600 mb-1">Nom court</p>
              <p class="text-lg font-semibold text-gray-900">{{ ecole.nom }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600 mb-1">Référence</p>
              <p class="font-mono text-lg font-semibold text-gray-900">{{ ecole.reference }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600 mb-1">Code établissement</p>
              <p class="font-mono text-lg font-semibold text-gray-900">{{ ecole.code_etablissement }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600 mb-1">Téléphone contact</p>
              <p class="text-gray-900">{{ ecole.telephone_contact }}</p>
            </div>
            <div v-if="ecole.email_contact">
              <p class="text-sm text-gray-600 mb-1">Email contact</p>
              <p class="text-gray-900">{{ ecole.email_contact }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600 mb-1">Date d'inscription</p>
              <p class="text-gray-900">{{ formatDate(ecole.date_inscription) }}</p>
            </div>
            <div v-if="ecole.types_etablissement && ecole.types_etablissement.length > 0">
              <p class="text-sm text-gray-600 mb-1">Types d'établissement</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="type in ecole.types_etablissement"
                  :key="type"
                  class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-semibold"
                >
                  {{ type }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Responsable Info -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User :size="24" class="text-blue-600" />
            Responsable
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p class="text-sm text-gray-600 mb-1">Nom</p>
              <p class="text-lg font-semibold text-gray-900">{{ ecole.responsable_nom }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600 mb-1">Prénom</p>
              <p class="text-lg font-semibold text-gray-900">{{ ecole.responsable_prenom }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600 mb-1">Téléphone</p>
              <p class="text-gray-900">{{ ecole.responsable_telephone }}</p>
            </div>
          </div>
        </div>

        <!-- Site Principal -->
        <div v-if="ecole.site_principal" class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin :size="24" class="text-green-600" />
            Site principal
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-600 mb-1">Nom du site</p>
              <p class="text-lg font-semibold text-gray-900">{{ ecole.site_principal.nom }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600 mb-1">Adresse</p>
              <p class="text-gray-900">{{ ecole.site_principal.adresse }}</p>
            </div>
            <div v-if="ecole.site_principal.ville">
              <p class="text-sm text-gray-600 mb-1">Ville</p>
              <p class="text-gray-900">{{ ecole.site_principal.ville.nom }}</p>
            </div>
            <div v-if="ecole.site_principal.sirene">
              <p class="text-sm text-gray-600 mb-1">Sirène</p>
              <p class="font-mono text-gray-900">{{ ecole.site_principal.sirene.numero_serie }}</p>
            </div>
          </div>
        </div>

        <!-- Sites Annexes -->
        <div v-if="ecole.sites_annexe && ecole.sites_annexe.length > 0" class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 :size="24" class="text-purple-600" />
            Sites annexes ({{ ecole.sites_annexe.length }})
          </h2>
          <div class="space-y-3">
            <div
              v-for="site in ecole.sites_annexe"
              :key="site.id"
              class="border border-gray-200 rounded-lg p-4"
            >
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p class="text-sm text-gray-600 mb-1">Nom</p>
                  <p class="font-semibold text-gray-900">{{ site.nom }}</p>
                </div>
                <div v-if="site.adresse">
                  <p class="text-sm text-gray-600 mb-1">Adresse</p>
                  <p class="text-gray-900">{{ site.adresse }}</p>
                </div>
                <div v-if="site.sirene">
                  <p class="text-sm text-gray-600 mb-1">Sirène</p>
                  <p class="font-mono text-gray-900">{{ site.sirene.numero_serie }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Abonnement Actif -->
        <div v-if="ecole.abonnement_actif || ecole.abonnementActif" class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard :size="24" class="text-green-600" />
            Abonnement actif
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-600 mb-1">Numéro</p>
              <p class="font-mono text-lg font-semibold text-gray-900">{{ (ecole.abonnement_actif || ecole.abonnementActif)?.numero_abonnement }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600 mb-1">Montant</p>
              <p class="text-lg font-semibold text-gray-900">{{ (ecole.abonnement_actif || ecole.abonnementActif)?.montant }} XOF</p>
            </div>
            <div>
              <p class="text-sm text-gray-600 mb-1">Date de début</p>
              <p class="text-gray-900">{{ formatDate((ecole.abonnement_actif || ecole.abonnementActif)?.date_debut || '') }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600 mb-1">Date de fin</p>
              <p class="text-gray-900">{{ formatDate((ecole.abonnement_actif || ecole.abonnementActif)?.date_fin || '') }}</p>
            </div>
          </div>
          <div class="mt-4">
            <button
              @click="goToAbonnement"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
            >
              Voir les détails
            </button>
          </div>
        </div>

        <!-- No Active Subscription -->
        <div v-else class="bg-orange-50 border border-orange-200 rounded-xl p-6">
          <div class="flex items-start gap-3">
            <AlertCircle :size="24" class="text-orange-600 flex-shrink-0" />
            <div class="flex-1">
              <h3 class="font-semibold text-orange-900 mb-2">Aucun abonnement actif</h3>
              <p class="text-sm text-orange-700 mb-4">
                Vous n'avez pas d'abonnement actif. Veuillez souscrire à un abonnement pour activer vos sirènes.
              </p>
              <button
                @click="goToAbonnements"
                class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold transition-colors"
              >
                Gérer les abonnements
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '../components/layout/DashboardLayout.vue'
import ecoleService, { type Ecole } from '../services/ecoleService'
import { useNotificationStore } from '../stores/notifications'
import {
  RefreshCw,
  AlertCircle,
  User,
  MapPin,
  Building2,
  CreditCard
} from 'lucide-vue-next'

const router = useRouter()
const notificationStore = useNotificationStore()

const ecole = ref<Ecole | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getStatutClass = (statut: string) => {
  switch (statut) {
    case 'actif':
      return 'bg-green-100 text-green-700'
    case 'inactif':
      return 'bg-gray-100 text-gray-700'
    case 'suspendu':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const loadEcoleData = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await ecoleService.getMe()
    if (response.success && response.data) {
      ecole.value = response.data
      console.log('École data loaded:', ecole.value)
    } else {
      error.value = 'Impossible de charger les données de l\'école'
    }
  } catch (err: any) {
    console.error('Error loading ecole data:', err)
    error.value = err.response?.data?.message || 'Une erreur est survenue lors du chargement'
    notificationStore.error('Erreur', error.value)
  } finally {
    loading.value = false
  }
}

const handleRefresh = async () => {
  await loadEcoleData()
  notificationStore.success('Actualisé', 'Les données ont été actualisées')
}

const goToAbonnement = () => {
  const abonnementId = ecole.value?.abonnement_actif?.id || ecole.value?.abonnementActif?.id
  if (abonnementId) {
    router.push(`/abonnements/${abonnementId}`)
  }
}

const goToAbonnements = () => {
  router.push('/subscriptions')
}

onMounted(async () => {
  await loadEcoleData()
})
</script>
