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
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Détails de la panne</h1>
            <p v-if="panne" class="text-gray-600 mt-1">{{ panne.titre || 'Panne sans titre' }}</p>
          </div>
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

        <!-- Main Panne Info -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <div class="flex items-start justify-between mb-6">
            <div>
              <h2 class="text-xl font-bold text-gray-900 mb-2">Informations sur la panne</h2>
              <div class="flex gap-2">
                <StatusBadge type="panne" :status="panne.statut" />
                <StatusBadge type="priorite" :status="panne.priorite" />
              </div>
            </div>
            <div class="flex gap-2">
              <button
                v-if="panne.statut === StatutPanne.DECLAREE"
                @click="handleValider"
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
              >
                Valider
              </button>
              <button
                v-if="panne.statut === StatutPanne.RESOLUE"
                @click="handleCloturer"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
              >
                Clôturer
              </button>
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <p class="text-sm text-gray-600 mb-1">Titre</p>
              <p class="text-lg font-semibold text-gray-900">{{ panne.titre || 'N/A' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600 mb-1">Description</p>
              <p class="text-gray-900">{{ panne.description || 'N/A' }}</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-if="panne.ecole">
                <p class="text-sm text-gray-600 mb-1">École</p>
                <p class="text-gray-900">{{ panne.ecole.nom }}</p>
              </div>
              <div v-if="panne.site">
                <p class="text-sm text-gray-600 mb-1">Site</p>
                <p class="text-gray-900">{{ panne.site.nom }}</p>
              </div>
              <div v-if="panne.sirene">
                <p class="text-sm text-gray-600 mb-1">Sirène</p>
                <p class="font-mono text-gray-900">{{ panne.sirene.numero_serie }}</p>
              </div>
              <div v-if="panne.declarant">
                <p class="text-sm text-gray-600 mb-1">Déclarant</p>
                <p class="text-gray-900">{{ panne.declarant.nom }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Ordre de Mission -->
        <div v-if="ordreMission || panne.statut !== StatutPanne.DECLAREE" class="bg-white rounded-xl border border-gray-200 p-6">
          <div class="flex items-start justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileText :size="24" class="text-purple-600" />
              Ordre de mission
            </h2>
            <button
              v-if="!ordreMission && panne.statut === StatutPanne.VALIDEE"
              class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition-colors"
            >
              Créer ordre de mission
            </button>
          </div>

          <div v-if="ordreMission" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-600 mb-1">Numéro d'ordre</p>
                <p class="font-mono text-gray-900">{{ ordreMission.numero_ordre }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600 mb-1">Statut candidatures</p>
                <StatusBadge
                  type="ordre_mission"
                  :status="ordreMission.candidatures_ouvertes ? 'ouvert' : 'ferme'"
                />
              </div>
              <div v-if="ordreMission.ville">
                <p class="text-sm text-gray-600 mb-1">Ville</p>
                <p class="text-gray-900">{{ ordreMission.ville.nom }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600 mb-1">Date de clôture prévue</p>
                <p class="text-gray-900">{{ formatDate(ordreMission.date_cloture_candidatures) }}</p>
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
        <div v-if="intervention" class="bg-white rounded-xl border border-gray-200 p-6">
          <div class="flex items-start justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Wrench :size="24" class="text-orange-600" />
              Intervention
            </h2>
            <StatusBadge type="intervention" :status="intervention.statut" />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-600 mb-1">Type</p>
              <p class="text-gray-900">{{ getTypeLabel(intervention.type) }}</p>
            </div>
            <div v-if="intervention.technicien">
              <p class="text-sm text-gray-600 mb-1">Technicien assigné</p>
              <p class="text-gray-900">{{ intervention.technicien.nom }}</p>
            </div>
            <div v-if="intervention.date_intervention">
              <p class="text-sm text-gray-600 mb-1">Date d'intervention</p>
              <p class="text-gray-900">{{ formatDateTime(intervention.date_intervention) }}</p>
            </div>
            <div v-if="intervention.heure_arrivee">
              <p class="text-sm text-gray-600 mb-1">Heure d'arrivée</p>
              <p class="text-gray-900">{{ formatTime(intervention.heure_arrivee) }}</p>
            </div>
            <div v-if="intervention.heure_depart">
              <p class="text-sm text-gray-600 mb-1">Heure de départ</p>
              <p class="text-gray-900">{{ formatTime(intervention.heure_depart) }}</p>
            </div>
            <div v-if="intervention.resultat">
              <p class="text-sm text-gray-600 mb-1">Résultat</p>
              <StatusBadge type="resultat" :status="intervention.resultat" />
            </div>
          </div>

          <div v-if="intervention.description" class="mt-4">
            <p class="text-sm text-gray-600 mb-1">Description</p>
            <p class="text-gray-900">{{ intervention.description }}</p>
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
              <p class="text-gray-600 mb-1">Créée le</p>
              <p class="text-gray-900">{{ formatDateTime(panne.created_at) }}</p>
            </div>
            <div>
              <p class="text-gray-600 mb-1">Dernière modification</p>
              <p class="text-gray-900">{{ formatDateTime(panne.updated_at) }}</p>
            </div>
            <div>
              <p class="text-gray-600 mb-1">ID Panne</p>
              <p class="font-mono text-gray-900">{{ panne.id }}</p>
            </div>
            <div v-if="ordreMission">
              <p class="text-gray-600 mb-1">ID Ordre de mission</p>
              <p class="font-mono text-gray-900">{{ ordreMission.id }}</p>
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
  Star
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()

// Composables
const {
  panne,
  ordreMission,
  isLoading: isLoadingPanne,
  hasError: hasErrorPanne,
  error: errorPanne,
  fetchById,
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

const isStepComplete = (stepStatus: string) => {
  if (!panne.value) return false
  const currentIndex = workflowSteps.value.findIndex(s => s.status === panne.value!.statut)
  const stepIndex = workflowSteps.value.findIndex(s => s.status === stepStatus)
  return stepIndex < currentIndex
}

const isStepCurrent = (stepStatus: string) => {
  return panne.value?.statut === stepStatus
}

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
  if (!ordreMission.value) return
  const data = {
    ordre_mission_id: ordreMission.value.id,
    admin_id: 'admin-id', // Would come from auth context
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

// Lifecycle
onMounted(async () => {
  const id = route.params.id as string
  if (id) {
    await fetchById(id)

    // If there's an intervention, fetch its reports
    if (intervention.value) {
      await fetchRapports(intervention.value.id)
    }

    // TODO: Fetch candidatures if ordre mission exists
  }
})
</script>
