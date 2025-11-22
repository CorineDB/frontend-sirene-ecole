<template>
  <DashboardLayout>
    <div class="p-6 space-y-6">
      <!-- Header with back button -->
      <div class="flex items-center gap-4">
        <button
          @click="router.back()"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft :size="24" class="text-gray-600" />
        </button>
        <div class="flex-1">
          <div class="flex items-center gap-3">
            <h1 class="text-3xl font-bold text-gray-900">{{ ordreMission?.numero_ordre }}</h1>
            <StatusBadge v-if="ordreMission" type="ordre-mission" :status="ordreMission.statut" />
          </div>
          <p class="text-gray-600 mt-1">Détails de l'ordre de mission</p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center h-96">
        <div class="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>

      <!-- Error State -->
      <div v-if="hasError" class="bg-red-50 border border-red-200 rounded-xl p-4">
        <div class="flex items-center gap-3">
          <AlertCircle :size="24" class="text-red-600" />
          <div>
            <h3 class="font-semibold text-red-900">Erreur</h3>
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <div v-if="!isLoading && !hasError && ordreMission">
        <!-- Main Info Card -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Informations générales</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p class="text-sm text-gray-600 mb-1">Numéro d'ordre</p>
              <p class="font-semibold text-gray-900">{{ ordreMission.numero_ordre }}</p>
            </div>

            <div>
              <p class="text-sm text-gray-600 mb-1">Statut</p>
              <StatusBadge type="ordre-mission" :status="ordreMission.statut" />
            </div>

            <div>
              <p class="text-sm text-gray-600 mb-1">Techniciens requis</p>
              <p class="font-semibold text-gray-900">{{ ordreMission.nombre_techniciens_requis }}</p>
            </div>

            <div v-if="ordreMission.nombre_techniciens_acceptes !== undefined">
              <p class="text-sm text-gray-600 mb-1">Techniciens acceptés</p>
              <p class="font-semibold text-gray-900">{{ ordreMission.nombre_techniciens_acceptes }}</p>
            </div>

            <div v-if="ordreMission.ville">
              <p class="text-sm text-gray-600 mb-1">Ville</p>
              <div class="flex items-center gap-2">
                <MapPin :size="16" class="text-gray-400" />
                <p class="font-semibold text-gray-900">{{ ordreMission.ville.nom }}</p>
              </div>
            </div>

            <div v-if="ordreMission.valide_par_user">
              <p class="text-sm text-gray-600 mb-1">Validé par</p>
              <div class="flex items-center gap-2">
                <User :size="16" class="text-gray-400" />
                <p class="font-semibold text-gray-900">{{ ordreMission.valide_par_user.nom_utilisateur }}</p>
              </div>
            </div>

            <div v-if="ordreMission.date_debut_candidature">
              <p class="text-sm text-gray-600 mb-1">Début candidatures</p>
              <div class="flex items-center gap-2">
                <Calendar :size="16" class="text-gray-400" />
                <p class="font-semibold text-gray-900">{{ formatDate(ordreMission.date_debut_candidature) }}</p>
              </div>
            </div>

            <div v-if="ordreMission.date_fin_candidature">
              <p class="text-sm text-gray-600 mb-1">Fin candidatures</p>
              <div class="flex items-center gap-2">
                <Calendar :size="16" class="text-gray-400" />
                <p class="font-semibold text-gray-900">{{ formatDate(ordreMission.date_fin_candidature) }}</p>
              </div>
            </div>

            <div v-if="ordreMission.created_at">
              <p class="text-sm text-gray-600 mb-1">Créé le</p>
              <p class="font-semibold text-gray-900">{{ formatDate(ordreMission.created_at) }}</p>
            </div>
          </div>

          <div v-if="ordreMission.commentaire" class="mt-6">
            <p class="text-sm text-gray-600 mb-2">Commentaire</p>
            <p class="text-gray-900">{{ ordreMission.commentaire }}</p>
          </div>
        </div>

        <!-- Panne Info Card -->
        <div v-if="ordreMission.panne" class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Panne associée</h2>

          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle :size="24" class="text-orange-600" />
            </div>

            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <h3 class="font-bold text-gray-900">{{ ordreMission.panne.titre }}</h3>
                <StatusBadge type="panne" :status="ordreMission.panne.statut" />
                <StatusBadge type="priorite" :status="ordreMission.panne.priorite" />
              </div>

              <p v-if="ordreMission.panne.description" class="text-sm text-gray-700 mb-3">
                {{ ordreMission.panne.description }}
              </p>

              <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div v-if="ordreMission.panne.ecole">
                  <p class="text-xs text-gray-600">École</p>
                  <p class="text-sm font-semibold text-gray-900">{{ ordreMission.panne.ecole.nom }}</p>
                </div>

                <div v-if="ordreMission.panne.site">
                  <p class="text-xs text-gray-600">Site</p>
                  <p class="text-sm font-semibold text-gray-900">{{ ordreMission.panne.site.nom }}</p>
                </div>

                <div v-if="ordreMission.panne.sirene">
                  <p class="text-xs text-gray-600">Sirène</p>
                  <p class="text-sm font-semibold text-gray-900">{{ ordreMission.panne.sirene.numero_serie }}</p>
                </div>
              </div>

              <button
                @click="router.push(`/pannes/${ordreMission.panne.id}`)"
                class="mt-4 text-sm text-blue-600 hover:text-blue-700 font-semibold"
              >
                Voir détails de la panne →
              </button>
            </div>
          </div>
        </div>

        <!-- Candidatures Section -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-900">
              Candidatures ({{ candidatures.length }})
            </h2>

            <div class="flex gap-2">
              <button
                v-if="ordreMission.statut === StatutOrdreMission.EN_ATTENTE || ordreMission.statut === StatutOrdreMission.EN_COURS"
                @click="handleCloturerCandidatures"
                class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold transition-colors"
              >
                <Lock :size="16" class="inline mr-2" />
                Clôturer candidatures
              </button>

              <button
                v-if="ordreMission.statut === StatutOrdreMission.CLOTURE"
                @click="handleRouvrirCandidatures"
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
              >
                <Unlock :size="16" class="inline mr-2" />
                Rouvrir candidatures
              </button>
            </div>
          </div>

          <!-- Candidatures List -->
          <div v-if="hasCandidatures" class="space-y-4">
            <div
              v-for="candidature in candidatures"
              :key="candidature.id"
              class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-start justify-between">
                <div class="flex items-start gap-3 flex-1">
                  <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <User :size="20" class="text-blue-600" />
                  </div>

                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <h4 class="font-semibold text-gray-900">
                        {{ candidature.technicien?.nom || 'Technicien inconnu' }}
                      </h4>
                      <StatusBadge type="candidature" :status="candidature.statut_candidature" />
                    </div>

                    <div class="text-sm text-gray-600 space-y-1">
                      <p v-if="candidature.date_candidature">
                        Candidature soumise le {{ formatDate(candidature.date_candidature) }}
                      </p>
                      <p v-if="candidature.date_acceptation">
                        Acceptée le {{ formatDate(candidature.date_acceptation) }}
                      </p>
                      <p v-if="candidature.date_refus">
                        Refusée le {{ formatDate(candidature.date_refus) }}
                      </p>
                      <p v-if="candidature.motif_refus" class="text-red-600">
                        Motif: {{ candidature.motif_refus }}
                      </p>
                      <p v-if="candidature.motif_retrait" class="text-orange-600">
                        Retrait: {{ candidature.motif_retrait }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <div v-if="candidature.statut_candidature === 'en_attente'" class="flex gap-2 ml-4">
                  <button
                    @click="handleAccepterCandidature(candidature.id)"
                    class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-semibold"
                  >
                    <Check :size="16" class="inline" />
                    Accepter
                  </button>
                  <button
                    @click="handleRefuserCandidature(candidature.id)"
                    class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-semibold"
                  >
                    <X :size="16" class="inline" />
                    Refuser
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-12">
            <Users :size="48" class="text-gray-300 mx-auto mb-3" />
            <p class="text-gray-600">Aucune candidature pour le moment</p>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import DashboardLayout from '../components/layout/DashboardLayout.vue'
import StatusBadge from '../components/common/StatusBadge.vue'
import { useOrdresMission } from '@/composables/useOrdresMission'
import { useInterventions } from '@/composables/useInterventions'
import { StatutOrdreMission } from '@/types/api'
import {
  ArrowLeft,
  AlertCircle,
  AlertTriangle,
  MapPin,
  User,
  Users,
  Calendar,
  Lock,
  Unlock,
  Check,
  X
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()

// Composables
const {
  ordreMission,
  candidatures,
  isLoading,
  hasError,
  error,
  hasCandidatures,
  fetchById,
  fetchCandidatures,
  cloturerCandidatures,
  rouvrirCandidatures
} = useOrdresMission()

const {
  accepterCandidature,
  refuserCandidature
} = useInterventions()

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleCloturerCandidatures = async () => {
  if (confirm('Êtes-vous sûr de vouloir clôturer les candidatures pour cet ordre de mission ?')) {
    const adminId = prompt('ID Admin:')
    if (adminId) {
      await cloturerCandidatures(route.params.id as string, adminId)
      await fetchById(route.params.id as string)
    }
  }
}

const handleRouvrirCandidatures = async () => {
  if (confirm('Êtes-vous sûr de vouloir rouvrir les candidatures pour cet ordre de mission ?')) {
    const adminId = prompt('ID Admin:')
    if (adminId) {
      await rouvrirCandidatures(route.params.id as string, adminId)
      await fetchById(route.params.id as string)
    }
  }
}

const handleAccepterCandidature = async (missionTechnicienId: string) => {
  const adminId = prompt('ID Admin:')
  if (adminId) {
    try {
      await accepterCandidature(missionTechnicienId, { admin_id: adminId })
      await fetchCandidatures(route.params.id as string)
      await fetchById(route.params.id as string)
    } catch (err) {
      console.error('Error accepting candidature:', err)
    }
  }
}

const handleRefuserCandidature = async (missionTechnicienId: string) => {
  const motifRefus = prompt('Motif du refus:')
  const adminId = prompt('ID Admin:')

  if (motifRefus && adminId) {
    try {
      await refuserCandidature(missionTechnicienId, {
        motif_refus: motifRefus,
        admin_id: adminId
      })
      await fetchCandidatures(route.params.id as string)
      await fetchById(route.params.id as string)
    } catch (err) {
      console.error('Error refusing candidature:', err)
    }
  }
}

// Lifecycle
onMounted(async () => {
  const id = route.params.id as string
  await fetchById(id)
  await fetchCandidatures(id)
})
</script>
