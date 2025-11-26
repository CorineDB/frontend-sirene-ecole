<template>
  <DashboardLayout>
    <div class="p-6">
      <div class="flex items-center gap-4 mb-6">
        <button @click="router.back()" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft :size="24" class="text-gray-600" />
        </button>
        <div>
          <h1 class="text-3xl font-bold text-gray-900">
            {{ isEditing ? 'Modifier l\'Intervention' : 'Ajouter une Intervention' }}
          </h1>
          <p class="text-gray-600 mt-1">
            {{ isEditing ? 'Mettez à jour les détails de l\'intervention.' : 'Planifiez une nouvelle intervention pour cet ordre de mission.' }}
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
        
        <!-- Type d\'intervention -->
        <div>
          <label for="type_intervention" class="block text-sm font-medium text-gray-700 mb-1">Type d\'intervention *</label>
          <select
            id="type_intervention"
            v-model="form.type_intervention"
            class="block w-full text-sm rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="" disabled>Sélectionnez un type</option>
            <option v-for="type in interventionTypes" :key="type" :value="type">{{ type.replace('_', ' ') }}</option>
          </select>
        </div>

        <!-- Technicien assigné -->
        <div>
          <label for="technicien_id" class="block text-sm font-medium text-gray-700 mb-1">Technicien assigné</label>
          <select
            id="technicien_id"
            v-model="form.technicien_id"
            class="block w-full text-sm rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Non assigné</option>
            <option v-for="tech in techniciens" :key="tech.id" :value="tech.id">{{ tech.nom }}</option>
          </select>
        </div>

        <!-- Dates -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="date_debut" class="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
            <input
              type="datetime-local"
              id="date_debut"
              v-model="form.date_debut"
              class="block w-full text-sm rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
          </div>
          
          <div>
            <label for="date_fin" class="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
            <input
              type="datetime-local"
              id="date_fin"
              v-model="form.date_fin"
              class="block w-full text-sm rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
          </div>
        </div>
        
        <!-- Instructions -->
        <div>
          <label for="instructions" class="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
          <textarea
            id="instructions"
            v-model="form.instructions"
            rows="4"
            class="block w-full text-sm rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Détaillez les instructions pour l\'intervention..."
          ></textarea>
        </div>

        <!-- Lieu et Heure de RDV -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="lieu_rdv" class="block text-sm font-medium text-gray-700 mb-1">Lieu de rendez-vous</label>
            <input
              type="text"
              id="lieu_rdv"
              v-model="form.lieu_rdv"
              class="block w-full text-sm rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Adresse ou lieu spécifique du RDV"
            >
          </div>
          <div>
            <label for="heure_rdv" class="block text-sm font-medium text-gray-700 mb-1">Heure de rendez-vous</label>
            <input
              type="time"
              id="heure_rdv"
              v-model="form.heure_rdv"
              class="block w-full text-sm rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
          </div>
        </div>

        <div class="pt-4 flex justify-end gap-3 border-t border-gray-200">
          <button type="button" @click="router.back()" class="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 font-semibold text-sm">Annuler</button>
          <button type="submit" :disabled="submitting" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm disabled:bg-blue-400">
            <span v-if="submitting">Enregistrement...</span>
            <span v-else>{{ isEditing ? 'Mettre à jour' : 'Ajouter l\'intervention' }}</span>
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
import interventionService from '@/services/interventionService';
import technicienService from '@/services/technicienService';
import { useNotificationStore } from '@/stores/notifications';
import type { ApiTechnicien, CreateInterventionRequest } from '@/types/api';
import { ArrowLeft, AlertCircle } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const notificationStore = useNotificationStore();

const ordreMissionId = ref(route.params.ordreMissionId as string | undefined);
const interventionId = ref(route.params.id as string | undefined);
const isEditing = computed(() => !!interventionId.value);

const loading = ref(false);
const submitting = ref(false);
const error = ref<string | null>(null);

const techniciens = ref<ApiTechnicien[]>([]);
const interventionTypes = ref([
  'maintenance_preventive',
  'maintenance_curative',
  'installation',
  'diagnostic',
  'reparation'
]);

const form = ref({
  type_intervention: '',
  technicien_id: '',
  date_debut: '',
  date_fin: '',
  instructions: '',
  lieu_rdv: '',
  heure_rdv: '',
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
    // Fetch technicians
    const techniciensResponse = await technicienService.getAll();
    // Handle both paginated and direct array responses
    techniciens.value = techniciensResponse.data?.data || techniciensResponse.data || [];

    if (isEditing.value && interventionId.value) {
      const response = await interventionService.getById(interventionId.value);
      const intervention = response.data;
      form.value = {
        type_intervention: intervention.type_intervention || '',
        technicien_id: intervention.technicien?.id || '',
        date_debut: formatDateForInput(intervention.date_debut),
        date_fin: formatDateForInput(intervention.date_fin),
        instructions: intervention.instructions || '',
        lieu_rdv: intervention.lieu_rdv || '',
        heure_rdv: intervention.heure_rdv || '',
      };
      // For editing, ensure ordreMissionId is set if not already from route for proper API call
      ordreMissionId.value = intervention.ordre_mission_id;
    }
  } catch (err: any) {
    error.value = "Erreur lors du chargement des données. " + (err.response?.data?.message || err.message);
    notificationStore.error("Échec du chargement des données nécessaires pour le formulaire.");
  } finally {
    loading.value = false;
  }
});

const handleSubmit = async () => {
  if (!ordreMissionId.value && !isEditing.value) {
      notificationStore.error("L\'ID de l\'ordre de mission est manquant pour la création.");
      return;
  }

  submitting.value = true;
  error.value = null;

  const payload: CreateInterventionRequest = {
    type_intervention: form.value.type_intervention,
    technicien_id: form.value.technicien_id || undefined,
    date_debut: form.value.date_debut ? new Date(form.value.date_debut).toISOString() : undefined,
    date_fin: form.value.date_fin ? new Date(form.value.date_fin).toISOString() : undefined,
    instructions: form.value.instructions || undefined,
    lieu_rdv: form.value.lieu_rdv || undefined,
    heure_rdv: form.value.heure_rdv || undefined,
  };

  try {
    let response;
    if (isEditing.value && interventionId.value) {
      // Update existing intervention using the modifier method
      await interventionService.modifier(interventionId.value, {
        type_intervention: payload.type_intervention,
        date_intervention: payload.date_debut,
        instructions: payload.instructions
      });
      notificationStore.success("Intervention modifiée avec succès !");
    } else {
      response = await interventionService.creerIntervention(ordreMissionId.value!, payload);
      notificationStore.success("Intervention ajoutée avec succès !");
    }
    router.push(`/ordres-mission/${ordreMissionId.value}`); // Go back to the mission detail page
  } catch (err: any) {
    error.value = "Erreur lors de l\'enregistrement. " + (err.response?.data?.message || err.message);
    notificationStore.error("Échec de l\'enregistrement de l\'intervention.");
  } finally {
    submitting.value = false;
  }
};
</script>
