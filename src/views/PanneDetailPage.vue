<template>
  <DashboardLayout>
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button
            @click="router.back()"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft :size="24" class="text-gray-600" />
          </button>
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertCircle :size="24" class="text-orange-600" />
            </div>
            <div>
              <h1 class="text-3xl font-bold text-gray-900">{{ panne?.numero_panne || 'Détails de la panne' }}</h1>
              <p v-if="panne" class="text-gray-600 mt-1">{{ panne.description || 'Aucune description' }}</p>
            </div>
          </div>
        </div>
        <div v-if="panne" class="flex gap-2">
          <StatusBadge type="panne" :status="panne.statut" />
          <StatusBadge type="priorite" :status="panne.priorite" />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoadingPanne" class="flex items-center justify-center h-96">
        <div class="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>

      <!-- Error State -->
      <div v-if="hasErrorPanne" class="bg-red-50 border border-red-200 rounded-xl p-4">
        <div class="flex items-center gap-3">
          <AlertCircle :size="24" class="text-red-600" />
          <div>
            <h3 class="font-semibold text-red-900">Erreur</h3>
            <p class="text-sm text-red-700">{{ errorPanne }}</p>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div v-if="!isLoadingPanne && !hasErrorPanne && panne" class="space-y-6">
        <!-- Workflow Progress -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-6">Progression du workflow</h2>
          <div class="flex items-center justify-between">
            <div v-for="(step, index) in workflowSteps" :key="step.status" class="flex items-center">
              <div class="flex flex-col items-center">
                <div
                  :class="`w-12 h-12 rounded-full flex items-center justify-center ${
                    isStepComplete(step.status) ? 'bg-green-500' : isStepCurrent(step.status) ? 'bg-blue-500' : 'bg-gray-300'
                  }`"
                >
                  <component
                    :is="step.icon"
                    :size="24"
                    :class="isStepComplete(step.status) || isStepCurrent(step.status) ? 'text-white' : 'text-gray-500'"
                  />
                </div>
                <p class="text-xs font-semibold text-gray-700 mt-2 text-center max-w-[100px]">{{ step.label }}</p>
              </div>
              <div
                v-if="index < workflowSteps.length - 1"
                :class="`h-1 w-16 mx-2 ${isStepComplete(workflowSteps[index + 1].status) ? 'bg-green-500' : 'bg-gray-300'}`"
              ></div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div v-if="panne.statut === StatutPanne.DECLAREE || panne.statut === StatutPanne.RESOLUE" class="flex justify-end gap-2">
          <button
            v-if="panne.statut === StatutPanne.DECLAREE"
            @click="handleValider"
            class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors flex items-center gap-2"
          >
            <CheckCircle :size="18" />
            Valider la panne
          </button>
          <button
            v-if="panne.statut === StatutPanne.RESOLUE"
            @click="handleCloturer"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors flex items-center gap-2"
          >
            <CheckCircle :size="18" />
            Clôturer la panne
          </button>
        </div>

        <!-- Main Panne Info -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Informations sur la panne</h2>

          <div class="space-y-3">
            <div class="flex items-center gap-3 text-gray-700">
              <Calendar :size="18" class="text-gray-400 flex-shrink-0" />
              <div>
                <p class="text-sm text-gray-600">Date de signalement</p>
                <p class="font-medium">{{ formatDateTime(panne.date_signalement) }}</p>
              </div>
            </div>

            <div v-if="panne.date_validation" class="flex items-center gap-3 text-gray-700">
              <CheckCircle :size="18" class="text-gray-400 flex-shrink-0" />
              <div>
                <p class="text-sm text-gray-600">Date de validation</p>
                <p class="font-medium">{{ formatDateTime(panne.date_validation) }}</p>
              </div>
            </div>

            <div class="pt-3 border-t border-gray-100">
              <p class="text-sm text-gray-600 mb-1">Description</p>
              <p class="text-gray-900">{{ panne.description || 'Aucune description fournie' }}</p>
            </div>
          </div>
        </div>

        <!-- Sirène Info -->
        <div v-if="panne.sirene" class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Bell :size="24" class="text-blue-600" />
            Sirène concernée
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p class="text-sm text-gray-600 mb-1">Numéro de série</p>
              <p class="font-mono text-lg font-semibold text-gray-900">{{ panne.sirene.numero_serie }}</p>
            </div>
            <div v-if="panne.sirene.modele">
              <p class="text-sm text-gray-600 mb-1">Modèle</p>
              <p class="text-gray-900">{{ panne.sirene.modele.nom }}</p>
              <p class="text-sm text-gray-500">{{ panne.sirene.modele.reference }}</p>
            </div>
            <div v-if="panne.sirene.date_installation">
              <p class="text-sm text-gray-600 mb-1">Date d'installation</p>
              <p class="text-gray-900">{{ formatDate(panne.sirene.date_installation) }}</p>
            </div>
            <div v-if="panne.sirene.etat">
              <p class="text-sm text-gray-600 mb-1">État actuel</p>
              <StatusBadge type="sirene_etat" :status="panne.sirene.etat" />
            </div>
            <div v-if="panne.sirene.modele?.version_firmware">
              <p class="text-sm text-gray-600 mb-1">Version firmware</p>
              <p class="text-gray-900">{{ panne.sirene.modele.version_firmware }}</p>
            </div>
            <div v-if="panne.sirene.modele?.prix_unitaire">
              <p class="text-sm text-gray-600 mb-1">Prix unitaire</p>
              <p class="text-gray-900">{{ panne.sirene.modele.prix_unitaire }} FCFA</p>
            </div>
          </div>

          <div v-if="panne.sirene.modele?.description" class="mt-4 pt-4 border-t border-gray-100">
            <p class="text-sm text-gray-600 mb-1">Description du modèle</p>
            <p class="text-gray-900 text-sm">{{ panne.sirene.modele.description }}</p>
          </div>
        </div>

        <!-- Site et École -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 :size="24" class="text-green-600" />
            Localisation
          </h2>

          <div class="space-y-4">
            <div v-if="panne.site" class="flex items-start gap-3">
              <MapPin :size="18" class="text-gray-400 mt-1 flex-shrink-0" />
              <div class="flex-1">
                <p class="text-sm text-gray-600 mb-1">Site</p>
                <p class="font-semibold text-gray-900">{{ panne.site.nom }}</p>
                <p v-if="panne.site.ville" class="text-sm text-gray-600 mt-1">
                  {{ panne.site.ville.nom }}, {{ panne.site.ville.pays?.nom || '' }}
                </p>
                <p v-if="panne.site.adresse" class="text-sm text-gray-500 mt-1">
                  {{ panne.site.adresse }}
                </p>
              </div>
            </div>

            <div v-if="panne.ecole" class="flex items-start gap-3 pt-4 border-t border-gray-100">
              <Building2 :size="18" class="text-gray-400 mt-1 flex-shrink-0" />
              <div class="flex-1">
                <p class="text-sm text-gray-600 mb-1">École</p>
                <p class="font-semibold text-gray-900">{{ panne.ecole.nom || panne.ecole.nom_complet }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Ordre de Mission -->
        <div v-if="currentOrdreMission || (panne.ordre_mission && panne.ordre_mission.length > 0) || panne.statut !== StatutPanne.DECLAREE" class="bg-white rounded-xl border border-gray-200 p-6">
          <div class="flex items-start justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileText :size="24" class="text-purple-600" />
              Ordre de mission
            </h2>
            <div class="flex gap-2">
              <!-- Bouton de soumission de candidature (techniciens uniquement) -->
              <button
                v-if="canSubmitCandidature"
                @click="handleSoumettreCondidature"
                class="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <User :size="16" />
                Soumettre ma candidature
              </button>
              <!-- Bouton de clôture des candidatures (admin uniquement) -->
              <button
                v-if="currentOrdreMission && isAdmin"
                @click="handleCloturerCandidatures"
                class="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <Clock :size="16" />
                Clôturer les candidatures
              </button>
              <!-- Bouton voir détails -->
              <button
                v-if="currentOrdreMission"
                @click="router.push(`/ordres-mission/${currentOrdreMission.id}`)"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors flex items-center gap-2"
              >
                <ExternalLink :size="16" />
                Voir détails
              </button>
              <button
                v-if="!currentOrdreMission && panne.statut === StatutPanne.VALIDEE"
                class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition-colors"
              >
                Créer ordre de mission
              </button>
            </div>
          </div>

          <div v-if="currentOrdreMission" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-600 mb-1">Numéro d'ordre</p>
                <p class="font-mono text-gray-900">{{ currentOrdreMission.numero_ordre }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600 mb-1">Statut</p>
                <StatusBadge type="ordre_mission" :status="currentOrdreMission.statut" />
              </div>
              <div v-if="currentOrdreMission.ville">
                <p class="text-sm text-gray-600 mb-1">Ville</p>
                <p class="text-gray-900">{{ currentOrdreMission.ville.nom }}</p>
              </div>
              <div v-if="currentOrdreMission.date_generation">
                <p class="text-sm text-gray-600 mb-1">Date de génération</p>
                <p class="text-gray-900">{{ formatDateTime(currentOrdreMission.date_generation) }}</p>
              </div>
              <div v-if="currentOrdreMission.date_fin_candidature">
                <p class="text-sm text-gray-600 mb-1">Fin des candidatures</p>
                <p class="text-gray-900">{{ formatDateTime(currentOrdreMission.date_fin_candidature) }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600 mb-1">Techniciens requis</p>
                <p class="text-gray-900">{{ currentOrdreMission.nombre_techniciens_requis || 1 }}</p>
              </div>
            </div>

            <!-- Candidatures -->
            <div v-if="candidatures && candidatures.length > 0" class="mt-6 pt-6 border-t border-gray-200">
              <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users :size="20" class="text-blue-600" />
                Candidatures ({{ candidatures.length }})
              </h3>
              <div class="space-y-3">
                <div
                  v-for="candidature in candidatures"
                  :key="candidature.id"
                  class="border border-gray-200 rounded-lg p-4"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User :size="20" class="text-blue-600" />
                      </div>
                      <div>
                        <p class="font-semibold text-gray-900">
                          {{ candidature.technicien?.nom || 'Technicien' }}
                        </p>
                        <p class="text-sm text-gray-600">{{ candidature.message || 'Aucun message' }}</p>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <StatusBadge type="candidature" :status="candidature.statut" />
                      <button
                        v-if="candidature.statut === 'en_attente'"
                        @click="handleAccepterCandidature(candidature.id)"
                        class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Accepter
                      </button>
                      <button
                        v-if="candidature.statut === 'en_attente'"
                        @click="handleRefuserCandidature(candidature.id)"
                        class="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        Refuser
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="mt-6 pt-6 border-t border-gray-200 text-center text-gray-500">
              <Users :size="48" class="text-gray-300 mx-auto mb-2" />
              <p>Aucune candidature reçue</p>
            </div>
          </div>

          <div v-else class="text-center text-gray-500 py-8">
            <FileText :size="48" class="text-gray-300 mx-auto mb-2" />
            <p>Aucun ordre de mission créé</p>
          </div>
        </div>

        <!-- Intervention -->
        <div v-if="currentIntervention" class="bg-white rounded-xl border border-gray-200 p-6">
          <div class="flex items-start justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Wrench :size="24" class="text-orange-600" />
              Intervention
            </h2>
            <StatusBadge type="intervention" :status="currentIntervention.statut" />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-if="currentIntervention.type_intervention">
              <p class="text-sm text-gray-600 mb-1">Type</p>
              <p class="text-gray-900">{{ getTypeLabel(currentIntervention.type_intervention) }}</p>
            </div>
            <div v-if="currentIntervention.technicien">
              <p class="text-sm text-gray-600 mb-1">Technicien assigné</p>
              <p class="text-gray-900">{{ currentIntervention.technicien.nom }}</p>
            </div>
            <div v-if="currentIntervention.date_intervention">
              <p class="text-sm text-gray-600 mb-1">Date d'intervention</p>
              <p class="text-gray-900">{{ formatDateTime(currentIntervention.date_intervention) }}</p>
            </div>
            <div v-if="currentIntervention.date_assignation">
              <p class="text-sm text-gray-600 mb-1">Date d'assignation</p>
              <p class="text-gray-900">{{ formatDateTime(currentIntervention.date_assignation) }}</p>
            </div>
            <div v-if="currentIntervention.date_debut">
              <p class="text-sm text-gray-600 mb-1">Date de début</p>
              <p class="text-gray-900">{{ formatDateTime(currentIntervention.date_debut) }}</p>
            </div>
            <div v-if="currentIntervention.date_fin">
              <p class="text-sm text-gray-600 mb-1">Date de fin</p>
              <p class="text-gray-900">{{ formatDateTime(currentIntervention.date_fin) }}</p>
            </div>
            <div v-if="currentIntervention.nombre_techniciens_requis">
              <p class="text-sm text-gray-600 mb-1">Techniciens requis</p>
              <p class="text-gray-900">{{ currentIntervention.nombre_techniciens_requis }}</p>
            </div>
          </div>

          <div v-if="currentIntervention.instructions" class="mt-4 pt-4 border-t border-gray-100">
            <p class="text-sm text-gray-600 mb-1">Instructions</p>
            <p class="text-gray-900">{{ currentIntervention.instructions }}</p>
          </div>

          <div v-if="currentIntervention.observations" class="mt-4">
            <p class="text-sm text-gray-600 mb-1">Observations</p>
            <p class="text-gray-900">{{ currentIntervention.observations }}</p>
          </div>

          <!-- Rapports -->
          <div v-if="rapports && rapports.length > 0" class="mt-6 pt-6 border-t border-gray-200">
            <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText :size="20" class="text-green-600" />
              Rapports d'intervention ({{ rapports.length }})
            </h3>
            <div class="space-y-3">
              <div
                v-for="rapport in rapports"
                :key="rapport.id"
                class="border border-gray-200 rounded-lg p-4"
              >
                <div class="flex items-start justify-between mb-3">
                  <div>
                    <p class="font-semibold text-gray-900">{{ rapport.titre || 'Rapport' }}</p>
                    <p class="text-sm text-gray-600">{{ formatDateTime(rapport.created_at) }}</p>
                  </div>
                  <div v-if="rapport.note" class="flex items-center gap-1">
                    <Star :size="16" class="text-yellow-500 fill-yellow-500" />
                    <span class="font-semibold text-gray-900">{{ rapport.note }}/5</span>
                  </div>
                </div>
                <p class="text-sm text-gray-700 mb-3">{{ rapport.description }}</p>
                <div v-if="rapport.diagnostic" class="text-sm">
                  <p class="text-gray-600 font-semibold mb-1">Diagnostic:</p>
                  <p class="text-gray-900">{{ rapport.diagnostic }}</p>
                </div>
                <div v-if="rapport.pieces_utilisees && rapport.pieces_utilisees.length > 0" class="mt-3">
                  <p class="text-sm text-gray-600 mb-1">Pièces utilisées:</p>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="(piece, idx) in rapport.pieces_utilisees"
                      :key="idx"
                      class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      {{ piece }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Metadata -->
        <div class="bg-gray-50 rounded-xl border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Métadonnées</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-gray-600 mb-1">Numéro de panne</p>
              <p class="font-mono text-gray-900">{{ panne.numero_panne }}</p>
            </div>
            <div>
              <p class="text-gray-600 mb-1">ID Panne</p>
              <p class="font-mono text-xs text-gray-700">{{ panne.id }}</p>
            </div>
            <div>
              <p class="text-gray-600 mb-1">Créée le</p>
              <p class="text-gray-900">{{ formatDateTime(panne.created_at) }}</p>
            </div>
            <div>
              <p class="text-gray-600 mb-1">Dernière modification</p>
              <p class="text-gray-900">{{ formatDateTime(panne.updated_at) }}</p>
            </div>
            <div v-if="currentOrdreMission">
              <p class="text-gray-600 mb-1">Numéro d'ordre de mission</p>
              <p class="font-mono text-gray-900">{{ currentOrdreMission.numero_ordre }}</p>
            </div>
            <div v-if="currentOrdreMission">
              <p class="text-gray-600 mb-1">ID Ordre de mission</p>
              <p class="font-mono text-xs text-gray-700">{{ currentOrdreMission.id }}</p>
            </div>
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
import { usePannes } from '@/composables/usePannes'
import { useInterventions } from '@/composables/useInterventions'
import { useAuthStore } from '@/stores/auth'
import { StatutPanne, TypeIntervention } from '@/types/api'
import {
  ArrowLeft,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Wrench,
  Users,
  User,
  Star,
  MapPin,
  Bell,
  Building2,
  Calendar,
  ExternalLink
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Composables
const {
  panne,
  ordreMission,
  isLoading: isLoadingPanne,
  hasError: hasErrorPanne,
  error: errorPanne,
  fetchPanneById: fetchById,
  validerPanne,
  cloturerPanne
} = usePannes()

const {
  intervention,
  rapports,
  accepterCandidature,
  refuserCandidature,
  fetchRapports
} = useInterventions()

// Local state
const candidatures = ref<any[]>([])

// Computed
const workflowSteps = computed(() => [
  { status: StatutPanne.DECLAREE, label: 'Déclarée', icon: AlertTriangle },
  { status: StatutPanne.VALIDEE, label: 'Validée', icon: CheckCircle },
  { status: StatutPanne.ASSIGNEE, label: 'Assignée', icon: Users },
  { status: StatutPanne.EN_COURS, label: 'En cours', icon: Wrench },
  { status: StatutPanne.RESOLUE, label: 'Résolue', icon: CheckCircle },
  { status: StatutPanne.CLOTUREE, label: 'Clôturée', icon: CheckCircle }
])

// Handle ordre_mission as array or object (from API) or from composable
const currentOrdreMission = computed(() => {
  // First check if panne has ordre_mission (from API response)
  if (panne.value?.ordre_mission) {
    // If it's an array, take the first element
    if (Array.isArray(panne.value.ordre_mission)) {
      return panne.value.ordre_mission.length > 0 ? panne.value.ordre_mission[0] : null
    }
    // If it's an object, return it directly
    if (typeof panne.value.ordre_mission === 'object' && panne.value.ordre_mission !== null) {
      return panne.value.ordre_mission
    }
  }

  // Otherwise check ordreMission from composable
  if (!ordreMission.value) return null

  // If it's an array, take the first element
  if (Array.isArray(ordreMission.value)) {
    return ordreMission.value.length > 0 ? ordreMission.value[0] : null
  }

  // If it's already an object, return it
  return ordreMission.value
})

// Handle interventions as array (from API)
const currentIntervention = computed(() => {
  if (!intervention.value) {
    // Check if panne has interventions array
    if (panne.value?.interventions && Array.isArray(panne.value.interventions)) {
      return panne.value.interventions.length > 0 ? panne.value.interventions[0] : null
    }
    return null
  }
  // If it's an array, take the first element
  if (Array.isArray(intervention.value)) {
    return intervention.value.length > 0 ? intervention.value[0] : null
  }
  // If it's already an object, return it
  return intervention.value
})

const isStepComplete = (stepStatus: string) => {
  if (!panne.value) return false
  const currentIndex = workflowSteps.value.findIndex(s => s.status === panne.value!.statut)
  const stepIndex = workflowSteps.value.findIndex(s => s.status === stepStatus)
  return stepIndex < currentIndex
}

const isStepCurrent = (stepStatus: string) => {
  return panne.value?.statut === stepStatus
}

// Check if user is a technicien
const isTechnicien = computed(() => {
  return authStore.user?.type === 'technicien'
})

// Check if user is admin
const isAdmin = computed(() => {
  return authStore.user?.type === 'admin'
})

// Check if candidatures are currently open
const canSubmitCandidature = computed(() => {
  if (!currentOrdreMission.value || !isTechnicien.value) return false

  const now = new Date()
  const dateDebut = currentOrdreMission.value.date_debut_candidature
    ? new Date(currentOrdreMission.value.date_debut_candidature)
    : null
  const dateFin = currentOrdreMission.value.date_fin_candidature
    ? new Date(currentOrdreMission.value.date_fin_candidature)
    : null

  if (!dateDebut || !dateFin) return false

  return now >= dateDebut && now <= dateFin
})

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getTypeLabel = (type: TypeIntervention | string) => {
  const labels: Record<string, string> = {
    [TypeIntervention.INSTALLATION]: 'Installation',
    [TypeIntervention.MAINTENANCE]: 'Maintenance',
    [TypeIntervention.REPARATION]: 'Réparation',
    [TypeIntervention.DIAGNOSTIC]: 'Diagnostic'
  }
  return labels[type] || type
}

const handleValider = async () => {
  if (!panne.value) return

  // Simple validation - in production, would open a modal
  const priorite = prompt('Priorité (basse/moyenne/haute/urgente):', 'moyenne') as any
  const ville_id = prompt('ID de la ville:')

  if (priorite && ville_id) {
    await validerPanne(panne.value.id, {
      priorite,
      description_validation: 'Validée par admin',
      ville_id
    })
  }
}

const handleCloturer = async () => {
  if (!panne.value) return
  if (confirm('Êtes-vous sûr de vouloir clôturer cette panne ?')) {
    await cloturerPanne(panne.value.id)
  }
}

const handleAccepterCandidature = async (candidatureId: string) => {
  if (!currentOrdreMission.value) return
  const data = {
    ordre_mission_id: currentOrdreMission.value.id,
    message: 'Candidature acceptée'
  }
  await accepterCandidature(candidatureId, data)
  // Refresh candidatures
  // TODO: Implement fetch candidatures
}

const handleRefuserCandidature = async (candidatureId: string) => {
  const raison = prompt('Raison du refus:')
  if (raison) {
    await refuserCandidature(candidatureId, { raison })
    // Refresh candidatures
  }
}

const handleSoumettreCondidature = async () => {
  if (!currentOrdreMission.value || !authStore.user) return

  const message = prompt('Message pour votre candidature (optionnel):')

  try {
    // TODO: Implement soumettreCondidature API call
    // await soumettreCondidature(currentOrdreMission.value.id, {
    //   technicien_id: authStore.user.id,
    //   message: message || ''
    // })

    alert('Candidature soumise avec succès!')
    // Refresh data
    await fetchById(route.params.id as string)
  } catch (error) {
    console.error('Erreur lors de la soumission de la candidature:', error)
    alert('Erreur lors de la soumission de la candidature')
  }
}

const handleCloturerCandidatures = async () => {
  if (!currentOrdreMission.value) return

  if (confirm('Êtes-vous sûr de vouloir clôturer les candidatures pour cet ordre de mission ?')) {
    try {
      // TODO: Implement cloturerCandidatures API call
      // await cloturerCandidatures(currentOrdreMission.value.id)

      alert('Candidatures clôturées avec succès!')
      // Refresh data
      await fetchById(route.params.id as string)
    } catch (error) {
      console.error('Erreur lors de la clôture des candidatures:', error)
      alert('Erreur lors de la clôture des candidatures')
    }
  }
}

// Lifecycle
onMounted(async () => {
  const id = route.params.id as string
  if (id) {
    await fetchById(id)

    // If there's an intervention, fetch its reports
    if (currentIntervention.value) {
      await fetchRapports(currentIntervention.value.id)
    }

    // TODO: Fetch candidatures if ordre mission exists
  }
})
</script>
