<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click="$emit('close')">
    <div class="bg-white rounded-xl max-w-lg w-full" @click.stop>
      <div class="p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-gray-900">Ajouter un Intervenant à l'Intervention</h3>
          <button @click="$emit('close')" class="p-2 hover:bg-gray-100 rounded-lg">
            <X :size="20" class="text-gray-600" />
          </button>
        </div>

        <div v-if="loading" class="text-center p-8">
            <div class="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p class="mt-4 text-gray-600">Chargement des techniciens...</p>
        </div>

        <form v-else @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label for="technicien_id" class="block text-sm font-semibold text-gray-700 mb-1">Sélectionner un Technicien *</label>
            <select
              id="technicien_id"
              v-model="form.technicien_id"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>Sélectionnez un technicien</option>
              <option v-for="tech in availableTechniciens" :key="tech.id" :value="tech.id">
                {{ tech.nom }}
              </option>
            </select>
          </div>

          <div>
            <label for="role" class="block text-sm font-semibold text-gray-700 mb-1">Rôle (facultatif)</label>
            <input
              id="role"
              v-model="form.role"
              type="text"
              placeholder="Ex: Main, Assistant"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div class="flex gap-4 pt-4">
            <button
              type="submit"
              :disabled="submitting"
              class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-blue-400"
            >
              {{ submitting ? 'Assignation...' : 'Assigner le Technicien' }}
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
import type { ApiTechnicien } from '@/types/api';
import { X } from 'lucide-vue-next';

const props = defineProps<{
  show: boolean;
  interventionId: string | null;
  missionIntervenants: ApiMissionTechnicien[]; // New prop
  currentInterventionTechnicians: ApiTechnicien[]; // New prop
}>();

const emit = defineEmits(['close', 'success']);

const notificationStore = useNotificationStore();
const { assignerTechnicien } = useInterventions();

const loading = ref(false);
const submitting = ref(false);
const availableTechniciens = ref<ApiTechnicien[]>([]); // These are mission technicians not yet on this intervention

const form = ref({
  technicien_id: '',
  role: '',
});

const initialize = async () => {
  if (!props.interventionId) {
    notificationStore.error("ID d'intervention manquant pour assigner un technicien.");
    emit('close');
    return;
  }
  loading.value = true;
  form.value = { technicien_id: '', role: '' }; // Reset form
  try {
    // Filter missionIntervenants to get technicians not yet assigned to this specific intervention
    const assignedToInterventionIds = new Set(props.currentInterventionTechnicians.map(t => t.id));
    availableTechniciens.value = props.missionIntervenants
      .filter(mt => mt.technicien && !assignedToInterventionIds.has(mt.technicien.id))
      .map(mt => mt.technicien as ApiTechnicien); // Technicien should always be present

  } catch (err) {
    notificationStore.error("Erreur lors du chargement des techniciens disponibles.");
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
  if (!props.interventionId || !form.value.technicien_id) {
    notificationStore.error("Veuillez sélectionner un technicien.");
    return;
  }

  submitting.value = true;
  try {
    await assignerTechnicien(props.interventionId, form.value.technicien_id, form.value.role || undefined);
    notificationStore.success("Technicien assigné avec succès !");
    emit('success');
    emit('close');
  } catch (err) {
    notificationStore.error("Erreur lors de l'assignation du technicien.");
    console.error(err);
  } finally {
    submitting.value = false;
  }
};
</script>
