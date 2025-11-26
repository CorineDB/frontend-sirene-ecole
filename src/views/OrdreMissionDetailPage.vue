<template>
  <DashboardLayout>
    <div class="p-6 space-y-6">
      <!-- Header with back button -->
      <div class="flex items-center gap-4">
        <button
          @click="router.back()"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft :size="24" class="text-gray-600" />
        </button>
        <div class="flex-1">
          <div class="flex items-center gap-3">
            <h1 class="text-3xl font-bold text-gray-900">{{ ordreMission?.numero_ordre }}</h1>
            <StatusBadge v-if="ordreMission" type="ordre-mission" :status="ordreMission.statut" />
          </div>
          <p class="text-gray-600 mt-1">Détails de l'ordre de mission</p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center h-96">
        <div class="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>

      <!-- Error State -->
      <div v-if="hasError" class="bg-red-50 border border-red-200 rounded-xl p-4">
        <div class="flex items-center gap-3">
          <AlertCircle :size="24" class="text-red-600" />
          <div>
            <h3 class="font-semibold text-red-900">Erreur</h3>
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <div v-if="!isLoading && !hasError && ordreMission">
        <Tabs :tabs="tabs" initial-tab="Détails">
          <template #Détails>
            <div class="space-y-6">
              <!-- Main Info Card -->
              <div class="bg-white rounded-xl border border-gray-200 p-6">
                <h2 class="text-xl font-bold text-gray-900 mb-4">Informations générales</h2>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p class="text-sm text-gray-600 mb-1">Numéro d'ordre</p>
                    <p class="font-semibold text-gray-900">{{ ordreMission.numero_ordre }}</p>
                  </div>

                  <div>
                    <p class="text-sm text-gray-600 mb-1">Statut</p>
                    <StatusBadge type="ordre-mission" :status="ordreMission.statut" />
                  </div>

                  <div>
                    <p class="text-sm text-gray-600 mb-1">Techniciens requis</p>
                    <p class="font-semibold text-gray-900">{{ ordreMission.nombre_techniciens_requis }}</p>
                  </div>

                  <div v-if="ordreMission.nombre_techniciens_acceptes !== undefined">
                    <p class="text-sm text-gray-600 mb-1">Techniciens acceptés</p>
                    <p class="font-semibold text-gray-900">{{ ordreMission.nombre_techniciens_acceptes }}</p>
                  </div>

                  <div v-if="ordreMission.ville">
                    <p class="text-sm text-gray-600 mb-1">Ville</p>
                    <div class="flex items-center gap-2">
                      <MapPin :size="16" class="text-gray-400" />
                      <p class="font-semibold text-gray-900">{{ ordreMission.ville.nom }}</p>
                    </div>
                  </div>

                  <div v-if="ordreMission.valide_par_user">
                    <p class="text-sm text-gray-600 mb-1">Validé par</p>
                    <div class="flex items-center gap-2">
                      <User :size="16" class="text-gray-400" />
                      <p class="font-semibold text-gray-900">{{ ordreMission.valide_par_user.nom_utilisateur }}</p>
                    </div>
                  </div>

                  <div v-if="ordreMission.date_debut_candidature">
                    <p class="text-sm text-gray-600 mb-1">Début candidatures</p>
                    <div class="flex items-center gap-2">
                      <Calendar :size="16" class="text-gray-400" />
                      <p class="font-semibold text-gray-900">{{ formatDate(ordreMission.date_debut_candidature) }}</p>
                    </div>
                  </div>

                  <div v-if="ordreMission.date_fin_candidature">
                    <p class="text-sm text-gray-600 mb-1">Fin candidatures</p>
                    <div class="flex items-center gap-2">
                      <Calendar :size="16" class="text-gray-400" />
                      <p class="font-semibold text-gray-900">{{ formatDate(ordreMission.date_fin_candidature) }}</p>
                    </div>
                  </div>

                  <div v-if="ordreMission.created_at">
                    <p class="text-sm text-gray-600 mb-1">Créé le</p>
                    <p class="font-semibold text-gray-900">{{ formatDate(ordreMission.created_at) }}</p>
                  </div>
                </div>

                <div v-if="ordreMission.commentaire" class="mt-6">
                  <p class="text-sm text-gray-600 mb-2">Commentaire</p>
                  <p class="text-gray-900">{{ ordreMission.commentaire }}</p>
                </div>
              </div>

              <!-- Panne Info Card -->
              <div v-if="ordreMission.panne" class="bg-white rounded-xl border border-gray-200 p-6">
                <h2 class="text-xl font-bold text-gray-900 mb-4">Panne associée</h2>

                <div class="flex items-start gap-4">
                  <div class="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle :size="24" class="text-orange-600" />
                  </div>

                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <h3 class="font-bold text-gray-900">{{ ordreMission.panne.titre }}</h3>
                      <StatusBadge type="panne" :status="ordreMission.panne.statut" />
                      <StatusBadge type="priorite" :status="ordreMission.panne.priorite" />
                    </div>

                    <p v-if="ordreMission.panne.description" class="text-sm text-gray-700 mb-3">
                      {{ ordreMission.panne.description }}
                    </p>

                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div v-if="ordreMission.panne.ecole">
                        <p class="text-xs text-gray-600">École</p>
                        <p class="text-sm font-semibold text-gray-900">{{ ordreMission.panne.ecole.nom }}</p>
                      </div>

                      <div v-if="ordreMission.panne.site">
                        <p class="text-xs text-gray-600">Site</p>
                        <p class="text-sm font-semibold text-gray-900">{{ ordreMission.panne.site.nom }}</p>
                      </div>

                      <div v-if="ordreMission.panne.sirene">
                        <p class="text-xs text-gray-600">Sirène</p>
                        <p class="text-sm font-semibold text-gray-900">{{ ordreMission.panne.sirene.numero_serie }}</p>
                      </div>
                    </div>

                    <button
                      @click="router.push(`/pannes/${ordreMission.panne.id}`)"
                      class="mt-4 text-sm text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Voir détails de la panne →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions Section for Détails -->
            <div class="bg-white rounded-xl border border-gray-200 p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4">Actions sur la mission</h2>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <!-- Modifier (Admin) -->
                <button
                  v-if="isAdmin"
                  @click="handleModifierMission"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Edit :size="16" />
                  Modifier
                </button>

                <!-- Démarrer (Admin) -->
                <button
                  v-if="isAdmin && ordreMission.statut === StatutOrdreMission.EN_ATTENTE"
                  @click="handleDemarrerMission"
                  class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Play :size="16" />
                  Démarrer la mission
                </button>

                <!-- Terminer la mission (Admin/Technicien) -->
                <button
                  v-if="(isAdmin || isTechnicien) && ordreMission.statut === StatutOrdreMission.EN_COURS && allInterventionsTerminees"
                  @click="handleTerminerMission"
                  class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 :size="16" />
                  Terminer la mission
                </button>

                <!-- Clôturer la mission (Admin) -->
                <button
                  v-if="isAdmin && ordreMission.statut === StatutOrdreMission.TERMINE"
                  @click="handleCloturerMission"
                  class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Lock :size="16" />
                  Clôturer la mission
                </button>

                <!-- Avis sur l'exécution (École) -->
                <button
                  v-if="isEcole && ordreMission.statut === StatutOrdreMission.TERMINE"
                  @click="handleDonnerAvisMission"
                  class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Star :size="16" />
                  Donner un avis
                </button>

                <!-- Stipuler panne résolue (Admin/École) -->
                <button
                  v-if="(isAdmin || isEcole) && ordreMission.panne?.statut !== 'resolue' && ordreMission.statut === StatutOrdreMission.CLOTURE"
                  @click="handleStipulerPanneResolue"
                  class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 :size="16" />
                  Panne résolue
                </button>

                <!-- Supprimer (Admin) -->
                <button
                  v-if="isAdmin"
                  @click="handleSupprimerMission"
                  class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 :size="16" />
                  Supprimer
                </button>
              </div>
            </div>
          </template>

          <template #Intervenants>
            <!-- Intervenants Section -->
            <div v-if="!isCandidaturesEnCours" class="bg-white rounded-xl border border-gray-200 p-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Users :size="24" class="text-blue-600" />
                  Intervenants ({{ intervenants.length }})
                </h2>

                <div class="flex gap-2">
                  <!-- Ajouter un technicien -->
                  <button
                    v-if="isAdmin && isMissionNotCloturee"
                    @click="handleAjouterTechnicien"
                    class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors flex items-center gap-2"
                  >
                    <UserPlus :size="16" />
                    Ajouter un technicien
                  </button>

                  <!-- Rouvrir les candidatures -->
                  <button
                    v-if="isAdmin && ordreMission.statut === StatutOrdreMission.CLOTURE"
                    @click="handleRouvrirCandidatures"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors flex items-center gap-2"
                  >
                    <Unlock :size="16" />
                    Rouvrir candidatures
                  </button>
                </div>
              </div>

              <div v-if="hasIntervenants" class="space-y-3">
                <div
                  v-for="intervenant in intervenants"
                  :key="intervenant.id"
                  class="border border-gray-200 rounded-lg p-4"
                >
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <User :size="24" class="text-blue-600" />
                    </div>

                    <div class="flex-1">
                      <h4 class="font-semibold text-gray-900 mb-1">
                        {{ intervenant.technicien?.nom || 'Technicien' }}
                      </h4>
                      <div class="text-sm text-gray-600 space-y-1">
                        <p v-if="intervenant.technicien?.email">
                          Email: {{ intervenant.technicien.email }}
                        </p>
                        <p v-if="intervenant.technicien?.telephone">
                          Téléphone: {{ intervenant.technicien.telephone }}
                        </p>
                        <p v-if="intervenant.date_acceptation" class="text-green-600">
                          Accepté le {{ formatDate(intervenant.date_acceptation) }}
                        </p>
                      </div>
                    </div>

                    <div class="flex flex-col gap-2">
                      <StatusBadge type="candidature" :status="intervenant.statut_candidature" />

                      <!-- Actions sur intervenant -->
                      <div v-if="isAdmin" class="flex gap-2 mt-2">
                        <button
                          v-if="isMissionActive"
                          @click="handleSuspendreIntervenant(intervenant.id)"
                          class="px-3 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700 font-semibold flex items-center gap-1"
                          title="Suspendre l'intervenant"
                        >
                          <Ban :size="14" />
                          Suspendre
                        </button>
                        <button
                          v-if="isMissionActive"
                          @click="handleRetirerIntervenant(intervenant.id)"
                          class="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 font-semibold flex items-center gap-1"
                          title="Retirer l'intervenant"
                        >
                          <UserMinus :size="14" />
                          Retirer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="text-center py-8 text-gray-500">
                <Users :size="48" class="text-gray-300 mx-auto mb-2" />
                <p>Aucun technicien assigné</p>
              </div>
            </div>
          </template>

          <template #Interventions>
            <!-- Interventions Section -->
            <div class="bg-white rounded-xl border border-gray-200 p-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Wrench :size="24" class="text-orange-600" />
                  Interventions ({{ interventions.length }})
                </h2>

                <!-- Bouton Ajouter une intervention -->
                <button
                  v-if="isAdmin && isMissionNotCloturee"
                  @click="handleAjouterIntervention"
                  class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors flex items-center gap-2"
                >
                  <Plus :size="16" />
                  Ajouter une intervention
                </button>
              </div>

              <div v-if="hasInterventions" class="space-y-3">
                <div
                  v-for="intervention in interventions"
                  :key="intervention.id"
                  class="border border-gray-200 rounded-lg p-4"
                >
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-2">
                        <StatusBadge type="intervention" :status="intervention.statut" />
                        <span v-if="intervention.date_intervention" class="text-sm font-semibold text-gray-900">
                          {{ formatDate(intervention.date_intervention) }}
                        </span>
                      </div>

                      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div v-if="intervention.type_intervention">
                          <p class="text-xs text-gray-600">Type</p>
                          <p class="font-semibold text-gray-900">{{ intervention.type_intervention }}</p>
                        </div>

                        <div v-if="intervention.technicien">
                          <p class="text-xs text-gray-600">Technicien</p>
                          <p class="font-semibold text-gray-900">{{ intervention.technicien.nom }}</p>
                        </div>

                        <div v-if="intervention.date_debut">
                          <p class="text-xs text-gray-600">Début</p>
                          <p class="font-semibold text-gray-900">{{ formatDate(intervention.date_debut) }}</p>
                        </div>

                        <div v-if="intervention.date_fin">
                          <p class="text-xs text-gray-600">Fin</p>
                          <p class="font-semibold text-gray-900">{{ formatDate(intervention.date_fin) }}</p>
                        </div>
                      </div>

                      <p v-if="intervention.instructions" class="text-sm text-gray-700 mt-2">
                        {{ intervention.instructions }}
                      </p>
                    </div>

                    <!-- Action buttons grid pour chaque intervention -->
                    <div class="flex-shrink-0">
                      <div class="grid grid-cols-2 gap-2">
                        <!-- Modifier (Admin) -->
                        <button
                          v-if="isAdmin && isMissionActive"
                          @click="handleModifierIntervention(intervention.id)"
                          class="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 font-semibold flex items-center gap-1 justify-center"
                        >
                          <Edit :size="12" />
                          Modifier
                        </button>

                        <!-- Planifier (Admin/Technicien) -->
                        <button
                          v-if="(isAdmin || isTechnicien) && intervention.statut === 'en_attente'"
                          @click="handlePlanifierIntervention(intervention.id)"
                          class="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 font-semibold flex items-center gap-1 justify-center"
                        >
                          <CalendarClock :size="12" />
                          Planifier
                        </button>

                        <!-- Démarrer (Admin/Technicien) -->
                        <button
                          v-if="(isAdmin || isTechnicienAssigne(intervention)) && (intervention.statut === 'planifiee' || intervention.statut === 'en_attente')"
                          @click="handleDemarrerIntervention(intervention.id)"
                          class="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 font-semibold flex items-center gap-1 justify-center"
                        >
                          <Play :size="12" />
                          Démarrer
                        </button>

                        <!-- Reporter -->
                        <button
                          v-if="isAdmin && (intervention.statut === 'planifiee' || intervention.statut === 'en_cours')"
                          @click="handleReporterIntervention(intervention.id)"
                          class="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 font-semibold flex items-center gap-1 justify-center"
                        >
                          <Clock :size="12" />
                          Reporter
                        </button>

                        <!-- Confirmer programme (École) -->
                        <button
                          v-if="isEcole && intervention.statut === 'planifiee'"
                          @click="handleConfirmerProgramme(intervention.id)"
                          class="px-3 py-1 bg-teal-600 text-white text-xs rounded hover:bg-teal-700 font-semibold flex items-center gap-1 justify-center"
                        >
                          <CheckCircle2 :size="12" />
                          Confirmer
                        </button>

                        <!-- Terminer (Admin/Technicien) -->
                        <button
                          v-if="(isAdmin || isTechnicienAssigne(intervention)) && intervention.statut === 'en_cours'"
                          @click="handleTerminerIntervention(intervention.id)"
                          class="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 font-semibold flex items-center gap-1 justify-center"
                        >
                          <CheckCircle2 :size="12" />
                          Terminer
                        </button>

                        <!-- Rédiger rapport (Technicien) -->
                        <button
                          v-if="isTechnicienAssigne(intervention) && intervention.statut === 'termine'"
                          @click="handleRedigerRapport(intervention.id)"
                          class="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 font-semibold flex items-center gap-1 justify-center"
                        >
                          <FileText :size="12" />
                          Rapport
                        </button>

                        <!-- Avis (École) -->
                        <button
                          v-if="isEcole && intervention.statut === 'termine'"
                          @click="handleDonnerAvisIntervention(intervention.id)"
                          class="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 font-semibold flex items-center gap-1 justify-center"
                        >
                          <Star :size="12" />
                          Avis
                        </button>

                        <!-- Ajouter intervenant (Admin) -->
                        <button
                          v-if="isAdmin && isMissionNotCloturee"
                          @click="handleAjouterIntervenantIntervention(intervention.id)"
                          class="px-3 py-1 bg-cyan-600 text-white text-xs rounded hover:bg-cyan-700 font-semibold flex items-center gap-1 justify-center"
                        >
                          <UserPlus :size="12" />
                          + Interv
                        </button>

                        <!-- Retirer intervenant (Admin) -->
                        <button
                          v-if="isAdmin && isMissionActive"
                          @click="handleRetirerIntervenantIntervention(intervention.id)"
                          class="px-3 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700 font-semibold flex items-center gap-1 justify-center"
                        >
                          <UserMinus :size="12" />
                          - Interv
                        </button>

                        <!-- Supprimer (Admin) -->
                        <button
                          v-if="isAdmin && isMissionActive"
                          @click="handleSupprimerIntervention(intervention.id)"
                          class="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 font-semibold flex items-center gap-1 justify-center"
                        >
                          <Trash2 :size="12" />
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="text-center py-8 text-gray-500">
                <Wrench :size="48" class="text-gray-300 mx-auto mb-2" />
                <p>Aucune intervention planifiée</p>
              </div>
            </div>
          </template>

          <template #Candidatures>
            <!-- Candidatures Section -->
            <div class="bg-white rounded-xl border border-gray-200 p-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-bold text-gray-900">
                  Candidatures ({{ candidatures.length }})
                </h2>

                <div class="flex gap-2">
                  <!-- Bouton Postuler pour techniciens -->
                  <button
                    v-if="canPostuler"
                    @click="handlePostuler"
                    class="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    <User :size="16" />
                    Postuler
                  </button>

                  <!-- Boutons Admin -->
                  <button
                    v-if="canClosed"
                    @click="handleCloturerCandidatures"
                    class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold transition-colors"
                  >
                    <Lock :size="16" class="inline mr-2" />
                    Clôturer candidatures
                  </button>

                  <button
                    v-if="isAdmin && ordreMission.statut === StatutOrdreMission.CLOTURE"
                    @click="handleRouvrirCandidatures"
                    class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
                  >
                    <Unlock :size="16" class="inline mr-2" />
                    Rouvrir candidatures
                  </button>
                </div>
              </div>

              <!-- Candidatures List -->
              <div v-if="hasCandidatures" class="space-y-4">
                <div
                  v-for="candidature in candidatures"
                  :key="candidature.id"
                  class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex items-start gap-3 flex-1">
                      <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <User :size="20" class="text-blue-600" />
                      </div>

                      <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                          <h4 class="font-semibold text-gray-900">
                            {{ candidature.technicien?.user?.user_info?.nom_complet || 'Technicien inconnu' }}
                          </h4>
                          <StatusBadge type="candidature" :status="candidature.statut_candidature" />
                        </div>

                        <div class="text-sm text-gray-600 space-y-1">
                          <p v-if="candidature.date_candidature">
                            Candidature soumise le {{ formatDate(candidature.date_candidature) }}
                          </p>
                          <p v-if="candidature.date_acceptation">
                            Acceptée le {{ formatDate(candidature.date_acceptation) }}
                          </p>
                          <p v-if="candidature.date_refus">
                            Refusée le {{ formatDate(candidature.date_refus) }}
                          </p>
                          <p v-if="candidature.motif_refus" class="text-red-600">
                            Motif: {{ candidature.motif_refus }}
                          </p>
                          <p v-if="candidature.motif_retrait" class="text-orange-600">
                            Retrait: {{ candidature.motif_retrait }}
                          </p>
                        </div>
                      </div>
                    </div>

                    <!-- Actions -->
                    <div v-if="candidature.statut === 'en_attente' && candidature.statut_candidature === 'soumise'" class="flex gap-2 ml-4">
                      <button
                        v-if="isTechnicien"
                        @click="handleAccepterCandidature(candidature.id)"
                        class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-semibold"
                      >
                        <X :size="16" class="inline" />
                        Annuler
                      </button>

                      <button
                        v-if="isAdmin"
                        @click="handleAccepterCandidature(candidature.id)"
                        class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-semibold"
                      >
                        <Check :size="16" class="inline" />
                        Accepter
                      </button>
                      <button
                        v-if="isAdmin"
                        @click="handleRefuserCandidature(candidature.id)"
                        class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-semibold"
                      >
                        <X :size="16" class="inline" />
                        Refuser
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <div v-else class="text-center py-12">
                <Users :size="48" class="text-gray-300 mx-auto mb-3" />
                <p class="text-gray-600">Aucune candidature pour le moment</p>
              </div>
            </div>
          </template>
        </Tabs>
      </div>
    </div>
    <PlanifierInterventionModal
      :show="showPlanifierInterventionModal"
      :intervention-id="interventionToPlanifierId"
      @close="showPlanifierInterventionModal = false"
      @success="handlePlanifierSuccess"
    />

    <ReporterInterventionModal
      :show="showReporterInterventionModal"
      :intervention-id="interventionToReportId"
      @close="showReporterInterventionModal = false"
      @success="handleReporterSuccess"
    />

    <ConfirmerProgrammeModal
      :show="showConfirmerProgrammeModal"
      :intervention-id="interventionToConfirmId"
      @close="showConfirmerProgrammeModal = false"
      @success="handleConfirmationSuccess"
    />

    <AvisInterventionModal
      :show="showAvisInterventionModal"
      :intervention-id="interventionToAvisId"
      @close="showAvisInterventionModal = false"
      @success="handleAvisSuccess"
    />

    <AjouterTechnicienModal
      :show="showAjouterTechnicienModal"
      :mission-id="missionToAjouterTechnicienId"
      @close="showAjouterTechnicienModal = false"
      @success="handleAjouterTechnicienSuccess"
    />

    <Modal
      :show="showRefusModal"
      title="Refuser la candidature"
      @close="showRefusModal = false"
      @confirm="confirmRefusCandidature"
    >
      <textarea
        v-model="motifRefus"
        class="w-full border border-gray-300 rounded-md p-2"
        placeholder="Motif du refus"
      ></textarea>
    </Modal>
    <ConfirmModal
      :show="showConfirmModal"
      :title="confirmTitle"
      :message="confirmMessage"
      @close="showConfirmModal = false"
      @confirm="confirmAction"
    />
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import DashboardLayout from '../components/layout/DashboardLayout.vue'
import StatusBadge from '../components/common/StatusBadge.vue'
import Tabs from '../components/common/Tabs.vue'
import Modal from '../components/common/Modal.vue'
import ConfirmModal from '../components/common/ConfirmModal.vue'
import { useOrdresMission } from '@/composables/useOrdresMission'
import { useInterventions } from '@/composables/useInterventions'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'
import interventionService from '@/services/interventionService'
import { StatutOrdreMission } from '@/types/api'
import {
  ArrowLeft,
  AlertCircle,
  AlertTriangle,
  MapPin,
  User,
  Users,
  Calendar,
  Lock,
  Unlock,
  Check,
  X,
  Wrench,
  ExternalLink,
  Edit,
  Play,
  CheckCircle2,
  Star,
  Trash2,
  UserPlus,
  UserMinus,
  Ban,
  Plus,
  CalendarClock,
  Clock,
  FileText
} from 'lucide-vue-next'
import ReporterInterventionModal from '@/components/interventions/ReporterInterventionModal.vue';
import ConfirmerProgrammeModal from '@/components/interventions/ConfirmerProgrammeModal.vue';
import AvisInterventionModal from '@/components/interventions/AvisInterventionModal.vue';
import AjouterTechnicienModal from '@/components/missions/AjouterTechnicienModal.vue'; // New import
import PlanifierInterventionModal from '@/components/interventions/PlanifierInterventionModal.vue'; // New import

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const tabs = ref([
  { name: 'Détails' },
  { name: 'Intervenants' },
  { name: 'Interventions' },
  { name: 'Candidatures' },
])

const showRefusModal = ref(false)
const motifRefus = ref('')
const selectedCandidatureId = ref<string | null>(null)

const showConfirmModal = ref(false)
const confirmTitle = ref('')
const confirmMessage = ref('')
const confirmAction = ref<() => void>(() => {})

const showReporterInterventionModal = ref(false);
const interventionToReportId = ref<string | null>(null);

const showConfirmerProgrammeModal = ref(false);
const interventionToConfirmId = ref<string | null>(null);

const showAvisInterventionModal = ref(false);
const interventionToAvisId = ref<string | null>(null);

const showAjouterTechnicienModal = ref(false); // New state
const missionToAjouterTechnicienId = ref<string | null>(null); // New state

const showPlanifierInterventionModal = ref(false); // New state
const interventionToPlanifierId = ref<string | null>(null); // New state



// Composables
const {
  ordreMission,
  candidatures,
  isLoading,
  hasError,
  error,
  hasCandidatures,
  fetchById,
  fetchCandidatures,
  cloturerCandidatures,
  rouvrirCandidatures,
  demarrerMission,
  terminer: terminerMission,
  cloturer: cloturerMission,
  donnerAvis: donnerAvisMission,
  ajouterTechnicien,
  deleteOrdreMission
} = useOrdresMission()

const {
  accepterCandidature,
  refuserCandidature,
  modifier: modifierIntervention,
  reporter: reporterIntervention,
  confirmer: confirmerIntervention,
  supprimer: supprimerIntervention,
  ajouterAvis: ajouterAvisIntervention
} = useInterventions()

// Computed
const interventions = computed(() => {
  return ordreMission.value?.interventions || []
})

const allInterventionsTerminees = computed(() => {
  return interventions.value.length > 0 && interventions.value.every(i => i.statut === 'termine')
})

const isMissionNotCloturee = computed(() => {
  return ordreMission.value?.statut !== StatutOrdreMission.CLOTURE
})

const isMissionActive = computed(() => {
  return ordreMission.value?.statut !== StatutOrdreMission.TERMINE && ordreMission.value?.statut !== StatutOrdreMission.CLOTURE
})

const intervenants = computed(() => {
  // Get accepted candidatures (missions_techniciens with statut_candidature === 'acceptee')
  if (!ordreMission.value?.missions_techniciens) return []

  return ordreMission.value.missions_techniciens.filter(
    (mt: any) => mt.statut_candidature === 'acceptee'
  )
})

// ADDED: Computed for technicians assigned to the mission
const missionAssignedTechnicians = computed(() => {
  return intervenants.value.map(mt => mt.technicien!).filter(Boolean) as ApiTechnicien[];
});

// ADDED: Helper to extract assigned technicians from an intervention object
const getCurrentInterventionAssignedTechnicians = (intervention: ApiIntervention) => {
  let techs: ApiTechnicien[] = [];
  if (intervention.technicien) {
    techs.push(intervention.technicien);
  }
  if (intervention.techniciens && Array.isArray(intervention.techniciens)) {
    techs = techs.concat(intervention.techniciens);
  }
  return techs;
}

const hasInterventions = computed(() => interventions.value.length > 0)
const hasIntervenants = computed(() => intervenants.value.length > 0)

// Check if current user (technicien) is assigned to a specific intervention
const isTechnicienAssigne = (intervention: any) => {
  if (!isTechnicien.value || !authStore.user) return false

  const technicienId = authStore.user.user_account_type_id

  // Check if technicien is directly assigned to this intervention
  if (intervention.technicien_id === technicienId) return true

  // Check in techniciens array if present
  if (intervention.techniciens && Array.isArray(intervention.techniciens)) {
    return intervention.techniciens.some((t: any) => t.id === technicienId)
  }

  return false
}

// Check if candidatures period is currently active
const isCandidaturesEnCours = computed(() => {
  if (!ordreMission.value) {
    return false
  }

  const now = new Date()
  const dateDebut = ordreMission.value.date_debut_candidature
    ? new Date(ordreMission.value.date_debut_candidature)
    : null
  const dateFin = ordreMission.value.date_fin_candidature
    ? new Date(ordreMission.value.date_fin_candidature)
    : null

  if ((!dateDebut || !dateFin) && ordreMission.value.date_cloture_candidature != null) {
    return false
  }

  else if ((!dateDebut || !dateFin) && ordreMission.value.date_cloture_candidature == null) {
    return true
  }

  return now >= dateDebut && now <= dateFin
})

// Check if user is a technicien
const isTechnicien = computed(() => {
  const result = authStore.user?.type === 'TECHNICIEN' && authStore.user?.user_account_type_type === "App\\Models\\Technicien"
  return result
})

// Check if user is a admin
const isAdmin = computed(() => {
  return authStore.user?.type === 'ADMIN' && authStore.user?.user_account_type_type === null
})

// Check if user is an ecole
const isEcole = computed(() => {
  return authStore.user?.type === 'ECOLE' && authStore.user?.user_account_type_type === "App\\Models\\Ecole"
})

const hasSubmittedOffer = computed(() => {
  //const candidatures = candidatures
  const userAccountId = authStore.user?.user_account_type_id

  if (!candidatures || !userAccountId) return false

  return candidatures.value.some(c => c.technicien_id === userAccountId)
})

const canRetirer = computed(() => {
  return isTechnicien.value &&
    hasSubmittedOffer.value &&          // Il a postulé
    isCandidaturesEnCours.value         // Période encore ouverte
})

const handleRetirerCandidature = async () => {
  const userId = authStore.user?.user_account_type_id
  if (!userId) return

  const candidature = candidatures.value.find(c => c.technicien_id === userId)
  if (!candidature) return

  const motif = prompt("Motif du retrait :")
  if (!motif) return

  try {
    await interventionService.retirerCandidature(candidature.id, {
      motif_retrait: motif
    })

    notificationStore.success("Votre candidature a été retirée.")
    await fetchCandidatures(route.params.id)
    await fetchById(route.params.id)

  } catch (e) {
    console.error("Erreur retrait candidature:", e)
    notificationStore.error("Erreur lors du retrait de la candidature.")
  }
}

// Check if technicien can apply (is technicien and candidatures are open)
const canPostuler = computed(() => {
  const result = isTechnicien.value &&
    isCandidaturesEnCours.value &&
    !hasSubmittedOffer.value
  return result
})

// Check if admin can close candidatures
const canClosed = computed(() => {
  return isAdmin.value &&
    isCandidaturesEnCours.value &&
    !ordreMission.value?.candidature_cloturee &&
    !(ordreMission.value?.statut === StatutOrdreMission.EN_ATTENTE || ordreMission.value?.statut === StatutOrdreMission.EN_COURS)
})

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const showConfirmation = (title: string, message: string, action: () => void) => {
  confirmTitle.value = title
  confirmMessage.value = message
  confirmAction.value = action
  showConfirmModal.value = true
}

const handleCloturerCandidatures = () => {
  showConfirmation(
    'Clôturer les candidatures',
    'Êtes-vous sûr de vouloir clôturer les candidatures pour cet ordre de mission ?',
    async () => {
      await cloturerCandidatures(route.params.id as string)
      await fetchById(route.params.id as string)
      showConfirmModal.value = false
    }
  )
}

const handleRouvrirCandidatures = () => {
  showConfirmation(
    'Rouvrir les candidatures',
    'Êtes-vous sûr de vouloir rouvrir les candidatures pour cet ordre de mission ?',
    async () => {
      await rouvrirCandidatures(route.params.id as string)
      await fetchById(route.params.id as string)
      showConfirmModal.value = false
    }
  )
}

const handleAccepterCandidature = async (missionTechnicienId: string) => {

    try {
      await accepterCandidature(missionTechnicienId, { })
      await fetchCandidatures(route.params.id as string)
      await fetchById(route.params.id as string)
    } catch (err) {
      console.error('Error accepting candidature:', err)
    }
}

const handleRefuserCandidature = (missionTechnicienId: string) => {
  selectedCandidatureId.value = missionTechnicienId
  showRefusModal.value = true
}

const confirmRefusCandidature = async () => {
  if (selectedCandidatureId.value && motifRefus.value) {
    try {
      await refuserCandidature(selectedCandidatureId.value, {
        motif_refus: motifRefus.value
      })
      await fetchCandidatures(route.params.id as string)
      await fetchById(route.params.id as string)
    } catch (err) {
      console.error('Error refusing candidature:', err)
    } finally {
      showRefusModal.value = false
      motifRefus.value = ''
      selectedCandidatureId.value = null
    }
  }
}

const handlePostuler = () => {
  if (!ordreMission.value || !authStore.user) return

  showConfirmation(
    'Soumettre la candidature',
    'Voulez-vous soumettre votre candidature pour cet ordre de mission ?',
    async () => {
      try {
        await interventionService.soumettreCandidature(ordreMission.value.id, {
          technicien_id: authStore.user.user_account_type_id
        })

        notificationStore.success('Candidature soumise avec succès!')
        // Refresh data
        await fetchCandidatures(route.params.id as string)
        await fetchById(route.params.id as string)
      } catch (error: any) {
        console.error('Erreur lors de la soumission de la candidature:', error)
        const errorMessage = error?.response?.data?.message || 'Erreur lors de la soumission de la candidature'
        notificationStore.error(errorMessage)
      } finally {
        showConfirmModal.value = false
      }
    }
  )
}

const handleDemarrerIntervention = (interventionId: string) => {
  if (!authStore.user) return

  showConfirmation(
    'Démarrer l\'intervention',
    'Voulez-vous démarrer cette intervention ?',
    async () => {
      try {
        await interventionService.demarrer(interventionId, {
          technicien_id: authStore.user.user_account_type_id
        })

        notificationStore.success('Intervention démarrée avec succès!')
        await fetchById(route.params.id as string)
      } catch (error: any) {
        console.error('Erreur lors du démarrage de l\'intervention:', error)
        const errorMessage = error?.response?.data?.message || 'Erreur lors du démarrage de l\'intervention'
        notificationStore.error(errorMessage)
      } finally {
        showConfirmModal.value = false
      }
    }
  )
}

const handleTerminerIntervention = (interventionId: string) => {
  if (!authStore.user) return

  showConfirmation(
    'Terminer l\'intervention',
    'Voulez-vous terminer cette intervention ?',
    async () => {
      try {
        await interventionService.terminer(interventionId, {
          technicien_id: authStore.user.user_account_type_id
        })

        notificationStore.success('Intervention terminée avec succès!')
        await fetchById(route.params.id as string)
      } catch (error: any) {
        console.error('Erreur lors de la fin de l\'intervention:', error)
        const errorMessage = error?.response?.data?.message || 'Erreur lors de la fin de l\'intervention'
        notificationStore.error(errorMessage)
      } finally {
        showConfirmModal.value = false
      }
    }
  )
}

const handleRedigerRapport = (interventionId: string) => {
  router.push(`/interventions/${interventionId}/rapport`)
}

// ==================== Nouvelles fonctions handlers ====================

// Vue d'ensemble - Actions Mission
const handleModifierMission = () => {
  if (ordreMission.value) {
    router.push(`/ordres-mission/${ordreMission.value.id}/modifier`)
  }
}

const handleDemarrerMission = () => {
  if (!ordreMission.value) return

  showConfirmation(
    'Démarrer la mission',
    'Voulez-vous démarrer cette mission ?',
    async () => {
      try {
        await demarrerMission(ordreMission.value!.id)
        notificationStore.success('Mission démarrée avec succès!')
        await fetchById(route.params.id as string)
      } catch (error: any) {
        console.error('Erreur lors du démarrage de la mission:', error)
        notificationStore.error(error.message || 'Erreur lors du démarrage de la mission')
      } finally {
        showConfirmModal.value = false
      }
    }
  )
}

const handleTerminerMission = () => {
  if (!ordreMission.value) return

  showConfirmation(
    'Terminer la mission',
    'Voulez-vous terminer cette mission ?',
    async () => {
      try {
        await terminerMission(ordreMission.value!.id)
        notificationStore.success('Mission terminée avec succès!')
        await fetchById(route.params.id as string)
      } catch (error: any) {
        console.error('Erreur lors de la terminaison de la mission:', error)
        notificationStore.error(error.message || 'Erreur lors de la terminaison de la mission')
      } finally {
        showConfirmModal.value = false
      }
    }
  )
}

const handleCloturerMission = () => {
  if (!ordreMission.value) return

  showConfirmation(
    'Clôturer la mission',
    'Voulez-vous clôturer cette mission ?',
    async () => {
      try {
        await cloturerMission(ordreMission.value!.id)
        notificationStore.success('Mission clôturée avec succès!')
        await fetchById(route.params.id as string)
      } catch (error: any) {
        console.error('Erreur lors de la clôture de la mission:', error)
        notificationStore.error(error.message || 'Erreur lors de la clôture de la mission')
      } finally {
        showConfirmModal.value = false
      }
    }
  )
}

const handleDonnerAvisMission = () => {
  if (!ordreMission.value) return

  const avis = prompt('Votre avis sur la mission :')
  const noteStr = prompt('Note (1-5) :')

  if (!avis) return

  const note = noteStr ? parseInt(noteStr) : undefined

  showConfirmation(
    'Donner un avis',
    'Confirmer l\'envoi de votre avis ?',
    async () => {
      try {
        await donnerAvisMission(ordreMission.value!.id, { avis, note })
        notificationStore.success('Avis ajouté avec succès!')
        await fetchById(route.params.id as string)
      } catch (error: any) {
        console.error('Erreur lors de l\'ajout de l\'avis:', error)
        notificationStore.error(error.message || 'Erreur lors de l\'ajout de l\'avis')
      } finally {
        showConfirmModal.value = false
      }
    }
  )
}

const handleStipulerPanneResolue = () => {
  showConfirmation(
    'Marquer la panne comme résolue',
    'Voulez-vous marquer cette panne comme résolue ?',
    async () => {
      // TODO: Appeler l'API pour marquer la panne comme résolue
      notificationStore.info('Fonctionnalité "Stipuler panne résolue" à implémenter')
      showConfirmModal.value = false
    }
  )
}

const handleSupprimerMission = () => {
  if (!ordreMission.value) return

  showConfirmation(
    'Supprimer la mission',
    'ATTENTION: Voulez-vous vraiment supprimer cette mission ? Cette action est irréversible.',
    async () => {
      try {
        await deleteOrdreMission(ordreMission.value!.id)
        notificationStore.success('Mission supprimée avec succès!')
        router.push('/ordres-mission')
      } catch (error: any) {
        console.error('Erreur lors de la suppression de la mission:', error)
        notificationStore.error(error.message || 'Erreur lors de la suppression de la mission')
        showConfirmModal.value = false
      }
    }
  )
}

// Intervenants - Actions
const handleAjouterTechnicien = () => {
  if (ordreMission.value) {
    missionToAjouterTechnicienId.value = ordreMission.value.id;
    showAjouterTechnicienModal.value = true;
  }
}

const handleAjouterTechnicienSuccess = () => {
  fetchById(route.params.id as string); // Refresh mission data
}

const handleSuspendreIntervenant = (intervenantId: string) => {
  // TODO: Ouvrir un modal pour saisir le motif, puis appeler l'API
  notificationStore.info(`Fonctionnalité "Suspendre l'intervenant ${intervenantId}" à implémenter`)
}

const handleRetirerIntervenant = (intervenantId: string) => {
  showConfirmation(
    'Retirer l\'intervenant',
    'Voulez-vous retirer cet intervenant de la mission ?',
    async () => {
      // TODO: Appeler l'API pour retirer l'intervenant
      notificationStore.info(`Fonctionnalité "Retirer l'intervenant ${intervenantId}" à implémenter`)
      showConfirmModal.value = false
    }
  )
}

// Interventions - Actions
const handleAjouterIntervention = () => {
  if (ordreMission.value) {
    router.push(`/ordres-mission/${ordreMission.value.id}/interventions/nouvelle`);
  }
}

const handleModifierIntervention = (interventionId: string) => {
  router.push(`/interventions/${interventionId}/modifier`);
}

const handlePlanifierIntervention = (interventionId: string) => {
  interventionToPlanifierId.value = interventionId;
  showPlanifierInterventionModal.value = true;
}

const handlePlanifierSuccess = () => {
  fetchById(route.params.id as string); // Refresh mission data
}

const handleReporterIntervention = (interventionId: string) => {
  interventionToReportId.value = interventionId;
  showReporterInterventionModal.value = true;
}

const handleReporterSuccess = () => {
  fetchById(route.params.id as string); // Refresh mission data
}

const handleConfirmerProgramme = (interventionId: string) => {
  interventionToConfirmId.value = interventionId;
  showConfirmerProgrammeModal.value = true;
}

const handleConfirmationSuccess = () => {
  fetchById(route.params.id as string); // Refresh mission data
}

const handleDonnerAvisIntervention = (interventionId: string) => {
  interventionToAvisId.value = interventionId;
  showAvisInterventionModal.value = true;
}

const handleAvisSuccess = () => {
  fetchById(route.params.id as string); // Refresh mission data
}

const handleAjouterIntervenantIntervention = (interventionId: string) => {
  interventionToAjouterIntervenantId.value = interventionId;
  showAjouterIntervenantModal.value = true;
}

const handleAjouterIntervenantSuccess = () => {
  fetchById(route.params.id as string); // Refresh mission data
}

const handleRetirerIntervenantIntervention = (interventionId: string) => {
  // TODO: Ouvrir un modal pour sélectionner quel intervenant retirer
  notificationStore.info(`Fonctionnalité "Retirer un intervenant de l'intervention ${interventionId}" à implémenter`)
}

const handleSupprimerIntervention = (interventionId: string) => {
  showConfirmation(
    'Supprimer l\'intervention',
    'ATTENTION: Voulez-vous vraiment supprimer cette intervention ?',
    async () => {
      try {
        await supprimerIntervention(interventionId)
        notificationStore.success('Intervention supprimée avec succès!')
        await fetchById(route.params.id as string)
      } catch (error: any) {
        console.error('Erreur lors de la suppression de l\'intervention:', error)
        notificationStore.error(error.message || 'Erreur lors de la suppression de l\'intervention')
      } finally {
        showConfirmModal.value = false
      }
    }
  )
}

// Lifecycle
onMounted(async () => {
  const id = route.params.id as string
  await fetchById(id)
  await fetchCandidatures(id)
})
</script>
