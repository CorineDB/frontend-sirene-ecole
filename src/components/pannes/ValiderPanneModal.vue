<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click="$emit('close')">
    <div class="bg-white rounded-xl max-w-lg w-full" @click.stop>
      <div class="p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-gray-900">Valider la Panne et Créer une Mission</h3>
          <button @click="$emit('close')" class="p-2 hover:bg-gray-100 rounded-lg">
            <X :size="20" class="text-gray-600" />
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label for="nombre_techniciens_requis" class="block text-sm font-semibold text-gray-700 mb-1">Nombre de techniciens requis *</label>
            <input
              id="nombre_techniciens_requis"
              v-model.number="form.nombre_techniciens_requis"
              type="number"
              min="1"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label for="date_debut_candidature" class="block text-sm font-semibold text-gray-700 mb-1">Début des candidatures</label>
            <input
              id="date_debut_candidature"
              v-model="form.date_debut_candidature"
              type="datetime-local"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label for="date_fin_candidature" class="block text-sm font-semibold text-gray-700 mb-1">Fin des candidatures</label>
            <input
              id="date_fin_candidature"
              v-model="form.date_fin_candidature"
              type="datetime-local"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label for="commentaire" class="block text-sm font-semibold text-gray-700 mb-1">Description de la mission</label>
            <textarea
              id="commentaire"
              v-model="form.commentaire"
              rows="4"
              placeholder="Décrivez la mission à effectuer..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <div class="flex gap-4 pt-4">
            <button
              type="submit"
              :disabled="submitting"
              class="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:bg-green-400"
            >
              {{ submitting ? 'Validation...' : 'Valider et Créer Mission' }}
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
import { usePannes } from '@/composables/usePannes';
import { useNotificationStore } from '@/stores/notifications';
import { X } from 'lucide-vue-next';

const props = defineProps<{
  show: boolean;
  panneId: string | null;
}>();

const emit = defineEmits(['close', 'success']);

const { validerPanne } = usePannes();
const notificationStore = useNotificationStore();

const submitting = ref(false);
const form = ref({
  nombre_techniciens_requis: 1,
  date_debut_candidature: '',
  date_fin_candidature: '',
  commentaire: '',
});

watch(() => props.show, (newVal) => {
  if (newVal) {
    // Reset form when modal is shown
    form.value = {
      nombre_techniciens_requis: 1,
      date_debut_candidature: '',
      date_fin_candidature: '',
      commentaire: '',
    };
  }
});

const handleSubmit = async () => {
  if (!props.panneId) {
    notificationStore.error("Aucune panne sélectionnée.");
    return;
  }

  submitting.value = true;
  try {
    await validerPanne(props.panneId, {
        nombre_techniciens_requis: form.value.nombre_techniciens_requis,
        date_debut_candidature: form.value.date_debut_candidature || undefined,
        date_fin_candidature: form.value.date_fin_candidature || undefined,
        commentaire: form.value.commentaire || undefined,
    });
    notificationStore.success("Panne validée et ordre de mission créé avec succès !");
    emit('success');
    emit('close');
  } catch (err) {
    notificationStore.error("Erreur lors de la validation de la panne.");
    console.error(err);
  } finally {
    submitting.value = false;
  }
};
</script>
