<template>
  <DashboardLayout>
    <div class="p-6 space-y-6">
      <!-- Header with back button -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <div class="flex items-center gap-4">
          <button
            @click="router.back()"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft :size="24" class="text-gray-600" />
          </button>
          <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
            <Briefcase :size="32" class="text-white" />
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-1">
              <h1 class="text-3xl font-bold text-gray-900">{{ ordreMission?.numero_ordre }}</h1>
            </div>
            <div class="flex items-center gap-2">
              <StatusBadge v-if="ordreMission" type="ordre-mission" :status="ordreMission.statut" />
              <span v-if="ordreMission?.panne" :class="`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityBadgeClass(ordreMission.panne.priorite)}`">
                Priorité: {{ getPriorityLabel(ordreMission.panne.priorite) }}
              </span>
            </div>
          </div>
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
        <!-- Grid Layout for Info Cards -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left Column - Main Info + Timeline -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Main Info Card -->
            <div class="bg-white rounded-xl border border-gray-200 p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-6">Informations générales</h2>

              <div class="space-y-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <Users :size="20" class="text-blue-600" />
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Techniciens</p>
                    <p class="font-semibold text-gray-900">
                      {{ ordreMission.nombre_techniciens_acceptes || 0 }} / {{ ordreMission.nombre_techniciens_requis }} requis
                    </p>
                  </div>
                </div>

                <div v-if="ordreMission.ville" class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                    <MapPin :size="20" class="text-purple-600" />
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Localisation</p>
                    <p class="font-semibold text-gray-900">{{ ordreMission.ville.nom }}</p>
                  </div>
                </div>

                <div v-if="ordreMission.date_debut_candidature && ordreMission.date_fin_candidature" class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                    <Calendar :size="20" class="text-green-600" />
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Période candidatures</p>
                    <p class="font-semibold text-gray-900 text-sm">
                      {{ formatDateShort(ordreMission.date_debut_candidature) }} - {{ formatDateShort(ordreMission.date_fin_candidature) }}
                    </p>
                  </div>
                </div>

                <div v-if="ordreMission.valide_par_user" class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                    <User :size="20" class="text-orange-600" />
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Validé par</p>
                    <p class="font-semibold text-gray-900">{{ ordreMission.valide_par_user.nom_utilisateur }}</p>
                  </div>
                </div>
              </div>

              <div v-if="ordreMission.commentaire" class="mt-6 p-4 bg-gray-50 rounded-lg">
                <p class="text-sm text-gray-600 mb-1 font-semibold">Commentaire</p>
                <p class="text-gray-900">{{ ordreMission.commentaire }}</p>
              </div>
            </div>

            <!-- Timeline Card -->
            <div class="bg-white rounded-xl border border-gray-200 p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-6">Progression</h2>

              <div class="space-y-4">
                <div class="flex gap-4">
                  <div class="flex flex-col items-center">
                    <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <Check :size="16" class="text-white" />
                    </div>
                    <div class="w-0.5 h-full bg-gray-200 mt-2"></div>
                  </div>
                  <div class="pb-8 flex-1">
                    <p class="font-semibold text-gray-900">Ordre créé</p>
                    <p class="text-sm text-gray-600">{{ formatDate(ordreMission.created_at) }}</p>
                  </div>
                </div>

                <div v-if="ordreMission.date_debut_candidature" class="flex gap-4">
                  <div class="flex flex-col items-center">
                    <div :class="`w-8 h-8 rounded-full flex items-center justify-center ${isStatusReached('candidatures_ouvertes') ? 'bg-gradient-to-br from-green-500 to-green-600' : 'bg-gray-200'}`">
                      <Check v-if="isStatusReached('candidatures_ouvertes')" :size="16" class="text-white" />
                      <div v-else class="w-2 h-2 bg-gray-400 rounded-full"></div>
                    </div>
                    <div class="w-0.5 h-full bg-gray-200 mt-2"></div>
                  </div>
                  <div class="pb-8 flex-1">
                    <p class="font-semibold text-gray-900">Candidatures ouvertes</p>
                    <p class="text-sm text-gray-600">{{ formatDate(ordreMission.date_debut_candidature) }}</p>
                  </div>
                </div>

                <div class="flex gap-4">
                  <div class="flex flex-col items-center">
                    <div :class="`w-8 h-8 rounded-full flex items-center justify-center ${isStatusReached('en_cours') ? 'bg-gradient-to-br from-cyan-500 to-cyan-600' : 'bg-gray-200'}`">
                      <Check v-if="isStatusReached('en_cours')" :size="16" class="text-white" />
                      <div v-else class="w-2 h-2 bg-gray-400 rounded-full"></div>
                    </div>
                    <div class="w-0.5 h-full bg-gray-200 mt-2"></div>
                  </div>
                  <div class="pb-8 flex-1">
                    <p class="font-semibold text-gray-900">En cours</p>
                    <p class="text-sm text-gray-600">
                      {{ ordreMission.statut === StatutOrdreMission.EN_COURS ? 'Actuellement' : 'En attente' }}
                    </p>
                  </div>
                </div>

                <div class="flex gap-4">
                  <div class="flex flex-col items-center">
                    <div :class="`w-8 h-8 rounded-full flex items-center justify-center ${isStatusReached('termine') ? 'bg-gradient-to-br from-green-500 to-green-600' : 'bg-gray-200'}`">
                      <Check v-if="isStatusReached('termine')" :size="16" class="text-white" />
                      <div v-else class="w-2 h-2 bg-gray-400 rounded-full"></div>
                    </div>
                  </div>
                  <div class="flex-1">
                    <p class="font-semibold text-gray-900">Terminé</p>
                    <p class="text-sm text-gray-600">
                      {{ ordreMission.statut === StatutOrdreMission.TERMINE ? 'Complété' : 'En attente' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column - Actions -->
          <div class="space-y-6">
            <!-- Actions Card -->
            <div class="bg-white rounded-xl border border-gray-200 p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4">Actions</h2>

              <div class="space-y-3">
                <button
                  v-if="ordreMission.statut === StatutOrdreMission.EN_ATTENTE || ordreMission.statut === StatutOrdreMission.EN_COURS"
                  @click="handleCloturerCandidatures"
                  class="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Lock :size="18" />
                  Clôturer candidatures
                </button>

                <button
                  v-if="ordreMission.statut === StatutOrdreMission.CLOTURE"
                  @click="handleRouvrirCandidatures"
                  class="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Unlock :size="18" />
                  Rouvrir candidatures
                </button>
              </div>
            </div>

            <!-- Stats Card -->
            <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
              <p class="text-sm opacity-90 mb-1">Candidatures reçues</p>
              <p class="text-4xl font-bold mb-4">{{ candidatures.length }}</p>
              <div class="text-sm opacity-90">
                <p>{{ intervenants.length }} acceptée(s)</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Panne Info Card -->
        <div v-if="ordreMission.panne" class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-6">Panne associée</h2>

          <div class="flex items-start gap-4">
            <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-md">
              <AlertTriangle :size="28" class="text-white" />
            </div>

            <div class="flex-1">
              <div class="flex items-center gap-2 mb-3">
                <h3 class="text-lg font-bold text-gray-900">{{ ordreMission.panne.titre }}</h3>
              </div>

              <div class="flex items-center gap-2 mb-3">
                <StatusBadge type="panne" :status="ordreMission.panne.statut" />
                <span :class="`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityBadgeClass(ordreMission.panne.priorite)}`">
                  {{ getPriorityLabel(ordreMission.panne.priorite) }}
                </span>
              </div>

              <p v-if="ordreMission.panne.description" class="text-sm text-gray-700 mb-4 p-3 bg-gray-50 rounded-lg">
                {{ ordreMission.panne.description }}
              </p>

              <div class="space-y-3">
                <div v-if="ordreMission.panne.ecole" class="flex items-center gap-3">
                  <MapPin :size="18" class="text-gray-400" />
                  <div>
                    <p class="text-xs text-gray-600">École</p>
                    <p class="text-sm font-semibold text-gray-900">{{ ordreMission.panne.ecole.nom }}</p>
                  </div>
                </div>

                <div v-if="ordreMission.panne.site" class="flex items-center gap-3">
                  <MapPin :size="18" class="text-gray-400" />
                  <div>
                    <p class="text-xs text-gray-600">Site</p>
                    <p class="text-sm font-semibold text-gray-900">{{ ordreMission.panne.site.nom }}</p>
                  </div>
                </div>

                <div v-if="ordreMission.panne.sirene" class="flex items-center gap-3">
                  <AlertCircle :size="18" class="text-gray-400" />
                  <div>
                    <p class="text-xs text-gray-600">Sirène</p>
                    <p class="text-sm font-semibold text-gray-900">{{ ordreMission.panne.sirene.numero_serie }}</p>
                  </div>
                </div>
              </div>

              <button
                @click="router.push(`/pannes/${ordreMission.panne.id}`)"
                class="mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                Voir détails de la panne
                <ExternalLink :size="14" />
              </button>
            </div>
          </div>
        </div>

        <!-- Intervenants Section -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Users :size="24" class="text-blue-600" />
            Intervenants ({{ intervenants.length }})
          </h2>

          <div v-if="hasIntervenants" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="intervenant in intervenants"
              :key="intervenant.id"
              class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
                  <User :size="24" class="text-white" />
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-2">
                    <h4 class="font-semibold text-gray-900 truncate">
                      {{ intervenant.technicien?.nom || 'Technicien' }}
                    </h4>
                    <StatusBadge type="candidature" :status="intervenant.statut_candidature" />
                  </div>
                  <div class="text-sm text-gray-600 space-y-1">
                    <p v-if="intervenant.technicien?.email" class="truncate">
                      {{ intervenant.technicien.email }}
                    </p>
                    <p v-if="intervenant.technicien?.telephone">
                      {{ intervenant.technicien.telephone }}
                    </p>
                    <p v-if="intervenant.date_acceptation" class="text-green-600 font-medium">
                      ✓ Accepté le {{ formatDateShort(intervenant.date_acceptation) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-12 text-gray-500">
            <Users :size="48" class="text-gray-300 mx-auto mb-3" />
            <p class="font-medium">Aucun technicien assigné</p>
            <p class="text-sm mt-1">Les techniciens acceptés apparaîtront ici</p>
          </div>
        </div>

        <!-- Interventions Section -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Wrench :size="24" class="text-orange-600" />
            Interventions ({{ interventions.length }})
          </h2>

          <div v-if="hasInterventions" class="space-y-4">
            <div
              v-for="intervention in interventions"
              :key="intervention.id"
              class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
              @click="router.push(`/interventions/${intervention.id}`)"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-3">
                    <StatusBadge type="intervention" :status="intervention.statut" />
                    <span v-if="intervention.date_intervention" class="text-sm font-semibold text-gray-700">
                      {{ formatDateShort(intervention.date_intervention) }}
                    </span>
                  </div>

                  <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-3">
                    <div v-if="intervention.type_intervention" class="flex items-center gap-2">
                      <Wrench :size="16" class="text-gray-400" />
                      <div>
                        <p class="text-xs text-gray-600">Type</p>
                        <p class="font-semibold text-gray-900">{{ intervention.type_intervention }}</p>
                      </div>
                    </div>

                    <div v-if="intervention.technicien" class="flex items-center gap-2">
                      <User :size="16" class="text-gray-400" />
                      <div>
                        <p class="text-xs text-gray-600">Technicien</p>
                        <p class="font-semibold text-gray-900">{{ intervention.technicien.nom }}</p>
                      </div>
                    </div>

                    <div v-if="intervention.date_debut" class="flex items-center gap-2">
                      <Calendar :size="16" class="text-gray-400" />
                      <div>
                        <p class="text-xs text-gray-600">Début</p>
                        <p class="font-semibold text-gray-900">{{ formatDateShort(intervention.date_debut) }}</p>
                      </div>
                    </div>
                  </div>

                  <p v-if="intervention.instructions" class="text-sm text-gray-700 bg-gray-50 rounded p-2">
                    {{ intervention.instructions }}
                  </p>
                </div>

                <button
                  @click.stop="router.push(`/interventions/${intervention.id}`)"
                  class="ml-4 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <ExternalLink :size="14" />
                  Détails
                </button>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-12 text-gray-500">
            <Wrench :size="48" class="text-gray-300 mx-auto mb-3" />
            <p class="font-medium">Aucune intervention planifiée</p>
            <p class="text-sm mt-1">Les interventions seront affichées ici</p>
          </div>
        </div>

        <!-- Candidatures Section -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-6">
            Candidatures ({{ candidatures.length }})
          </h2>

          <!-- Candidatures List -->
          <div v-if="hasCandidatures" class="space-y-4">
            <div
              v-for="candidature in candidatures"
              :key="candidature.id"
              class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="flex items-start gap-3 flex-1">
                  <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
                    <User :size="24" class="text-white" />
                  </div>

                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-2">
                      <h4 class="font-semibold text-gray-900 truncate">
                        {{ candidature.technicien?.nom || 'Technicien inconnu' }}
                      </h4>
                      <StatusBadge type="candidature" :status="candidature.statut_candidature" />
                    </div>

                    <div class="text-sm text-gray-600 space-y-1">
                      <p v-if="candidature.date_candidature" class="flex items-center gap-2">
                        <Calendar :size="14" />
                        Soumise le {{ formatDateShort(candidature.date_candidature) }}
                      </p>
                      <p v-if="candidature.date_acceptation" class="text-green-600 font-medium flex items-center gap-2">
                        <Check :size="14" />
                        Acceptée le {{ formatDateShort(candidature.date_acceptation) }}
                      </p>
                      <p v-if="candidature.date_refus" class="text-red-600 font-medium flex items-center gap-2">
                        <X :size="14" />
                        Refusée le {{ formatDateShort(candidature.date_refus) }}
                      </p>
                      <p v-if="candidature.motif_refus" class="text-red-600 bg-red-50 rounded px-2 py-1">
                        Motif: {{ candidature.motif_refus }}
                      </p>
                      <p v-if="candidature.motif_retrait" class="text-orange-600 bg-orange-50 rounded px-2 py-1">
                        Retrait: {{ candidature.motif_retrait }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <div v-if="candidature.statut_candidature === 'en_attente'" class="flex flex-col gap-2">
                  <button
                    @click="handleAccepterCandidature(candidature.id)"
                    class="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2 whitespace-nowrap"
                  >
                    <Check :size="16" />
                    Accepter
                  </button>
                  <button
                    @click="handleRefuserCandidature(candidature.id)"
                    class="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2 whitespace-nowrap"
                  >
                    <X :size="16" />
                    Refuser
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-12">
            <Users :size="48" class="text-gray-300 mx-auto mb-3" />
            <p class="font-medium text-gray-600">Aucune candidature pour le moment</p>
            <p class="text-sm text-gray-500 mt-1">Les candidatures des techniciens apparaîtront ici</p>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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
  X,
  Wrench,
  ExternalLink,
  Briefcase
} from 'lucide-vue-next'
import { PrioritePanne } from '@/types/api'

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

// Computed
const interventions = computed(() => {
  return ordreMission.value?.interventions || []
})

const intervenants = computed(() => {
  // Get accepted candidatures (missions_techniciens with statut_candidature === 'acceptee')
  if (!ordreMission.value?.missions_techniciens) return []

  return ordreMission.value.missions_techniciens.filter(
    (mt: any) => mt.statut_candidature === 'acceptee'
  )
})

const hasInterventions = computed(() => interventions.value.length > 0)
const hasIntervenants = computed(() => intervenants.value.length > 0)

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

const formatDateShort = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const getPriorityLabel = (priorite: string): string => {
  const labels: Record<string, string> = {
    [PrioritePanne.BASSE]: 'Basse',
    [PrioritePanne.MOYENNE]: 'Moyenne',
    [PrioritePanne.HAUTE]: 'Haute',
    [PrioritePanne.URGENTE]: 'Urgente',
    'faible': 'Basse',
    'moyenne': 'Moyenne',
    'haute': 'Haute',
    'urgente': 'Urgente'
  }
  return labels[priorite] || priorite
}

const getPriorityBadgeClass = (priorite: string): string => {
  const classes: Record<string, string> = {
    [PrioritePanne.BASSE]: 'bg-gray-100 text-gray-800',
    [PrioritePanne.MOYENNE]: 'bg-yellow-100 text-yellow-800',
    [PrioritePanne.HAUTE]: 'bg-orange-100 text-orange-800',
    [PrioritePanne.URGENTE]: 'bg-red-100 text-red-800',
    'faible': 'bg-gray-100 text-gray-800',
    'moyenne': 'bg-yellow-100 text-yellow-800',
    'haute': 'bg-orange-100 text-orange-800',
    'urgente': 'bg-red-100 text-red-800'
  }
  return classes[priorite] || 'bg-gray-100 text-gray-800'
}

const isStatusReached = (status: string): boolean => {
  if (!ordreMission.value) return false

  const statusOrder = ['candidatures_ouvertes', 'en_cours', 'termine']
  const currentStatusIndex = statusOrder.indexOf(
    ordreMission.value.statut === StatutOrdreMission.TERMINE ? 'termine' :
    ordreMission.value.statut === StatutOrdreMission.EN_COURS ? 'en_cours' :
    'candidatures_ouvertes'
  )
  const targetStatusIndex = statusOrder.indexOf(status)

  return currentStatusIndex >= targetStatusIndex
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
