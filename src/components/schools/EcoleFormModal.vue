<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click="close"
  >
    <div
      class="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      @click.stop
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-600 to-cyan-600">
        <div class="text-white">
          <h2 class="text-2xl font-bold">{{ isEditMode ? "Modifier l'école" : "Enregistrement d'une nouvelle école" }}</h2>
          <p class="text-blue-100 text-sm mt-1">{{ isEditMode ? "Modifiez les informations de l'établissement" : "Remplissez les informations de l'établissement" }}</p>
        </div>
        <button
          @click="close"
          class="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
        >
          <X :size="24" />
        </button>
      </div>

      <!-- Steps Indicator -->
      <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div class="flex items-center justify-between">
          <div
            v-for="(step, index) in steps"
            :key="index"
            class="flex items-center flex-1"
          >
            <div class="flex items-center gap-2">
              <div
                :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all',
                  currentStep >= index
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                ]"
              >
                {{ index + 1 }}
              </div>
              <span
                :class="[
                  'text-sm font-medium',
                  currentStep >= index ? 'text-gray-900' : 'text-gray-500'
                ]"
              >
                {{ step }}
              </span>
            </div>
            <div
              v-if="index < steps.length - 1"
              :class="[
                'flex-1 h-1 mx-4',
                currentStep > index ? 'bg-blue-600' : 'bg-gray-300'
              ]"
            ></div>
          </div>
        </div>
      </div>

      <!-- Form Content -->
      <div class="flex-1 overflow-y-auto px-6 py-6">
        <!-- Step 1: École -->
        <div v-show="currentStep === 0" class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Informations de l'école</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Nom de l'école <span class="text-red-600">*</span>
              </label>
              <input
                v-model="formData.nom"
                type="text"
                placeholder="Ex: École Primaire Wemtenga"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                :class="{ 'border-red-500': errors.nom }"
              />
              <p v-if="errors.nom" class="text-sm text-red-600 mt-1">{{ errors.nom }}</p>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Nom complet <span class="text-red-600">*</span>
              </label>
              <input
                v-model="formData.nom_complet"
                type="text"
                placeholder="Ex: Complexe Scolaire Privé Wemtenga"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                :class="{ 'border-red-500': errors.nom_complet }"
              />
              <p v-if="errors.nom_complet" class="text-sm text-red-600 mt-1">{{ errors.nom_complet }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Pays <span class="text-red-600">*</span>
              </label>
              <select
                v-model="selectedPaysContact"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner un pays</option>
                <option v-for="p in pays" :key="p.id" :value="p.id">
                  {{ p.nom }} ({{ p.indicatif_tel }})
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Téléphone de contact <span class="text-red-600">*</span>
              </label>
              <div class="flex gap-2">
                <input
                  v-if="selectedPaysContact && getPaysById(selectedPaysContact)"
                  type="text"
                  :value="getPaysById(selectedPaysContact)?.indicatif_tel"
                  disabled
                  class="w-24 px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 font-semibold"
                />
                <input
                  v-model="formData.telephone_contact"
                  type="tel"
                  placeholder="XX XX XX XX"
                  class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  :class="{ 'border-red-500': errors.telephone_contact }"
                />
              </div>
              <p v-if="errors.telephone_contact" class="text-sm text-red-600 mt-1">{{ errors.telephone_contact }}</p>
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Email de contact
            </label>
            <input
              v-model="formData.email_contact"
              type="email"
              placeholder="contact@ecole.bf"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              :class="{ 'border-red-500': errors.email_contact }"
            />
            <p v-if="errors.email_contact" class="text-sm text-red-600 mt-1">{{ errors.email_contact }}</p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Type d'école <span class="text-red-600">*</span>
            </label>
            <div class="flex gap-4">
              <label class="flex items-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                :class="{ 'bg-blue-50 border-blue-500': formData.est_prive === false }"
              >
                <input
                  type="radio"
                  :value="false"
                  v-model="formData.est_prive"
                  class="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span class="text-sm font-medium text-gray-900">Publique</span>
              </label>
              <label class="flex items-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                :class="{ 'bg-blue-50 border-blue-500': formData.est_prive === true }"
              >
                <input
                  type="radio"
                  :value="true"
                  v-model="formData.est_prive"
                  class="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span class="text-sm font-medium text-gray-900">Privée</span>
              </label>
            </div>
            <p v-if="errors.est_prive" class="text-sm text-red-600 mt-1">{{ errors.est_prive }}</p>
          </div>
        </div>

        <!-- Step 2: Responsable -->
        <div v-show="currentStep === 1" class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Informations du responsable</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Nom du responsable <span class="text-red-600">*</span>
              </label>
              <input
                v-model="formData.responsable_nom"
                type="text"
                placeholder="Nom"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                :class="{ 'border-red-500': errors.responsable_nom }"
              />
              <p v-if="errors.responsable_nom" class="text-sm text-red-600 mt-1">{{ errors.responsable_nom }}</p>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Prénom du responsable <span class="text-red-600">*</span>
              </label>
              <input
                v-model="formData.responsable_prenom"
                type="text"
                placeholder="Prénom"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                :class="{ 'border-red-500': errors.responsable_prenom }"
              />
              <p v-if="errors.responsable_prenom" class="text-sm text-red-600 mt-1">{{ errors.responsable_prenom }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Pays <span class="text-red-600">*</span>
              </label>
              <select
                v-model="selectedPaysResponsable"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner un pays</option>
                <option v-for="p in pays" :key="p.id" :value="p.id">
                  {{ p.nom }} ({{ p.indicatif_tel }})
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Téléphone du responsable <span class="text-red-600">*</span>
              </label>
              <div class="flex gap-2">
                <input
                  v-if="selectedPaysResponsable && getPaysById(selectedPaysResponsable)"
                  type="text"
                  :value="getPaysById(selectedPaysResponsable)?.indicatif_tel"
                  disabled
                  class="w-24 px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 font-semibold"
                />
                <input
                  v-model="formData.responsable_telephone"
                  type="tel"
                  placeholder="XX XX XX XX"
                  class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  :class="{ 'border-red-500': errors.responsable_telephone }"
                />
              </div>
              <p v-if="errors.responsable_telephone" class="text-sm text-red-600 mt-1">{{ errors.responsable_telephone }}</p>
            </div>
          </div>
        </div>

        <!-- Step 3: Site Principal -->
        <div v-show="currentStep === 2" class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Site principal</h3>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Adresse <span class="text-red-600">*</span>
            </label>
            <textarea
              v-model="formData.site_principal.adresse"
              rows="2"
              placeholder="Adresse complète du site principal"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              :class="{ 'border-red-500': errors['site_principal.adresse'] }"
            ></textarea>
            <p v-if="errors['site_principal.adresse']" class="text-sm text-red-600 mt-1">{{ errors['site_principal.adresse'] }}</p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Ville <span class="text-red-600">*</span>
            </label>
            <select
              v-model="formData.site_principal.ville_id"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              :class="{ 'border-red-500': errors['site_principal.ville_id'] }"
            >
              <option value="">Sélectionner une ville</option>
              <option v-for="ville in villes" :key="ville.id" :value="ville.id">
                {{ ville.nom }}
              </option>
            </select>
            <p v-if="errors['site_principal.ville_id']" class="text-sm text-red-600 mt-1">{{ errors['site_principal.ville_id'] }}</p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Types d'établissement <span class="text-red-600">*</span>
            </label>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <label
                v-for="type in typesEtablissement"
                :key="type.value"
                class="flex items-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                :class="{ 'bg-blue-50 border-blue-500': formData.site_principal.types_etablissement.includes(type.value) }"
              >
                <input
                  type="checkbox"
                  :value="type.value"
                  v-model="formData.site_principal.types_etablissement"
                  class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span class="text-sm font-medium text-gray-900">{{ type.label }}</span>
              </label>
            </div>
            <p v-if="errors['site_principal.types_etablissement']" class="text-sm text-red-600 mt-1">{{ errors['site_principal.types_etablissement'] }}</p>
          </div>

          <!-- Location Picker for Site Principal -->
          <LocationPicker
            v-model="sitePrincipalLocation"
            label="Localisation GPS du site principal (optionnel)"
          />

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Sirène <span class="text-red-600">*</span>
            </label>

            <!-- Mode édition : afficher les détails de la sirène avec icône crayon -->
            <div v-if="isEditMode && !isEditingSirenePrincipal && formData.site_principal.sirene.numero_serie" class="border border-gray-300 rounded-lg p-4 bg-gradient-to-br from-purple-50 to-pink-50">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bell :size="20" class="text-white" />
                  </div>
                  <div>
                    <p class="text-xs text-purple-600 font-semibold">Sirène installée</p>
                    <p class="text-base font-bold text-purple-900">{{ formData.site_principal.sirene.numero_serie }}</p>
                  </div>
                </div>
                <button
                  @click="isEditingSirenePrincipal = true"
                  type="button"
                  class="px-3 py-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-2"
                  title="Modifier la sirène"
                >
                  <Pencil :size="18" />
                  <span class="text-sm font-medium">Modifier</span>
                </button>
              </div>
            </div>

            <!-- Mode création OU mode édition avec modification activée -->
            <div v-else class="flex gap-2">
              <select
                v-model="formData.site_principal.sirene.numero_serie"
                class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                :class="{ 'border-red-500': errors['site_principal.sirene.numero_serie'] }"
              >
                <option value="">Sélectionner une sirène disponible</option>
                <option v-for="sirene in sirenesdisponibles" :key="sirene.numero_serie" :value="sirene.numero_serie">
                  {{ sirene.numero_serie }}
                </option>
              </select>
              <button
                @click="loadSirenesDisponibles"
                type="button"
                class="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                title="Recharger les sirènes"
              >
                <RefreshCw :size="20" />
              </button>
              <button
                v-if="isEditMode && isEditingSirenePrincipal"
                @click="isEditingSirenePrincipal = false"
                type="button"
                class="px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                title="Annuler la modification"
              >
                <X :size="20" />
              </button>
            </div>
            <p v-if="errors['site_principal.sirene.numero_serie']" class="text-sm text-red-600 mt-1">{{ errors['site_principal.sirene.numero_serie'] }}</p>
          </div>
        </div>

        <!-- Step 4: Sites Annexes (optionnel) -->
        <div v-show="currentStep === 3" class="space-y-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Sites annexes (optionnel)</h3>
            <button
              @click="addSiteAnnexe"
              type="button"
              class="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm"
            >
              <Plus :size="16" />
              Ajouter un site
            </button>
          </div>

          <div v-if="formData.sites_annexe.length === 0" class="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Building2 :size="48" class="mx-auto text-gray-300 mb-2" />
            <p class="text-gray-600 text-sm">Aucun site annexe ajouté</p>
            <p class="text-gray-500 text-xs mt-1">Cliquez sur "Ajouter un site" pour créer un site annexe</p>
          </div>

          <div
            v-for="(site, index) in formData.sites_annexe"
            :key="index"
            class="p-4 border border-gray-200 rounded-lg space-y-3 bg-gray-50"
          >
            <div class="flex items-center justify-between mb-2">
              <h4 class="font-semibold text-gray-900">Site annexe {{ index + 1 }}</h4>
              <button
                @click="removeSiteAnnexe(index)"
                type="button"
                class="text-red-600 hover:text-red-700"
              >
                <Trash2 :size="18" />
              </button>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Nom du site <span class="text-red-600">*</span>
              </label>
              <input
                v-model="site.nom"
                type="text"
                placeholder="Ex: Site Annexe Sud"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
              <input
                v-model="site.adresse"
                type="text"
                placeholder="Adresse du site"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ville</label>
              <select
                v-model="site.ville_id"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner une ville</option>
                <option v-for="ville in villes" :key="ville.id" :value="ville.id">
                  {{ ville.nom }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Types d'établissement</label>
              <div class="grid grid-cols-2 gap-2">
                <label
                  v-for="type in typesEtablissement"
                  :key="type.value"
                  class="flex items-center gap-2 p-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer text-sm"
                  :class="{ 'bg-blue-50 border-blue-500': site.types_etablissement?.includes(type.value) }"
                >
                  <input
                    type="checkbox"
                    :value="type.value"
                    v-model="site.types_etablissement"
                    class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span class="font-medium text-gray-900">{{ type.label }}</span>
                </label>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Sirène <span class="text-red-600">*</span>
              </label>

              <!-- Mode édition : afficher les détails de la sirène avec icône crayon -->
              <div v-if="isEditMode && !isEditingSireneAnnexe[index] && site.sirene.numero_serie" class="border border-gray-300 rounded-lg p-3 bg-gradient-to-br from-purple-50 to-pink-50">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Bell :size="16" class="text-white" />
                    </div>
                    <div>
                      <p class="text-xs text-purple-600 font-semibold">Sirène</p>
                      <p class="text-sm font-bold text-purple-900">{{ site.sirene.numero_serie }}</p>
                    </div>
                  </div>
                  <button
                    @click="isEditingSireneAnnexe[index] = true"
                    type="button"
                    class="px-2 py-1 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1"
                    title="Modifier la sirène"
                  >
                    <Pencil :size="16" />
                    <span class="text-xs font-medium">Modifier</span>
                  </button>
                </div>
              </div>

              <!-- Mode création OU mode édition avec modification activée -->
              <div v-else class="flex gap-2">
                <select
                  v-model="site.sirene.numero_serie"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner une sirène</option>
                  <option v-for="sirene in sirenesdisponibles" :key="sirene.numero_serie" :value="sirene.numero_serie">
                    {{ sirene.numero_serie }}
                  </option>
                </select>
                <button
                  @click="loadSirenesDisponibles"
                  type="button"
                  class="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  title="Recharger les sirènes"
                >
                  <RefreshCw :size="18" />
                </button>
                <button
                  v-if="isEditMode && isEditingSireneAnnexe[index]"
                  @click="isEditingSireneAnnexe[index] = false"
                  type="button"
                  class="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  title="Annuler la modification"
                >
                  <X :size="18" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
        <button
          v-if="currentStep > 0"
          @click="previousStep"
          type="button"
          class="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-semibold transition-colors"
        >
          Précédent
        </button>
        <div v-else></div>

        <div class="flex items-center gap-3">
          <button
            @click="close"
            type="button"
            class="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-semibold transition-colors"
          >
            Annuler
          </button>

          <button
            v-if="currentStep < steps.length - 1"
            @click="nextStep"
            type="button"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Suivant
          </button>

          <button
            v-else
            @click="handleSubmit"
            :disabled="loading"
            type="button"
            class="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? (isEditMode ? 'Modification...' : 'Enregistrement...') : (isEditMode ? 'Modifier l\'école' : 'Enregistrer l\'école') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { X, Plus, Building2, Trash2, RefreshCw, Pencil, Bell } from 'lucide-vue-next'
import ecoleService, { type InscriptionEcoleRequest } from '../../services/ecoleService'
import villeService, { type Ville } from '../../services/villeService'
import sireneService, { type Sirene } from '../../services/sireneService'
import paysService, { type Pays } from '../../services/paysService'
import LocationPicker from '../common/LocationPicker.vue'
import { useNotificationStore } from '../../stores/notifications'

interface Props {
  isOpen: boolean
  ecole?: any | null
}

interface Emits {
  (e: 'close'): void
  (e: 'created', ecole: any): void
  (e: 'updated', ecole: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const notificationStore = useNotificationStore()

const isEditMode = computed(() => !!props.ecole)

const steps = ['École', 'Responsable', 'Site principal', 'Sites annexes']
const currentStep = ref(0)
const loading = ref(false)
const villes = ref<Ville[]>([])
const pays = ref<Pays[]>([])
const sirenesdisponibles = ref<Sirene[]>([])
const selectedPaysContact = ref<string>('')
const selectedPaysResponsable = ref<string>('')

// États pour gérer l'édition des sirènes
const isEditingSirenePrincipal = ref(false)
const isEditingSireneAnnexe = ref<Record<number, boolean>>({})

// Location for site principal (two-way binding with formData)
const sitePrincipalLocation = computed({
  get: () => ({
    latitude: formData.value.site_principal.latitude,
    longitude: formData.value.site_principal.longitude
  }),
  set: (value) => {
    formData.value.site_principal.latitude = value.latitude
    formData.value.site_principal.longitude = value.longitude
  }
})

const typesEtablissement = [
  { value: 'MATERNELLE', label: 'Maternelle' },
  { value: 'PRIMAIRE', label: 'Primaire' },
  { value: 'SECONDAIRE', label: 'Secondaire' },
  { value: 'SUPERIEUR', label: 'Supérieur' }
]

const formData = ref<InscriptionEcoleRequest>({
  nom: '',
  nom_complet: '',
  telephone_contact: '',
  email_contact: '',
  est_prive: false,
  responsable_nom: '',
  responsable_prenom: '',
  responsable_telephone: '',
  site_principal: {
    adresse: '',
    ville_id: '',
    latitude: undefined,
    longitude: undefined,
    types_etablissement: [],
    sirene: {
      numero_serie: ''
    }
  },
  sites_annexe: []
})

const errors = ref<Record<string, string>>({})

const loadVilles = async () => {
  try {
    const response = await villeService.getAllVilles()
    if (response.success && response.data) {
      villes.value = response.data
    }
  } catch (error: any) {
    console.error('Failed to load villes:', error)
    notificationStore.error('Erreur', 'Impossible de charger les villes')
  }
}

const loadSirenesDisponibles = async () => {
  try {
    const response = await sireneService.getDisponibles()
    if (response.success && response.data) {
      sirenesdisponibles.value = response.data
    }
  } catch (error: any) {
    console.error('Failed to load sirenes:', error)
    notificationStore.error('Erreur', 'Impossible de charger les sirènes disponibles')
  }
}

const loadPays = async () => {
  try {
    const response = await paysService.getAllPays()
    if (response.success && response.data) {
      pays.value = response.data
    }
  } catch (error: any) {
    console.error('Failed to load pays:', error)
    notificationStore.error('Erreur', 'Impossible de charger les pays')
  }
}

const getPaysById = (id: string): Pays | undefined => {
  return pays.value.find(p => p.id === id)
}

const extractPhoneNumber = (fullPhone: string, indicatif: string): string => {
  // Si le numéro commence par l'indicatif, on le retire
  if (fullPhone && indicatif && fullPhone.startsWith(indicatif)) {
    return fullPhone.substring(indicatif.length)
  }
  return fullPhone
}

const findPaysIdByIndicatif = (phoneNumber: string): string | null => {
  // Essayer de trouver un pays dont l'indicatif correspond au début du numéro
  if (!phoneNumber) return null

  // Trier les pays par longueur d'indicatif décroissante pour matcher les indicatifs les plus longs d'abord
  const sortedPays = [...pays.value].sort((a, b) => {
    const lenA = a.indicatif_tel?.length || 0
    const lenB = b.indicatif_tel?.length || 0
    return lenB - lenA
  })

  for (const p of sortedPays) {
    if (p.indicatif_tel && phoneNumber.startsWith(p.indicatif_tel)) {
      return p.id
    }
  }
  return null
}

const addSiteAnnexe = () => {
  formData.value.sites_annexe?.push({
    nom: '',
    adresse: '',
    ville_id: '',
    latitude: undefined,
    longitude: undefined,
    types_etablissement: [],
    sirene: {
      numero_serie: ''
    }
  })
}

const removeSiteAnnexe = (index: number) => {
  formData.value.sites_annexe?.splice(index, 1)
}

const validateStep = (step: number): boolean => {
  errors.value = {}

  if (step === 0) {
    if (!formData.value.nom.trim()) errors.value.nom = 'Le nom est requis'
    if (!formData.value.nom_complet.trim()) errors.value.nom_complet = 'Le nom complet est requis'
    if (!formData.value.telephone_contact.trim()) errors.value.telephone_contact = 'Le téléphone est requis'
  } else if (step === 1) {
    if (!formData.value.responsable_nom.trim()) errors.value.responsable_nom = 'Le nom du responsable est requis'
    if (!formData.value.responsable_prenom.trim()) errors.value.responsable_prenom = 'Le prénom du responsable est requis'
    if (!formData.value.responsable_telephone.trim()) errors.value.responsable_telephone = 'Le téléphone du responsable est requis'
  } else if (step === 2) {
    if (!formData.value.site_principal.adresse.trim()) errors.value['site_principal.adresse'] = 'L\'adresse est requise'
    if (!formData.value.site_principal.ville_id) errors.value['site_principal.ville_id'] = 'La ville est requise'
    if (formData.value.site_principal.types_etablissement.length === 0) errors.value['site_principal.types_etablissement'] = 'Sélectionnez au moins un type'
    if (!formData.value.site_principal.sirene.numero_serie) errors.value['site_principal.sirene.numero_serie'] = 'La sirène est requise'
  }

  return Object.keys(errors.value).length === 0
}

const nextStep = () => {
  if (validateStep(currentStep.value)) {
    currentStep.value++
  }
}

const previousStep = () => {
  currentStep.value--
  errors.value = {}
}

const prepareDataForSubmission = () => {
  // Clone the form data
  const data = JSON.parse(JSON.stringify(formData.value))

  // Concaténer l'indicatif du pays avec le téléphone de contact
  if (selectedPaysContact.value) {
    const paysContact = getPaysById(selectedPaysContact.value)
    if (paysContact?.indicatif_tel && data.telephone_contact) {
      data.telephone_contact = `${paysContact.indicatif_tel}${data.telephone_contact}`
    }
  }

  // Concaténer l'indicatif du pays avec le téléphone du responsable
  if (selectedPaysResponsable.value) {
    const paysResponsable = getPaysById(selectedPaysResponsable.value)
    if (paysResponsable?.indicatif_tel && data.responsable_telephone) {
      data.responsable_telephone = `${paysResponsable.indicatif_tel}${data.responsable_telephone}`
    }
  }

  return data
}

const handleSubmit = async () => {
  // Validate step 2 (site principal) in all cases
  if (!validateStep(2)) {
    currentStep.value = 2
    return
  }

  loading.value = true

  try {
    let response

    // Préparer les données avec les indicatifs concaténés
    const dataToSubmit = prepareDataForSubmission()

    if (isEditMode.value) {
      // Update mode - send all data like in create mode
      response = await ecoleService.update(props.ecole.id, dataToSubmit)

      if (response.success && response.data) {
        notificationStore.success(
          'École modifiée',
          `L'école "${response.data.nom}" a été modifiée avec succès.`
        )
        emit('updated', response.data)
        close()
      } else {
        notificationStore.error('Erreur', response.message || 'Impossible de modifier l\'école')
      }
    } else {
      // Create mode
      response = await ecoleService.inscrire(dataToSubmit)

      if (response.success && response.data) {
        notificationStore.success(
          'École enregistrée',
          `L'école "${response.data.nom}" a été enregistrée avec succès. Mot de passe temporaire: ${response.data.mot_de_passe_temporaire || 'N/A'}`
        )
        emit('created', response.data)
        close()
      } else {
        notificationStore.error('Erreur', response.message || 'Impossible d\'enregistrer l\'école')
      }
    }
  } catch (error: any) {
    console.error('Failed to save school:', error)
    const message = error.response?.data?.message || (isEditMode.value ? 'Impossible de modifier l\'école' : 'Impossible d\'enregistrer l\'école')
    notificationStore.error('Erreur', message)

    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors
    }
  } finally {
    loading.value = false
  }
}

const close = () => {
  formData.value = {
    nom: '',
    nom_complet: '',
    telephone_contact: '',
    email_contact: '',
    est_prive: false,
    responsable_nom: '',
    responsable_prenom: '',
    responsable_telephone: '',
    site_principal: {
      adresse: '',
      ville_id: '',
      latitude: undefined,
      longitude: undefined,
      types_etablissement: [],
      sirene: {
        numero_serie: ''
      }
    },
    sites_annexe: []
  }
  errors.value = {}
  selectedPaysContact.value = ''
  selectedPaysResponsable.value = ''
  currentStep.value = 0
  loading.value = false

  // Réinitialiser les états d'édition des sirènes
  isEditingSirenePrincipal.value = false
  isEditingSireneAnnexe.value = {}

  emit('close')
}

watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    // Réinitialiser les états d'édition des sirènes
    isEditingSirenePrincipal.value = false
    isEditingSireneAnnexe.value = {}

    // Charger les données nécessaires
    await Promise.all([
      loadPays(),
      loadVilles(),
      loadSirenesDisponibles()
    ])

    // Pre-fill form data when opening in edit mode
    if (isEditMode.value && props.ecole) {
      const ecole = props.ecole

      // Détecter le pays à partir du numéro de téléphone de contact
      const paysContactId = ecole.site_principal?.ville?.pays_id || findPaysIdByIndicatif(ecole.telephone_contact || '')
      selectedPaysContact.value = paysContactId || ''

      // Détecter le pays à partir du numéro de téléphone du responsable
      const paysResponsableId = findPaysIdByIndicatif(ecole.responsable_telephone || '')
      selectedPaysResponsable.value = paysResponsableId || ''

      // Extraire les numéros de téléphone sans indicatif
      let telephoneContact = ecole.telephone_contact || ''
      let telephoneResponsable = ecole.responsable_telephone || ''

      if (paysContactId) {
        const paysContact = getPaysById(paysContactId)
        if (paysContact?.indicatif_tel) {
          telephoneContact = extractPhoneNumber(telephoneContact, paysContact.indicatif_tel)
        }
      }

      if (paysResponsableId) {
        const paysResponsable = getPaysById(paysResponsableId)
        if (paysResponsable?.indicatif_tel) {
          telephoneResponsable = extractPhoneNumber(telephoneResponsable, paysResponsable.indicatif_tel)
        }
      }

      formData.value = {
        nom: ecole.nom || '',
        nom_complet: ecole.nom_complet || '',
        telephone_contact: telephoneContact,
        email_contact: ecole.email_contact || '',
        est_prive: ecole.est_prive || false,
        responsable_nom: ecole.responsable_nom || '',
        responsable_prenom: ecole.responsable_prenom || '',
        responsable_telephone: telephoneResponsable,
        site_principal: {
          adresse: ecole.site_principal?.adresse || '',
          ville_id: ecole.site_principal?.ville_id || '',
          latitude: ecole.site_principal?.latitude,
          longitude: ecole.site_principal?.longitude,
          types_etablissement: ecole.site_principal?.types_etablissement || ecole.types_etablissement || [],
          sirene: {
            numero_serie: ecole.site_principal?.sirene?.numero_serie || ''
          }
        },
        sites_annexe: ecole.sites_annexe?.map((site: any) => ({
          nom: site.nom || '',
          adresse: site.adresse || '',
          ville_id: site.ville_id || '',
          latitude: site.latitude,
          longitude: site.longitude,
          types_etablissement: site.types_etablissement || [],
          sirene: {
            numero_serie: site.sirene?.numero_serie || ''
          }
        })) || []
      }
    }
  }
})

onMounted(() => {
  if (props.isOpen) {
    loadPays()
    loadVilles()
    loadSirenesDisponibles()
  }
})
</script>
