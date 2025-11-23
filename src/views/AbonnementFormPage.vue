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
          <h1 class="text-3xl font-bold text-gray-900">
            {{ isEditMode ? 'Modifier l\'abonnement' : 'Nouvel abonnement' }}
          </h1>
          <p class="text-gray-600 mt-1">
            {{ isEditMode ? 'Modifier les informations de l\'abonnement' : 'Créer un nouvel abonnement pour une école' }}
          </p>
        </div>
      </div>

      <!-- Form -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- École Selection -->
          <div>
            <label for="ecole_id" class="block text-sm font-semibold text-gray-900 mb-2">
              École <span class="text-red-600">*</span>
            </label>
            <input
              id="ecole_id"
              v-model="form.ecole_id"
              type="text"
              required
              placeholder="ID de l'école"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- Site Selection -->
          <div>
            <label for="site_id" class="block text-sm font-semibold text-gray-900 mb-2">
              Site
            </label>
            <input
              id="site_id"
              v-model="form.site_id"
              type="text"
              placeholder="ID du site (optionnel)"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- Sirène Selection -->
          <div>
            <label for="sirene_id" class="block text-sm font-semibold text-gray-900 mb-2">
              Sirène <span class="text-red-600">*</span>
            </label>
            <input
              id="sirene_id"
              v-model="form.sirene_id"
              type="text"
              required
              placeholder="ID de la sirène"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- Montant -->
          <div>
            <label for="montant" class="block text-sm font-semibold text-gray-900 mb-2">
              Montant (XOF) <span class="text-red-600">*</span>
            </label>
            <input
              id="montant"
              v-model.number="form.montant"
              type="number"
              required
              min="0"
              placeholder="Ex: 120000"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- Date de début -->
          <div>
            <label for="date_debut" class="block text-sm font-semibold text-gray-900 mb-2">
              Date de début <span class="text-red-600">*</span>
            </label>
            <input
              id="date_debut"
              v-model="form.date_debut"
              type="date"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- Durée en mois -->
          <div>
            <label for="duree_mois" class="block text-sm font-semibold text-gray-900 mb-2">
              Durée (en mois) <span class="text-red-600">*</span>
            </label>
            <select
              id="duree_mois"
              v-model.number="form.duree_mois"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option :value="1">1 mois</option>
              <option :value="3">3 mois</option>
              <option :value="6">6 mois</option>
              <option :value="12">12 mois</option>
            </select>
          </div>

          <!-- Auto-renouvellement -->
          <div class="flex items-center">
            <input
              id="auto_renouvellement"
              v-model="form.auto_renouvellement"
              type="checkbox"
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label for="auto_renouvellement" class="ml-2 text-sm font-semibold text-gray-900">
              Activer le renouvellement automatique
            </label>
          </div>

          <!-- Notes -->
          <div>
            <label for="notes" class="block text-sm font-semibold text-gray-900 mb-2">
              Notes (optionnel)
            </label>
            <textarea
              id="notes"
              v-model="form.notes"
              rows="4"
              placeholder="Ajouter des notes sur cet abonnement..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ></textarea>
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
              <Save :size="20" />
              {{ isLoading ? 'Enregistrement...' : (isEditMode ? 'Mettre à jour' : 'Créer l\'abonnement') }}
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
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import DashboardLayout from '../components/layout/DashboardLayout.vue'
import { useAbonnements } from '@/composables/useAbonnements'
import type { CreateAbonnementRequest } from '@/types/api'
import { ArrowLeft, Save, AlertCircle } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()

// Composable
const {
  create,
  update,
  fetchById,
  abonnement,
  isLoading,
  hasError,
  error
} = useAbonnements()

// Form state
const form = ref<CreateAbonnementRequest>({
  ecole_id: '',
  sirene_id: '',
  montant: 0,
  date_debut: new Date().toISOString().split('T')[0],
  duree_mois: 12,
  auto_renouvellement: false,
  notes: ''
})

// Computed
const isEditMode = computed(() => !!route.params.id)

// Methods
const handleSubmit = async () => {
  try {
    if (isEditMode.value) {
      // Update existing abonnement
      await update(route.params.id as string, form.value)
    } else {
      // Create new abonnement
      const response = await create(form.value)
      if (response.data?.id) {
        router.push(`/abonnements/${response.data.id}`)
        return
      }
    }
    router.push('/abonnements')
  } catch (err) {
    console.error('Form submission error:', err)
  }
}

// Lifecycle
onMounted(async () => {
  if (isEditMode.value) {
    const id = route.params.id as string
    await fetchById(id)

    if (abonnement.value) {
      // Populate form with existing data
      form.value = {
        ecole_id: abonnement.value.ecole_id,
        sirene_id: abonnement.value.sirene_id,
        site_id: abonnement.value.site_id || undefined,
        montant: abonnement.value.montant,
        date_debut: abonnement.value.date_debut.split('T')[0],
        duree_mois: 12, // Calculate from date_fin if needed
        auto_renouvellement: abonnement.value.auto_renouvellement,
        notes: abonnement.value.notes || ''
      }
    }
  }
})
</script>
