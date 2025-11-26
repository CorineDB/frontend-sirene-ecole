<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click="$emit('close')">
    <div class="bg-white rounded-xl max-w-lg w-full" @click.stop>
      <div class="p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-gray-900">Planifier l'Intervention</h3>
          <button @click="$emit('close')" class="p-2 hover:bg-gray-100 rounded-lg">
            <X :size="20" class="text-gray-600" />
          </button>
        </div>

        <div v-if="loading" class="text-center p-8">
            <div class="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p class="mt-4 text-gray-600">Chargement des données...</p>
        </div>

        <form v-else @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label for="date_debut" class="block text-sm font-semibold text-gray-700 mb-1">Date et heure de début *</label>
            <input
              id="date_debut"
              v-model="form.date_debut"
              type="datetime-local"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label for="date_fin" class="block text-sm font-semibold text-gray-700 mb-1">Date et heure de fin</label>
            <input
              id="date_fin"
              v-model="form.date_fin"
              type="datetime-local"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label for="technicien_id" class="block text-sm font-semibold text-gray-700 mb-1">Technicien assigné</label>
            <select
              id="technicien_id"
              v-model="form.technicien_id"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Non assigné</option>
              <option v-for="tech in techniciens" :key="tech.id" :value="tech.id">{{ tech.nom }}</option>
            </select>
          </div>

          <div class="flex gap-4 pt-4">
            <button
              type="submit"
              :disabled="submitting"
              class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-blue-400"
            >
              {{ submitting ? 'Enregistrement...' : 'Planifier l\'Intervention' }}
            </button>
            <button
              type="button"
              @click="$emit('close')"
              class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useNotificationStore } from '@/stores/notifications';
import { useInterventions } from '@/composables/useInterventions';
import technicienService from '@/services/technicienService';
import type { PlanifierInterventionRequest, ApiTechnicien } from '@/types/api';
import { X } from 'lucide-vue-next';

const props = defineProps({
  show: Boolean,
  interventionId: String as PropType<string | null>
});

const emit = defineEmits(['close', 'success']);

const notificationStore = useNotificationStore();
const { planifier, fetchById } = useInterventions();

const loading = ref(false);
const submitting = ref(false);

const techniciens = ref<ApiTechnicien[]>([]);

const form = ref({
  date_debut: '',
  date_fin: '',
  technicien_id: '',
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

const initialize = async () => {
  if (!props.interventionId) {
    notificationStore.error("Intervention ID est manquant pour la planification.");
    emit('close');
    return;
  }
  loading.value = true;
  form.value = { date_debut: '', date_fin: '', technicien_id: '' }; // Reset form
  try {
    // Fetch all technicians
    const techniciensResponse = await technicienService.getAll();
    techniciens.value = techniciensResponse.data.data; // Assuming data.data for paginated response

    // Fetch existing intervention data to pre-fill
    const intervention = await fetchById(props.interventionId);
    if (intervention?.data) {
        form.value.date_debut = formatDateForInput(intervention.data.date_debut);
        form.value.date_fin = formatDateForInput(intervention.data.date_fin);
        form.value.technicien_id = intervention.data.technicien?.id || '';
    }
  } catch (err) {
    notificationStore.error("Erreur lors du chargement des données.");
    console.error(err);
  } finally {
    loading.value = false;
  }
};

watch(() => props.show, (newVal) => {
  if (newVal) {
    initialize();
  }
});

const handleSubmit = async () => {
  if (!props.interventionId || !form.value.date_debut) {
    notificationStore.error("Veuillez renseigner la date de début.");
    return;
  }

  submitting.value = true;
  try {
    const payload: PlanifierInterventionRequest = {
      date_debut: new Date(form.value.date_debut).toISOString(),
      date_fin: form.value.date_fin ? new Date(form.value.date_fin).toISOString() : undefined,
      technicien_id: form.value.technicien_id || undefined,
    };
    await planifier(props.interventionId, payload);
    notificationStore.success("Intervention planifiée avec succès !");
    emit('success');
    emit('close');
  } catch (err) {
    notificationStore.error("Erreur lors de la planification de l\'intervention.");
    console.error(err);
  } finally {
    submitting.value = false;
  }
};
</script>
