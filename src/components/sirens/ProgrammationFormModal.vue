<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-y-auto"
    @click.self="close"
  >
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" @click="close"></div>

      <!-- Modal panel -->
      <div class="inline-block w-full max-w-3xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
        <!-- Header -->
        <div class="flex items-start justify-between mb-6">
          <div>
            <h3 class="text-2xl font-bold text-gray-900">
              {{ isEditMode ? 'Modifier la programmation' : 'Créer une programmation' }}
            </h3>
            <p class="text-sm text-gray-600 mt-1">
              {{ stepDescriptions[currentStep] }}
            </p>
          </div>
          <button
            @click="close"
            class="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
            aria-label="Fermer le modal"
          >
            <X :size="24" aria-hidden="true" />
          </button>
        </div>

        <!-- Progress Steps -->
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div
              v-for="(step, index) in steps"
              :key="index"
              class="flex-1 flex items-center"
            >
              <div class="flex items-center">
                <div
                  :class="[
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all',
                    currentStep === index
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : currentStep > index
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500',
                  ]"
                >
                  <Check v-if="currentStep > index" :size="20" />
                  <span v-else>{{ index + 1 }}</span>
                </div>
                <div class="ml-3 hidden sm:block">
                  <p
                    :class="[
                      'text-sm font-semibold',
                      currentStep === index ? 'text-blue-600' : 'text-gray-600',
                    ]"
                  >
                    {{ step }}
                  </p>
                </div>
              </div>
              <div
                v-if="index < steps.length - 1"
                :class="[
                  'flex-1 h-1 mx-4 rounded transition-all',
                  currentStep > index ? 'bg-green-500' : 'bg-gray-200',
                ]"
              ></div>
            </div>
          </div>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Étape 1: Informations générales -->
          <div v-if="currentStep === 0" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Nom de la programmation <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.nom_programmation"
                type="text"
                required
                placeholder="Ex: Sonnerie du matin"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{ 'border-red-500': errors.nom_programmation }"
              />
              <p v-if="errors.nom_programmation" class="text-sm text-red-600 mt-1">{{ errors.nom_programmation }}</p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Date de début <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.date_debut"
                  type="date"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :class="{ 'border-red-500': errors.date_debut }"
                />
                <p v-if="errors.date_debut" class="text-sm text-red-600 mt-1">{{ errors.date_debut }}</p>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Date de fin <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.date_fin"
                  type="date"
                  required
                  :min="formData.date_debut"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :class="{ 'border-red-500': errors.date_fin }"
                />
                <p v-if="errors.date_fin" class="text-sm text-red-600 mt-1">{{ errors.date_fin }}</p>
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Calendrier scolaire associé
              </label>
              <select
                v-model="formData.calendrier_id"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Aucun calendrier --</option>
                <option v-for="cal in calendriers" :key="cal.id" :value="cal.id">
                  {{ cal.annee_scolaire }} - {{ cal.description || 'Sans description' }}
                </option>
              </select>
              <p class="text-xs text-gray-500 mt-1">Optionnel: lier à un calendrier scolaire spécifique</p>
            </div>
          </div>

          <!-- Étape 2: Horaires (Format ESP8266) -->
          <div v-if="currentStep === 1" class="space-y-4">
            <div>
              <div class="flex items-center justify-between mb-3">
                <label class="block text-sm font-semibold text-gray-700">
                  Horaires de sonnerie <span class="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  @click="ajouterHoraire"
                  class="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                >
                  <Plus :size="16" />
                  Ajouter un horaire
                </button>
              </div>

              <div class="space-y-3">
                <div
                  v-for="(horaire, index) in formData.horaires_sonneries"
                  :key="index"
                  class="p-4 bg-gray-50 rounded-lg space-y-3"
                >
                  <div class="flex items-center gap-3">
                    <Clock :size="20" class="text-gray-400" />

                    <!-- Heure -->
                    <div class="flex-1">
                      <label class="text-xs text-gray-600 block mb-1">Heure</label>
                      <input
                        v-model.number="horaire.heure"
                        type="number"
                        required
                        min="0"
                        max="23"
                        placeholder="08"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <!-- Minute -->
                    <div class="flex-1">
                      <label class="text-xs text-gray-600 block mb-1">Minute</label>
                      <input
                        v-model.number="horaire.minute"
                        type="number"
                        required
                        min="0"
                        max="59"
                        placeholder="00"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <button
                      type="button"
                      @click="supprimerHoraire(index)"
                      class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-6"
                      :disabled="formData.horaires_sonneries.length === 1"
                    >
                      <Trash :size="18" />
                    </button>
                  </div>

                  <!-- Jours pour cet horaire -->
                  <div>
                    <label class="text-xs text-gray-600 block mb-2">Jours actifs pour cet horaire</label>
                    <div class="grid grid-cols-7 gap-2">
                      <button
                        v-for="jour in joursOptions"
                        :key="jour.value"
                        type="button"
                        @click="toggleJourForHoraire(index, jour.value)"
                        :class="[
                          'px-2 py-2 rounded-lg font-semibold text-xs transition-all',
                          horaire.jours.includes(jour.value)
                            ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                        ]"
                      >
                        {{ jour.label }}
                      </button>
                    </div>
                    <p v-if="horaire.jours.length === 0" class="text-xs text-red-600 mt-1">
                      Au moins un jour doit être sélectionné
                    </p>
                  </div>

                  <!-- Aperçu -->
                  <div class="flex items-center gap-2 text-xs text-gray-600 bg-white p-2 rounded">
                    <Info :size="14" />
                    <span>
                      Sonnerie à {{ String(horaire.heure).padStart(2, '0') }}:{{ String(horaire.minute).padStart(2, '0') }}
                      - {{ horaire.jours.length }} jour(s) sélectionné(s)
                    </span>
                  </div>
                </div>

                <p v-if="formData.horaires_sonneries.length === 0" class="text-sm text-gray-500 text-center py-4">
                  Aucun horaire défini. Cliquez sur "Ajouter un horaire" pour commencer.
                </p>
              </div>
            </div>

            <div class="p-4 bg-blue-50 rounded-lg">
              <div class="flex items-start gap-3">
                <Info :size="20" class="text-blue-600 mt-0.5" />
                <div>
                  <p class="text-sm font-semibold text-blue-900 mb-1">Format ESP8266</p>
                  <p class="text-xs text-blue-700">
                    Les horaires sont triés automatiquement par ordre chronologique.
                    Les jours sont numérotés : 0=Dimanche, 1=Lundi, 2=Mardi, 3=Mercredi, 4=Jeudi, 5=Vendredi, 6=Samedi
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Étape 3: Exceptions -->
          <div v-if="currentStep === 2" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-3">
                Jours fériés
              </label>
              <div class="space-y-2">
                <label class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    v-model="formData.jours_feries_inclus"
                    type="checkbox"
                    class="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span class="text-sm text-gray-700">Activer pendant les jours fériés</span>
                </label>
              </div>
            </div>

            <!-- Section visible uniquement si jours fériés activés -->
            <div v-if="formData.jours_feries_inclus">
              <div class="flex items-center justify-between mb-3">
                <label class="block text-sm font-semibold text-gray-700">
                  Exceptions de jours fériés
                </label>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    @click="chargerJoursFeriesCalendrier"
                    :disabled="!formData.calendrier_id || loadingJoursFeries"
                    class="px-3 py-1.5 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Charger les jours fériés du calendrier sélectionné"
                  >
                    <Calendar :size="16" />
                    {{ loadingJoursFeries ? 'Chargement...' : 'Charger du calendrier' }}
                  </button>
                  <button
                    type="button"
                    @click="ajouterException"
                    class="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                  >
                    <Plus :size="16" />
                    Ajouter manuellement
                  </button>
                </div>
              </div>

              <!-- Jours fériés chargés du calendrier -->
              <div v-if="joursFeriesCalendrier.length > 0" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div class="flex items-center gap-2 mb-3">
                  <Calendar :size="16" class="text-green-600" />
                  <span class="text-sm font-semibold text-green-800">
                    {{ joursFeriesCalendrier.length }} jour(s) férié(s) du calendrier
                  </span>
                </div>
                <div class="space-y-2 max-h-60 overflow-y-auto">
                  <div
                    v-for="jf in joursFeriesCalendrier"
                    :key="jf.id"
                    class="flex items-center justify-between p-2 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div class="flex items-center gap-2 flex-1">
                      <span class="font-medium text-gray-900 text-sm">{{ jf.intitule_journee }}</span>
                      <span class="text-gray-600 text-xs">{{ new Date(jf.date).toLocaleDateString('fr-FR') }}</span>
                      <span v-if="jf.est_national" class="text-xs" title="National">🏛️</span>
                      <span v-if="jf.recurrent" class="text-xs" title="Récurrent">🔄</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span
                        v-if="getJourFerieExceptionAction(jf.date) === 'include'"
                        class="text-xs px-2 py-1 bg-green-100 text-green-700 rounded font-medium"
                      >
                        Inclus
                      </span>
                      <span
                        v-else-if="getJourFerieExceptionAction(jf.date) === 'exclude'"
                        class="text-xs px-2 py-1 bg-red-100 text-red-700 rounded font-medium"
                      >
                        Exclu
                      </span>
                      <button
                        v-if="getJourFerieExceptionAction(jf.date) === 'include'"
                        @click="toggleJourFerieAction(jf.date)"
                        class="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center gap-1"
                        title="Exclure ce jour férié"
                      >
                        <X :size="14" />
                        Exclure
                      </button>
                      <button
                        v-else-if="getJourFerieExceptionAction(jf.date) === 'exclude'"
                        @click="toggleJourFerieAction(jf.date)"
                        class="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center gap-1"
                        title="Inclure ce jour férié"
                      >
                        <Check :size="14" />
                        Inclure
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="space-y-3">
                <div
                  v-for="(exception, index) in formData.jours_feries_exceptions"
                  :key="index"
                  class="p-3 bg-gray-50 rounded-lg space-y-3"
                >
                  <!-- Ligne 1: Intitulé -->
                  <div class="flex items-center gap-3">
                    <input
                      v-model="exception.intitule_journee"
                      type="text"
                      placeholder="Nom du jour férié (ex: Noël, Nouvel An)"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <!-- Ligne 2: Date et Action -->
                  <div class="flex items-center gap-3">
                    <Calendar :size="20" class="text-gray-400" />
                    <input
                      v-model="exception.date"
                      type="date"
                      required
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      v-model="exception.action"
                      class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="exclude">Exclure</option>
                      <option value="include">Inclure</option>
                    </select>
                    <button
                      type="button"
                      @click="supprimerException(index)"
                      class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash :size="18" />
                    </button>
                  </div>

                  <!-- Ligne 3: Checkboxes pour est_national et recurrent -->
                  <div class="flex items-center gap-4 ml-9">
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input
                        v-model="exception.est_national"
                        type="checkbox"
                        class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span class="text-xs text-gray-700">National</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input
                        v-model="exception.recurrent"
                        type="checkbox"
                        class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span class="text-xs text-gray-700">Récurrent (annuel)</span>
                    </label>
                  </div>
                </div>

                <p v-if="formData.jours_feries_exceptions.length === 0" class="text-sm text-gray-500 text-center py-4">
                  Aucune exception définie.
                </p>
              </div>
            </div>

            <div v-if="formData.jours_feries_inclus" class="p-4 bg-blue-50 rounded-lg">
              <div class="flex items-start gap-3">
                <AlertCircle :size="20" class="text-blue-600 mt-0.5" />
                <div>
                  <p class="text-sm font-semibold text-blue-900 mb-1">Gestion des jours fériés</p>
                  <p class="text-xs text-blue-700">
                    Après avoir chargé les jours fériés, tous sont automatiquement <strong>inclus</strong>.
                    Cliquez sur "Exclure" pour désactiver la sonnerie sur un jour férié spécifique.
                    Vous pouvez basculer entre "Inclure" et "Exclure" à tout moment.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Étape 4: Validation -->
          <div v-if="currentStep === 3" class="space-y-4">
            <div class="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
              <h4 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle :size="24" class="text-green-600" />
                Résumé de la programmation
              </h4>

              <div class="space-y-3 text-sm">
                <div class="flex justify-between p-3 bg-white rounded-lg">
                  <span class="text-gray-600 font-semibold">Nom:</span>
                  <span class="text-gray-900">{{ formData.nom_programmation || 'Non défini' }}</span>
                </div>

                <div class="flex justify-between p-3 bg-white rounded-lg">
                  <span class="text-gray-600 font-semibold">Période:</span>
                  <span class="text-gray-900">{{ formData.date_debut }} → {{ formData.date_fin }}</span>
                </div>

                <div class="flex justify-between p-3 bg-white rounded-lg">
                  <span class="text-gray-600 font-semibold">Nombre d'horaires:</span>
                  <span class="text-gray-900">{{ formData.horaires_sonneries.length }}</span>
                </div>

                <div class="p-3 bg-white rounded-lg">
                  <span class="text-gray-600 font-semibold block mb-2">Horaires:</span>
                  <div class="space-y-2">
                    <div
                      v-for="(horaire, idx) in formData.horaires_sonneries"
                      :key="idx"
                      class="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <span class="font-mono text-blue-700 font-semibold">
                        {{ String(horaire.heure).padStart(2, '0') }}:{{ String(horaire.minute).padStart(2, '0') }}
                      </span>
                      <div class="flex gap-1">
                        <span
                          v-for="jourNum in horaire.jours"
                          :key="jourNum"
                          class="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold"
                        >
                          {{ getJourLabelFromNum(jourNum) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="flex justify-between p-3 bg-white rounded-lg">
                  <span class="text-gray-600 font-semibold">Jours fériés inclus:</span>
                  <span class="text-gray-900">{{ formData.jours_feries_inclus ? 'Oui' : 'Non' }}</span>
                </div>

                <div class="flex justify-between p-3 bg-white rounded-lg">
                  <span class="text-gray-600 font-semibold">Exceptions:</span>
                  <span class="text-gray-900">{{ formData.jours_feries_exceptions.length }}</span>
                </div>
              </div>
            </div>

            <div class="p-4 bg-purple-50 rounded-lg">
              <div class="flex items-start gap-3">
                <Key :size="20" class="text-purple-600 mt-0.5" />
                <div class="flex-1">
                  <p class="text-sm font-semibold text-purple-900 mb-2">Données de programmation ESP8266</p>
                  <div class="p-3 bg-white rounded-lg font-mono text-xs text-gray-700 break-all max-h-32 overflow-y-auto">
                    {{ JSON.stringify(formData.horaires_sonneries, null, 2) }}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  v-model="formData.actif"
                  type="checkbox"
                  class="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span class="text-sm text-gray-700 font-semibold">Activer immédiatement cette programmation</span>
              </label>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-4 border-t border-gray-200">
            <button
              v-if="currentStep > 0"
              type="button"
              @click="previousStep"
              class="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <ChevronLeft :size="20" />
              Précédent
            </button>
            <button
              type="button"
              @click="close"
              class="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              Annuler
            </button>
            <button
              v-if="currentStep < steps.length - 1"
              type="button"
              @click="nextStep"
              :disabled="!canProceedToNextStep()"
              class="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
              <ChevronRight :size="20" />
            </button>
            <button
              v-if="currentStep === steps.length - 1"
              type="submit"
              :disabled="loading"
              class="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send :size="20" />
              {{ loading ? 'En cours...' : (isEditMode ? 'Modifier' : 'Créer et envoyer') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import {
  X,
  Check,
  Clock,
  Calendar,
  Plus,
  Trash,
  Info,
  AlertCircle,
  CheckCircle,
  Key,
  ChevronLeft,
  ChevronRight,
  Send,
} from 'lucide-vue-next'
import { useAsyncAction } from '@/composables/useAsyncAction'
import { useNotificationStore } from '@/stores/notifications'
import programmationService from '@/services/programmationService'
import calendrierScolaireService, { type CalendrierScolaire, type JourFerie } from '@/services/calendrierScolaireService'
import jourFerieService from '@/services/jourFerieService'
import sirenService from '@/services/sirenService'
import type {
  ApiProgrammation,
  CreateProgrammationRequest,
  HoraireSonnerie,
  JourFerieException,
  ApiSiren,
} from '@/types/api'

const props = defineProps<{
  isOpen: boolean
  sireneId: string
  programmation?: ApiProgrammation | null
}>()

const emit = defineEmits<{
  close: []
  save: []
}>()

const { loading, execute } = useAsyncAction()
const notificationStore = useNotificationStore()

const currentStep = ref(0)
const steps = ['Informations', 'Horaires', 'Exceptions', 'Validation']
const stepDescriptions = [
  'Définissez les informations de base et la période',
  'Configurez les horaires de sonnerie au format ESP8266',
  'Gérez les jours fériés et exceptions',
  'Vérifiez et validez la programmation',
]

interface FormData {
  nom_programmation: string
  date_debut: string
  date_fin: string
  actif: boolean
  calendrier_id: string
  horaires_sonneries: HoraireSonnerie[]
  jours_feries_inclus: boolean
  jours_feries_exceptions: JourFerieException[]
}

// Obtenir la date actuelle et dans 1 an
const today = new Date().toISOString().split('T')[0]
const oneYearLater = new Date(new Date().setFullYear(new Date().getFullYear() + 1))
  .toISOString()
  .split('T')[0]

const formData = ref<FormData>({
  nom_programmation: '',
  date_debut: today,
  date_fin: oneYearLater,
  actif: true,
  calendrier_id: '',
  horaires_sonneries: [
    { heure: 8, minute: 0, jours: [1, 2, 3, 4, 5] }, // Lun-Ven 08:00
  ],
  jours_feries_inclus: false,
  jours_feries_exceptions: [],
})

const errors = ref<Record<string, string>>({})

// 0=Dimanche, 1=Lundi, ..., 6=Samedi
const joursOptions = [
  { label: 'Dim', value: 0 },
  { label: 'Lun', value: 1 },
  { label: 'Mar', value: 2 },
  { label: 'Mer', value: 3 },
  { label: 'Jeu', value: 4 },
  { label: 'Ven', value: 5 },
  { label: 'Sam', value: 6 },
]

const isEditMode = computed(() => !!props.programmation && !!props.programmation.id)

// Calendriers et jours fériés
const calendriers = ref<CalendrierScolaire[]>([])
const joursFeriesCalendrier = ref<JourFerie[]>([])
const loadingJoursFeries = ref(false)
const sireneData = ref<ApiSiren | null>(null)

// Reset form to defaults
const resetForm = () => {
  formData.value = {
    nom_programmation: '',
    date_debut: today,
    date_fin: oneYearLater,
    actif: true,
    calendrier_id: '',
    horaires_sonneries: [{ heure: 8, minute: 0, jours: [1, 2, 3, 4, 5] }],
    jours_feries_inclus: false,
    jours_feries_exceptions: [],
  }
  currentStep.value = 0
  errors.value = {}
}

// Watch for programmation changes
watch(
  () => props.programmation,
  (newProg) => {
    if (newProg) {
      formData.value = {
        nom_programmation: newProg.nom_programmation,
        date_debut: newProg.date_debut,
        date_fin: newProg.date_fin,
        actif: newProg.actif,
        calendrier_id: newProg.calendrier_id || '',
        horaires_sonneries: JSON.parse(JSON.stringify(newProg.horaires_sonneries)),
        jours_feries_inclus: newProg.jours_feries_inclus,
        jours_feries_exceptions: JSON.parse(
          JSON.stringify(newProg.jours_feries_exceptions || [])
        ),
      }
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

// Navigation
const nextStep = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const canProceedToNextStep = (): boolean => {
  switch (currentStep.value) {
    case 0:
      return (
        !!formData.value.nom_programmation.trim() &&
        !!formData.value.date_debut &&
        !!formData.value.date_fin &&
        formData.value.date_debut <= formData.value.date_fin
      )
    case 1:
      return (
        formData.value.horaires_sonneries.length > 0 &&
        formData.value.horaires_sonneries.every((h) => h.jours.length > 0)
      )
    case 2:
      return true
    default:
      return true
  }
}

// Horaires
const ajouterHoraire = () => {
  formData.value.horaires_sonneries.push({
    heure: 8,
    minute: 0,
    jours: [1, 2, 3, 4, 5],
  })
}

const supprimerHoraire = (index: number) => {
  if (formData.value.horaires_sonneries.length > 1) {
    formData.value.horaires_sonneries.splice(index, 1)
  }
}

const toggleJourForHoraire = (horaireIndex: number, jourValue: number) => {
  const horaire = formData.value.horaires_sonneries[horaireIndex]
  const index = horaire.jours.indexOf(jourValue)
  if (index > -1) {
    horaire.jours.splice(index, 1)
  } else {
    horaire.jours.push(jourValue)
  }
}

const getJourLabelFromNum = (num: number): string => {
  const found = joursOptions.find((j) => j.value === num)
  return found?.label || String(num)
}

// Exceptions
const ajouterException = () => {
  formData.value.jours_feries_exceptions.push({
    date: today,
    action: formData.value.jours_feries_inclus ? 'exclude' : 'include',
    est_national: false,
    recurrent: false,
    intitule_journee: null
  })
}

const supprimerException = (index: number) => {
  formData.value.jours_feries_exceptions.splice(index, 1)
}

// Vérifier si un jour férié est déjà dans les exceptions
const isJourFerieInExceptions = (date: string): boolean => {
  return formData.value.jours_feries_exceptions.some(ex => ex.date === date)
}

// Obtenir l'action d'un jour férié (include/exclude) ou null s'il n'existe pas
const getJourFerieExceptionAction = (date: string): 'include' | 'exclude' | null => {
  const exception = formData.value.jours_feries_exceptions.find(ex => ex.date === date)
  return exception ? exception.action : null
}

// Basculer l'action d'un jour férié entre include et exclude
const toggleJourFerieAction = (date: string) => {
  const exception = formData.value.jours_feries_exceptions.find(ex => ex.date === date)
  if (exception) {
    exception.action = exception.action === 'include' ? 'exclude' : 'include'
  }
}

// Ajouter un jour férié comme exception
const ajouterJourFerieCommeException = (jourFerie: JourFerie, action: 'include' | 'exclude') => {
  if (isJourFerieInExceptions(jourFerie.date)) {
    notificationStore.warning('Ce jour férié est déjà dans les exceptions')
    return
  }

  formData.value.jours_feries_exceptions.push({
    date: jourFerie.date,
    action,
    est_national: jourFerie.est_national,
    recurrent: jourFerie.recurrent,
    intitule_journee: jourFerie.intitule_journee
  })
}

// Charger les données de la sirène
const loadSireneData = async () => {
  const result = await execute(
    () => sirenService.getSirenById(props.sireneId),
    { errorMessage: 'Impossible de charger les données de la sirène', showNotification: false }
  )

  if (result?.success && result.data) {
    sireneData.value = result.data
  }
}

// Charger les calendriers disponibles
const loadCalendriers = async () => {
  // D'abord charger les données de la sirène si pas déjà fait
  if (!sireneData.value) {
    await loadSireneData()
  }

  // Filtrer par pays du site de la sirène si disponible
  const codeIso = sireneData.value?.site?.ville?.pays?.code_iso

  // Obtenir l'année scolaire en cours
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1 // 1-12

  let anneeScolaire: string | undefined
  if (currentMonth >= 9) {
    // Septembre à décembre: année scolaire YYYY-(YYYY+1)
    anneeScolaire = `${currentYear}-${currentYear + 1}`
  } else {
    // Janvier à août: année scolaire (YYYY-1)-YYYY
    anneeScolaire = `${currentYear - 1}-${currentYear}`
  }

  const result = await execute(
    () => calendrierScolaireService.getAll(100, codeIso, anneeScolaire, true),
    { errorMessage: 'Impossible de charger les calendriers', showNotification: false }
  )

  if (result?.success && result.data) {
    calendriers.value = result.data
  }
}

// Charger les jours fériés du calendrier sélectionné
// Fonction basée sur loadJoursFeriesFromAPI de CalendarView
const chargerJoursFeriesCalendrier = async () => {
  if (!formData.value.calendrier_id) {
    notificationStore.warning('Veuillez d\'abord sélectionner un calendrier')
    return
  }

  loadingJoursFeries.value = true

  try {
    const ecoleId = sireneData.value?.ecole_id

    if (ecoleId) {
      // École sélectionnée: charger jours fériés du calendrier + école
      const [calendrierResponse, ecoleResponse] = await Promise.all([
        // Jours fériés du calendrier uniquement (sans écoles)
        jourFerieService.getJoursFeries({
          calendrier_id: formData.value.calendrier_id,
          ecole_id: 'null',
          per_page: 1000
        }),
        // Jours fériés spécifiques à l'école
        jourFerieService.getJoursFeries({
          calendrier_id: formData.value.calendrier_id,
          ecole_id: ecoleId,
          per_page: 1000
        })
      ])

      // Merger les deux listes avec déduplication par date
      const joursFeriesCalendrierData = Array.isArray(calendrierResponse.data)
        ? calendrierResponse.data
        : (calendrierResponse.data as any)?.data || []

      const joursFeriesEcoleData = Array.isArray(ecoleResponse.data)
        ? ecoleResponse.data
        : (ecoleResponse.data as any)?.data || []

      // Use Map to deduplicate by date - école-specific overrides calendrier
      const joursFeriesMap = new Map<string, JourFerie>()

      // Add calendrier holidays first
      joursFeriesCalendrierData.forEach((jf: JourFerie) => {
        joursFeriesMap.set(jf.date, jf)
      })

      // Override with école-specific holidays (higher priority)
      joursFeriesEcoleData.forEach((jf: JourFerie) => {
        joursFeriesMap.set(jf.date, jf)
      })

      joursFeriesCalendrier.value = Array.from(joursFeriesMap.values())
    } else {
      // Pas d'école sélectionnée: charger uniquement les jours fériés du calendrier (sans écoles)
      const response = await jourFerieService.getJoursFeries({
        calendrier_id: formData.value.calendrier_id,
        ecole_id: 'null',
        per_page: 1000
      })

      if (response.success && response.data) {
        const data = Array.isArray(response.data) ? response.data : (response.data as any).data || []
        joursFeriesCalendrier.value = data
      }
    }

    // Ajouter automatiquement tous les jours fériés comme exceptions avec action="include"
    if (joursFeriesCalendrier.value.length > 0) {
      let addedCount = 0
      joursFeriesCalendrier.value.forEach(jourFerie => {
        // Vérifier si l'exception n'existe pas déjà
        if (!isJourFerieInExceptions(jourFerie.date)) {
          formData.value.jours_feries_exceptions.push({
            date: jourFerie.date,
            action: 'include',
            est_national: jourFerie.est_national,
            recurrent: jourFerie.recurrent,
            intitule_journee: jourFerie.intitule_journee
          })
          addedCount++
        }
      })

      if (addedCount > 0) {
        notificationStore.success(`${addedCount} jour(s) férié(s) ajouté(s) comme inclus`)
      } else {
        notificationStore.info('Tous les jours fériés sont déjà dans les exceptions')
      }
    } else {
      notificationStore.info('Aucun jour férié trouvé pour ce calendrier')
    }
  } catch (error: any) {
    console.error('Failed to load jours feries:', error)
    notificationStore.error('Erreur', 'Impossible de charger les jours fériés')
    joursFeriesCalendrier.value = []
  } finally {
    loadingJoursFeries.value = false
  }
}

// Trier les horaires par ordre chronologique
const trierHoraires = () => {
  formData.value.horaires_sonneries.sort((a, b) => {
    const timeA = a.heure * 60 + a.minute
    const timeB = b.heure * 60 + b.minute
    return timeA - timeB
  })
}

// Handle submit
const handleSubmit = async () => {
  errors.value = {}

  // Validation
  if (!formData.value.nom_programmation.trim()) {
    errors.value.nom_programmation = 'Le nom est requis'
    currentStep.value = 0
    return
  }

  if (!formData.value.date_debut || !formData.value.date_fin) {
    notificationStore.error('Les dates de début et de fin sont requises')
    currentStep.value = 0
    return
  }

  if (formData.value.date_debut > formData.value.date_fin) {
    errors.value.date_fin = 'La date de fin doit être après la date de début'
    currentStep.value = 0
    return
  }

  if (formData.value.horaires_sonneries.length === 0) {
    notificationStore.error('Au moins un horaire est requis')
    currentStep.value = 1
    return
  }

  // Vérifier que tous les horaires ont au moins un jour
  const horairesSansJour = formData.value.horaires_sonneries.some((h) => h.jours.length === 0)
  if (horairesSansJour) {
    notificationStore.error('Chaque horaire doit avoir au moins un jour sélectionné')
    currentStep.value = 1
    return
  }

  // Trier les horaires avant envoi
  trierHoraires()

  // Trier les jours dans chaque horaire
  formData.value.horaires_sonneries.forEach((h) => {
    h.jours.sort((a, b) => a - b)
  })

  // Prepare request data
  const requestData: CreateProgrammationRequest = {
    nom_programmation: formData.value.nom_programmation,
    date_debut: formData.value.date_debut,
    date_fin: formData.value.date_fin,
    actif: formData.value.actif,
    calendrier_id: formData.value.calendrier_id || null,
    horaires_sonneries: formData.value.horaires_sonneries,
    jours_feries_inclus: formData.value.jours_feries_inclus,
    jours_feries_exceptions: formData.value.jours_feries_exceptions,
  }

  // Call API
  const result = await execute(
    () =>
      isEditMode.value
        ? programmationService.updateProgrammation(
            props.sireneId,
            props.programmation!.id,
            requestData
          )
        : programmationService.createProgrammation(props.sireneId, requestData),
    {
      errorMessage: isEditMode.value
        ? 'Impossible de modifier la programmation'
        : 'Impossible de créer la programmation',
      showNotification: false,
    }
  )

  if (result?.success) {
    notificationStore.success(
      isEditMode.value ? 'Programmation modifiée avec succès' : 'Programmation créée avec succès'
    )
    emit('save')
    close()
  }
}

const close = () => {
  resetForm()
  emit('close')
}

// Charger les calendriers au montage
onMounted(() => {
  loadCalendriers()
})
</script>
