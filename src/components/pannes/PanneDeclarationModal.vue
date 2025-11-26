<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click="$emit('close')"
  >
    <div
      class="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      @click.stop
    >
      <div class="p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-gray-900">{{ isEditing ? 'Modifier la Panne' : 'Déclarer une Panne' }}</h3>
          <button @click="$emit('close')" class="p-2 hover:bg-gray-100 rounded-lg">
            <X :size="20" class="text-gray-600" />
          </button>
        </div>

        <div v-if="loading" class="text-center p-8">
            <div class="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p class="mt-4 text-gray-600">Chargement des données...</p>
        </div>

        <form v-else @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Admin: School Selection -->
          <div v-if="isAdmin">
            <label class="block text-sm font-semibold text-gray-900 mb-2">École <span class="text-red-600">*</span></label>
            <select v-model="selectedEcole" @change="onEcoleChange" required :disabled="isEditing" class="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100">
              <option :value="null" disabled>Sélectionnez une école</option>
              <option v-for="ecole in ecoles" :key="ecole.id" :value="ecole.id">{{ ecole.nom }}</option>
            </select>
          </div>

          <!-- Site and Siren Selection -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">Site <span class="text-red-600">*</span></label>
            <select v-model="selectedSite" @change="onSiteChange" required :disabled="isEditing || !sites.length" class="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100">
              <option :value="null" disabled>Sélectionnez un site</option>
              <option v-for="site in sites" :key="site.id" :value="site.id">{{ site.nom }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">Sirène <span class="text-red-600">*</span></label>
            <select v-model="form.sirene_id" required :disabled="isEditing || !sirenes.length" class="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100">
              <option value="" disabled>Sélectionnez une sirène</option>
              <option v-for="sirene in sirenes" :key="sirene.id" :value="sirene.id">{{ sirene.numero_serie }}</option>
            </select>
          </div>

          <!-- Panne Details -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">Titre <span class="text-red-600">*</span></label>
            <input v-model="form.titre" type="text" required placeholder="Ex: Sirène ne fonctionne plus" class="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">Description</label>
            <textarea v-model="form.description" rows="4" placeholder="Décrivez le problème en détail..." class="w-full px-4 py-2 border border-gray-300 rounded-lg"></textarea>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">Priorité</label>
            <select v-model="form.priorite" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="faible">Faible</option>
              <option value="moyenne">Moyenne</option>
              <option value="haute">Haute</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>

          <div class="flex gap-4 pt-4">
            <button type="submit" :disabled="submitting" class="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold disabled:bg-red-400">
                <span v-if="submitting">{{ isEditing ? 'Mise à jour...' : 'Déclaration...' }}</span>
                <span v-else>{{ isEditing ? 'Mettre à jour' : 'Déclarer la panne' }}</span>
            </button>
            <button type="button" @click="$emit('close')" class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, type PropType } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notifications';
import { usePannes } from '@/composables/usePannes';
import ecoleService from '@/services/ecoleService';
import siteService from '@/services/siteService';
import sireneService from '@/services/sireneService';
import type { ApiEcole, ApiSite, ApiSirene, ApiPanne } from '@/types/api';
import { X } from 'lucide-vue-next';

const props = defineProps<{
  show: boolean;
  panneToEdit?: ApiPanne | null;
}>();

const emit = defineEmits(['close', 'panne-declaree', 'panne-updated']);

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const { declarerPanne, updatePanne } = usePannes();

const loading = ref(false);
const submitting = ref(false);

const isEditing = computed(() => !!props.panneToEdit);
const isAdmin = computed(() => authStore.isAdmin);
const isEcole = computed(() => authStore.isEcole);

const form = ref({
  sirene_id: '',
  titre: '',
  description: '',
  priorite: 'moyenne',
});

const ecoles = ref<ApiEcole[]>([]);
const sites = ref<ApiSite[]>([]);
const sirenes = ref<ApiSirene[]>([]);
const selectedEcole = ref<string | null>(null);
const selectedSite = ref<string | null>(null);

const resetForm = () => {
    form.value = { sirene_id: '', titre: '', description: '', priorite: 'moyenne' };
    if (isAdmin.value) selectedEcole.value = null;
    selectedSite.value = null;
    sites.value = [];
    sirenes.value = [];
};

const onEcoleChange = async () => {
  if (selectedEcole.value === null) return;
  selectedSite.value = null;
  form.value.sirene_id = '';
  sites.value = [];
  sirenes.value = [];
  loading.value = true;
  const response = await siteService.getSitesBySchool(selectedEcole.value);
  sites.value = response.data;
  loading.value = false;
};

const onSiteChange = async () => {
  if (selectedSite.value === null) return;
  form.value.sirene_id = '';
  sirenes.value = [];
  loading.value = true;
  const response = await sireneService.getSirensBySite(selectedSite.value);
  sirenes.value = response.data;
  loading.value = false;
};

const initialize = async () => {
    loading.value = true;
    resetForm();

    // Populate dropdowns
    if (isAdmin.value) {
        const ecolesResponse = await ecoleService.getAllEcoles();
        ecoles.value = ecolesResponse.data;
    } else if (isEcole.value) {
        selectedEcole.value = authStore.user!.user_account_type_id;
        await onEcoleChange();
    }

    // If editing, populate form
    if (isEditing.value && props.panneToEdit) {
        const panne = props.panneToEdit;
        selectedEcole.value = panne.ecole.id;
        await onEcoleChange();
        selectedSite.value = panne.site.id;
        await onSiteChange();
        
        form.value = {
            sirene_id: panne.sirene.id,
            titre: panne.titre,
            description: panne.description || '',
            priorite: panne.priorite as string,
        };
    }
    loading.value = false;
};

watch(() => props.show, (newVal) => {
  if (newVal) {
    initialize();
  }
});

const handleSubmit = async () => {
  if (!form.value.sirene_id) {
    notificationStore.error("Veuillez sélectionner une sirène.");
    return;
  }
  submitting.value = true;
  try {
    if (isEditing.value && props.panneToEdit) {
      await updatePanne(props.panneToEdit.id, form.value);
      notificationStore.success("Panne mise à jour avec succès !");
      emit('panne-updated');
    } else {
      await declarerPanne(form.value.sirene_id, form.value);
      notificationStore.success("Panne déclarée avec succès !");
      emit('panne-declaree');
    }
    emit('close');
  } catch (err) {
    notificationStore.error("Erreur lors de l'enregistrement de la panne.");
    console.error(err);
  } finally {
    submitting.value = false;
  }
};
</script>
