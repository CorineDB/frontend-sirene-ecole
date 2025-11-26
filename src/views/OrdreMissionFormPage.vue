<template>
  <DashboardLayout>
    <div class="p-6">
      <div class="flex items-center gap-4 mb-6">
        <button @click="router.back()" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft :size="24" class="text-gray-600" />
        </button>
        <div>
          <h1 class="text-3xl font-bold text-gray-900">
            {{ isEditing ? 'Modifier l\'Ordre de Mission' : 'Créer un Ordre de Mission' }}
          </h1>
          <p class="text-gray-600 mt-1">
            {{ isEditing ? 'Mettez à jour les détails de l\'ordre de mission.' : 'Remplissez les informations pour créer un nouvel ordre de mission.' }}
          </p>
        </div>
      </div>

      <div v-if="loading" class="flex items-center justify-center h-96">
        <div class="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>

      <div v-if="error" class="bg-red-50 border border-red-200 rounded-xl p-4 max-w-4xl mx-auto">
        <div class="flex items-center gap-3">
          <AlertCircle :size="24" class="text-red-600" />
          <div>
            <h3 class="font-semibold text-red-900">Erreur</h3>
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <form v-if="!loading" @submit.prevent="handleSubmit" class="space-y-8 max-w-4xl mx-auto bg-white p-8 rounded-2xl border border-gray-200">
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Panne Associée -->
          <div>
            <label for="panne_id" class="block text-sm font-medium text-gray-700 mb-1">Panne associée *</label>
            <select
              id="panne_id"
              v-model="form.panne_id"
              :disabled="isEditing"
              class="block w-full text-sm rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
              required
            >
              <option value="" disabled>Sélectionnez une panne validée</option>
              <option v-for="panne in availablePannes" :key="panne.id" :value="panne.id">
                {{ panne.titre }} ({{ panne.ecole?.nom }})
              </option>
            </select>
            <p v-if="availablePannes.length === 0" class="text-xs text-orange-600 mt-1">
              Aucune panne validée et non assignée disponible.
            </p>
          </div>
          
          <!-- Nombre de techniciens requis -->
          <div>
            <label for="nombre_techniciens_requis" class="block text-sm font-medium text-gray-700 mb-1">Techniciens requis *</label>
            <input
              type="number"
              id="nombre_techniciens_requis"
              v-model.number="form.nombre_techniciens_requis"
              min="1"
              class="block w-full text-sm rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Début des candidatures -->
          <div>
            <label for="date_debut_candidature" class="block text-sm font-medium text-gray-700 mb-1">Début des candidatures</label>
            <input
              type="datetime-local"
              id="date_debut_candidature"
              v-model="form.date_debut_candidature"
              class="block w-full text-sm rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
          </div>
          
          <!-- Fin des candidatures -->
          <div>
            <label for="date_fin_candidature" class="block text-sm font-medium text-gray-700 mb-1">Fin des candidatures</label>
            <input
              type="datetime-local"
              id="date_fin_candidature"
              v-model="form.date_fin_candidature"
              class="block w-full text-sm rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
          </div>
        </div>
        
        <!-- Ville -->
        <div>
          <label for="ville_id" class="block text-sm font-medium text-gray-700 mb-1">Ville</label>
          <select
            id="ville_id"
            v-model="form.ville_id"
            class="block w-full text-sm rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="" disabled>Sélectionnez une ville</option>
            <option v-for="city in cities" :key="city.id" :value="city.id">
              {{ city.nom }}
            </option>
          </select>
        </div>

        <!-- Commentaire -->
        <div>
          <label for="commentaire" class="block text-sm font-medium text-gray-700 mb-1">Commentaire</label>
          <textarea
            id="commentaire"
            v-model="form.commentaire"
            rows="4"
            class="block w-full text-sm rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Ajoutez des détails ou instructions supplémentaires..."
          ></textarea>
        </div>

        <div class="pt-4 flex justify-end gap-3 border-t border-gray-200">
          <button type="button" @click="router.back()" class="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 font-semibold text-sm">Annuler</button>
          <button type="submit" :disabled="submitting" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm disabled:bg-blue-400">
            <span v-if="submitting">Enregistrement...</span>
            <span v-else>{{ isEditing ? 'Mettre à jour' : 'Créer l\'ordre' }}</span>
          </button>
        </div>
      </form>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DashboardLayout from '@/components/layout/DashboardLayout.vue';
import ordreMissionService from '@/services/ordreMissionService';
import panneService from '@/services/panneService';
import cityService from '@/services/cityService';
import type { ApiPanne, ApiVille } from '@/types/api';
import { useNotificationStore } from '@/stores/notifications';
import { ArrowLeft, AlertCircle } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const notificationStore = useNotificationStore();

const missionId = ref(route.params.id as string | undefined);
const isEditing = computed(() => !!missionId.value);

const loading = ref(false);
const submitting = ref(false);
const error = ref<string | null>(null);

const availablePannes = ref<ApiPanne[]>([]);
const cities = ref<ApiVille[]>([]);

const form = ref({
  panne_id: '',
  nombre_techniciens_requis: 1,
  date_debut_candidature: '',
  date_fin_candidature: '',
  ville_id: '' as string | number,
  commentaire: '',
});

const formatDateForInput = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  } catch {
    return '';
  }
};

onMounted(async () => {
  loading.value = true;
  error.value = null;
  try {
    const pannesPromise = panneService.getAll({ statut: 'validee', per_page: 1000 });
    const citiesPromise = cityService.getAllCities({ per_page: 1000 });

    const [pannesResponse, citiesResponse] = await Promise.all([pannesPromise, citiesPromise]);
    
    availablePannes.value = pannesResponse.data;
    cities.value = citiesResponse.data;

    if (isEditing.value && missionId.value) {
      const mission = await ordreMissionService.getById(missionId.value);
      form.value = {
        panne_id: mission.panne.id,
        nombre_techniciens_requis: mission.nombre_techniciens_requis,
        date_debut_candidature: formatDateForInput(mission.date_debut_candidature),
        date_fin_candidature: formatDateForInput(mission.date_fin_candidature),
        ville_id: mission.ville?.id || '',
        commentaire: mission.commentaire || '',
      };
      
      // If the mission's breakdown is already in the list, no need to add it.
      // If it's not (e.g., its status changed), add it to the list for display purposes.
      if (!availablePannes.value.some(p => p.id === mission.panne.id)) {
        availablePannes.value.unshift(mission.panne);
      }
    }
  } catch (err: any) {
    error.value = "Erreur lors du chargement des données. " + (err.response?.data?.message || err.message);
    notificationStore.error("Échec du chargement des données nécessaires pour le formulaire.");
  } finally {
    loading.value = false;
  }
});

const handleSubmit = async () => {
  submitting.value = true;
  error.value = null;

  // Basic validation
  if (!form.value.panne_id) {
    notificationStore.error("Veuillez sélectionner une panne associée.");
    submitting.value = false;
    return;
  }

  try {
    let response;
    if (isEditing.value && missionId.value) {
      response = await ordreMissionService.update(missionId.value, form.value);
      notificationStore.success("Ordre de mission mis à jour avec succès !");
    } else {
      response = await ordreMissionService.create(form.value);
      notificationStore.success("Ordre de mission créé avec succès !");
    }
    router.push(`/ordres-mission/${response.id}`);
  } catch (err: any) {
    error.value = "Erreur lors de l\'enregistrement. " + (err.response?.data?.message || err.message);
    notificationStore.error("Échec de l\'enregistrement de l\'ordre de mission.");
  } finally {
    submitting.value = false;
  }
};
</script>
