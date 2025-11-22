<template>
  <DashboardLayout>
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <button
          @click="router.back()"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft :size="24" class="text-gray-600" />
        </button>
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Rapport d'Intervention</h1>
          <p class="text-gray-600 mt-1">Rédiger le rapport de l'intervention</p>
        </div>
      </div>

      <!-- Form -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Type de rapport -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">
              Type de rapport
            </label>
            <div class="flex gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="isCollectif"
                  type="radio"
                  :value="false"
                  class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span class="text-sm text-gray-900">Rapport individuel</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="isCollectif"
                  type="radio"
                  :value="true"
                  class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span class="text-sm text-gray-900">Rapport collectif</span>
              </label>
            </div>
          </div>

          <!-- Technicien (si individuel) -->
          <div v-if="!isCollectif">
            <label for="technicien_id" class="block text-sm font-semibold text-gray-900 mb-2">
              Technicien <span class="text-red-600">*</span>
            </label>
            <input
              id="technicien_id"
              v-model="form.technicien_id"
              type="text"
              required
              placeholder="ID du technicien"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- Rapport/Description -->
          <div>
            <label for="rapport" class="block text-sm font-semibold text-gray-900 mb-2">
              Description complète <span class="text-red-600">*</span>
            </label>
            <textarea
              id="rapport"
              v-model="form.rapport"
              rows="5"
              required
              placeholder="Description détaillée de l'intervention effectuée..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ></textarea>
            <p class="text-xs text-gray-500 mt-1">
              Décrivez en détail les actions réalisées pendant l'intervention
            </p>
          </div>

          <!-- Diagnostic -->
          <div>
            <label for="diagnostic" class="block text-sm font-semibold text-gray-900 mb-2">
              Diagnostic
            </label>
            <textarea
              id="diagnostic"
              v-model="form.diagnostic"
              rows="3"
              placeholder="Diagnostic de la panne ou du problème identifié..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ></textarea>
          </div>

          <!-- Travaux effectués -->
          <div>
            <label for="travaux_effectues" class="block text-sm font-semibold text-gray-900 mb-2">
              Travaux effectués
            </label>
            <textarea
              id="travaux_effectues"
              v-model="form.travaux_effectues"
              rows="4"
              placeholder="Liste des travaux et réparations effectués..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ></textarea>
          </div>

          <!-- Pièces utilisées -->
          <div>
            <label for="pieces_utilisees" class="block text-sm font-semibold text-gray-900 mb-2">
              Pièces utilisées
            </label>
            <textarea
              id="pieces_utilisees"
              v-model="form.pieces_utilisees"
              rows="3"
              placeholder="Liste des pièces de rechange et matériel utilisés..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ></textarea>
          </div>

          <!-- Résultat -->
          <div>
            <label for="resultat" class="block text-sm font-semibold text-gray-900 mb-2">
              Résultat <span class="text-red-600">*</span>
            </label>
            <select
              id="resultat"
              v-model="form.resultat"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sélectionnez le résultat</option>
              <option :value="ResultatIntervention.RESOLU">Résolu</option>
              <option :value="ResultatIntervention.PARTIELLEMENT_RESOLU">Partiellement résolu</option>
              <option :value="ResultatIntervention.NON_RESOLU">Non résolu</option>
            </select>
          </div>

          <!-- Recommandations -->
          <div>
            <label for="recommandations" class="block text-sm font-semibold text-gray-900 mb-2">
              Recommandations
            </label>
            <textarea
              id="recommandations"
              v-model="form.recommandations"
              rows="3"
              placeholder="Recommandations pour le suivi ou la maintenance future..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ></textarea>
          </div>

          <!-- Photos -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">
              Photos <span class="text-gray-500 text-xs">(URLs)</span>
            </label>

            <div class="space-y-2">
              <div
                v-for="(photo, index) in form.photos"
                :key="index"
                class="flex gap-2"
              >
                <input
                  v-model="form.photos[index]"
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  @click="removePhoto(index)"
                  class="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                >
                  <Trash2 :size="18" />
                </button>
              </div>
            </div>

            <button
              type="button"
              @click="addPhoto"
              class="mt-2 px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold flex items-center gap-2"
            >
              <Plus :size="18" />
              Ajouter une photo
            </button>
          </div>

          <!-- Error Message -->
          <div v-if="hasError" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex items-center gap-3">
              <AlertCircle :size="20" class="text-red-600" />
              <p class="text-sm text-red-700">{{ error }}</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              :disabled="isLoading"
              class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FileText :size="20" />
              {{ isLoading ? 'Soumission...' : 'Soumettre le rapport' }}
            </button>
            <button
              type="button"
              @click="router.back()"
              class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import DashboardLayout from '../components/layout/DashboardLayout.vue'
import { useInterventions } from '@/composables/useInterventions'
import { ResultatIntervention } from '@/types/api'
import type { RedigerRapportRequest } from '@/types/api'
import {
  ArrowLeft,
  FileText,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()

// Composable
const {
  isLoading,
  hasError,
  error,
  redigerRapport
} = useInterventions()

// Form state
const isCollectif = ref(false)
const form = ref<RedigerRapportRequest>({
  technicien_id: '',
  rapport: '',
  diagnostic: '',
  travaux_effectues: '',
  pieces_utilisees: '',
  resultat: '' as any,
  recommandations: '',
  photos: []
})

// Methods
const addPhoto = () => {
  if (!form.value.photos) {
    form.value.photos = []
  }
  form.value.photos.push('')
}

const removePhoto = (index: number) => {
  if (form.value.photos) {
    form.value.photos.splice(index, 1)
  }
}

const handleSubmit = async () => {
  try {
    const interventionId = route.params.interventionId as string

    if (!interventionId) {
      alert('ID intervention manquant')
      return
    }

    // Préparer les données
    const data: RedigerRapportRequest = {
      ...form.value,
      technicien_id: isCollectif.value ? null : form.value.technicien_id || null,
      photos: form.value.photos?.filter(p => p.trim() !== '') || []
    }

    // Soumettre le rapport
    await redigerRapport(interventionId, data)

    // Rediriger vers les détails de l'intervention ou de la panne
    if (route.query.panneId) {
      router.push(`/pannes/${route.query.panneId}`)
    } else {
      router.push('/interventions')
    }
  } catch (err) {
    console.error('Error submitting rapport:', err)
  }
}

// Lifecycle
onMounted(() => {
  // Optionally pre-fill technicien_id from auth context
  // form.value.technicien_id = getCurrentTechnicienId()
})
</script>
