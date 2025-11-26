<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click="$emit('close')">
    <div class="bg-white rounded-xl max-w-lg w-full" @click.stop>
      <div class="p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-gray-900">Reporter l'Intervention</h3>
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
            <label for="date_debut" class="block text-sm font-semibold text-gray-700 mb-1">Nouvelle date et heure de début *</label>
            <input
              id="date_debut"
              v-model="form.date_debut"
              type="datetime-local"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label for="date_fin" class="block text-sm font-semibold text-gray-700 mb-1">Nouvelle date et heure de fin</label>
            <input
              id="date_fin"
              v-model="form.date_fin"
              type="datetime-local"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label for="commentaire" class="block text-sm font-semibold text-gray-700 mb-1">Commentaire / Motif du report</label>
            <textarea
              id="commentaire"
              v-model="form.commentaire"
              rows="3"
              placeholder="Ex: Reporté suite à l'indisponibilité du technicien..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <div class="flex gap-4 pt-4">
            <button
              type="submit"
              :disabled="submitting"
              class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-blue-400"
            >
              {{ submitting ? 'Enregistrement...' : 'Reporter l\'Intervention' }}
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
import interventionService from '@/services/interventionService';
import type { PlanifierInterventionRequest } from '@/types/api';
import { X } from 'lucide-vue-next';

const props = defineProps({
  show: Boolean,
  interventionId: String as () => string | null
});

const emit = defineEmits(['close', 'success']);

const notificationStore = useNotificationStore();

const loading = ref(false);
const submitting = ref(false);

const form = ref({
  date_debut: '',
  date_fin: '',
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

const initialize = async () => {
  if (!props.interventionId) {
    notificationStore.error("Intervention ID est manquant pour le report.");
    emit('close');
    return;
  }
  loading.value = true;
  try {
    const intervention = await interventionService.getById(props.interventionId);
    form.value = {
      date_debut: formatDateForInput(intervention.date_debut),
      date_fin: formatDateForInput(intervention.date_fin),
      commentaire: '', // Commentaire is specific to reschedule, not pre-filled
    };
  } catch (err) {
    notificationStore.error("Erreur lors du chargement de l'intervention.");
    console.error(err);
  } finally {
    loading.value = false;
  }
};

watch(() => props.show, (newVal) => {
  if (newVal) {
    initialize();
  } else {
    // Reset form when modal is closed
    form.value = { date_debut: '', date_fin: '', commentaire: '' };
  }
});

const handleSubmit = async () => {
  if (!props.interventionId) {
    notificationStore.error("Intervention ID est manquant.");
    return;
  }
  if (!form.value.date_debut) {
    notificationStore.error("Veuillez sélectionner une nouvelle date de début.");
    return;
  }

  submitting.value = true;
  try {
    const payload: PlanifierInterventionRequest = {
      date_debut: form.value.date_debut ? new Date(form.value.date_debut).toISOString() : undefined,
      date_fin: form.value.date_fin ? new Date(form.value.date_fin).toISOString() : undefined,
      commentaire: form.value.commentaire || undefined,
    };
    await interventionService.planifier(props.interventionId, payload);
    notificationStore.success("Intervention reportée avec succès !");
    emit('success');
    emit('close');
  } catch (err) {
    notificationStore.error("Erreur lors du report de l\'intervention.");
    console.error(err);
  } finally {
    submitting.value = false;
  }
};
</script>
