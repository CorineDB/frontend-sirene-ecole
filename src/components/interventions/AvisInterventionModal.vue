<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click="$emit('close')">
    <div class="bg-white rounded-xl max-w-lg w-full" @click.stop>
      <div class="p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-gray-900">Donner un avis sur l'intervention</h3>
          <button @click="$emit('close')" class="p-2 hover:bg-gray-100 rounded-lg">
            <X :size="20" class="text-gray-600" />
          </button>
        </div>

        <div v-if="loading" class="text-center p-8">
            <div class="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p class="mt-4 text-gray-600">Chargement des détails de l'intervention...</p>
        </div>

        <div v-else-if="interventionDetails">
            <p class="text-gray-700 mb-4">
                Votre avis est précieux pour améliorer nos services.
            </p>
            <div class="space-y-2 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p class="text-sm"><strong>Type:</strong> {{ interventionDetails.type_intervention }}</p>
                <p class="text-sm"><strong>Début:</strong> {{ formatDate(interventionDetails.date_debut) }}</p>
                <p class="text-sm"><strong>Technicien:</strong> {{ interventionDetails.technicien?.nom || 'Non assigné' }}</p>
            </div>

            <form @submit.prevent="handleSubmit" class="space-y-4">
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Note <span class="text-red-600">*</span></label>
                    <div class="flex items-center gap-1">
                        <Star
                            v-for="star in 5"
                            :key="star"
                            :size="24"
                            :class="{'text-yellow-400': star <= form.note, 'text-gray-300': star > form.note, 'cursor-pointer': !submitting}"
                            @click="setRating(star)"
                            fill="currentColor"
                        />
                    </div>
                </div>
                
                <div>
                    <label for="commentaire" class="block text-sm font-semibold text-gray-700 mb-1">Commentaire</label>
                    <textarea
                      id="commentaire"
                      v-model="form.commentaire"
                      rows="4"
                      placeholder="Partagez votre expérience et vos suggestions..."
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                </div>

                <div class="flex gap-4 pt-4">
                    <button
                      type="submit"
                      :disabled="submitting"
                      class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-blue-400"
                    >
                      {{ submitting ? 'Envoi...' : 'Soumettre l\'avis' }}
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
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useNotificationStore } from '@/stores/notifications';
import { useInterventions } from '@/composables/useInterventions';
import type { ApiIntervention } from '@/types/api';
import { X, Star } from 'lucide-vue-next';

const props = defineProps({
  show: Boolean,
  interventionId: String as () => string | null
});

const emit = defineEmits(['close', 'success']);

const notificationStore = useNotificationStore();
const { fetchById, noterIntervention, ajouterAvisIntervention } = useInterventions();

const loading = ref(false);
const submitting = ref(false);
const interventionDetails = ref<ApiIntervention | null>(null);

const form = ref({
    note: 0,
    commentaire: ''
});

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const setRating = (star: number) => {
    if (!submitting.value) {
        form.value.note = star;
    }
};

const initialize = async () => {
  if (!props.interventionId) {
    notificationStore.error("ID d'intervention manquant pour l'avis.");
    emit('close');
    return;
  }
  loading.value = true;
  form.value.note = 0; // Reset form
  form.value.commentaire = '';
  try {
    const response = await fetchById(props.interventionId);
    if (response?.data) {
      interventionDetails.value = response.data;
    } else {
      notificationStore.error("Détails de l'intervention non trouvés.");
      emit('close');
    }
  } catch (err) {
    notificationStore.error("Erreur lors du chargement des détails de l'intervention.");
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
  if (!props.interventionId || form.value.note === 0) {
    notificationStore.error("Veuillez donner une note pour l'intervention.");
    return;
  }

  submitting.value = true;
  try {
    // Call noterIntervention
    await noterIntervention(props.interventionId, { note: form.value.note });
    
    // Call ajouterAvisIntervention if there is a comment
    if (form.value.commentaire.trim()) {
        await ajouterAvisIntervention(props.interventionId, { commentaire: form.value.commentaire });
    }
    
    notificationStore.success("Votre avis a été soumis avec succès !");
    emit('success');
    emit('close');
  } catch (err) {
    notificationStore.error("Erreur lors de la soumission de l'avis.");
    console.error(err);
  } finally {
    submitting.value = false;
  }
};
</script>
