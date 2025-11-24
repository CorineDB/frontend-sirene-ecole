<template>
  <DashboardLayout>
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-6">
        <button @click="goBack" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft :size="24" />
        </button>
        <div class="flex-1">
          <h1 class="text-3xl font-bold text-gray-900">Détail de l'école</h1>
          <p class="text-gray-600 mt-1">Informations complètes de l'établissement</p>
        </div>
        <Can permission="manage_schools">
          <button
            v-if="ecole"
            @click="openEditModal"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <Edit :size="20" />
            Modifier l'école
          </button>
        </Can>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center h-96">
        <div class="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>

      <!-- Content -->
      <div v-else-if="ecole" class="space-y-6">
        <!-- School Info Card -->
        <div class="bg-white rounded-xl p-8 border border-gray-200">
          <div class="flex items-center gap-6 mb-8">
            <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <Building2 :size="40" class="text-white" />
            </div>
            <div class="flex-1">
              <h2 class="text-2xl font-bold text-gray-900">{{ ecole.nom_complet }}</h2>
              <div class="flex items-center gap-2 mt-2">
                <span
                  v-for="type in ecole.types_etablissement"
                  :key="type"
                  class="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold"
                >
                  {{ type }}
                </span>
                <span
                  :class="[
                    'text-sm px-3 py-1 rounded-full font-semibold',
                    ecole.statut === 'actif' ? 'bg-green-100 text-green-700' :
                    ecole.statut === 'inactif' ? 'bg-gray-100 text-gray-700' :
                    'bg-red-100 text-red-700'
                  ]"
                >
                  {{ ecole.statut }}
                </span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Informations générales -->
            <div class="md:col-span-2">
              <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Info :size="20" class="text-blue-600" />
                Informations générales
              </h3>
              <div class="space-y-3">
                <div class="flex items-start gap-3">
                  <Building2 :size="20" class="text-gray-400 mt-0.5" />
                  <div>
                    <p class="text-sm text-gray-500">Nom complet</p>
                    <p class="text-gray-900 font-medium">{{ ecole.nom_complet }}</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <Hash :size="20" class="text-gray-400 mt-0.5" />
                  <div>
                    <p class="text-sm text-gray-500">Code établissement</p>
                    <p class="text-gray-900 font-mono">{{ ecole.code_etablissement }}</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <Phone :size="20" class="text-gray-400 mt-0.5" />
                  <div>
                    <p class="text-sm text-gray-500">Téléphone</p>
                    <p class="text-gray-900">{{ ecole.telephone_contact }}</p>
                  </div>
                </div>
                <div v-if="ecole.email_contact" class="flex items-start gap-3">
                  <Mail :size="20" class="text-gray-400 mt-0.5" />
                  <div>
                    <p class="text-sm text-gray-500">Email</p>
                    <p class="text-gray-900">{{ ecole.email_contact }}</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <Calendar :size="20" class="text-gray-400 mt-0.5" />
                  <div>
                    <p class="text-sm text-gray-500">Date d'inscription</p>
                    <p class="text-gray-900">{{ formatDate(ecole.date_inscription) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Responsable -->
            <div>
              <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User :size="20" class="text-blue-600" />
                Responsable
              </h3>
              <div class="space-y-3">
                <div>
                  <p class="text-sm text-gray-500">Nom complet</p>
                  <p class="text-gray-900 font-medium">{{ ecole.responsable_prenom }} {{ ecole.responsable_nom }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Téléphone</p>
                  <p class="text-gray-900">{{ ecole.responsable_telephone }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Statistiques -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-white rounded-xl p-6 border border-gray-200">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPin :size="20" class="text-blue-600" />
              </div>
              <p class="text-sm text-gray-600">Sites Annexes</p>
            </div>
            <p class="text-3xl font-bold text-gray-900">{{ ecole.sites_annexe?.length || 0 }}</p>
          </div>

          <div class="bg-white rounded-xl p-6 border border-gray-200">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Bell :size="20" class="text-purple-600" />
              </div>
              <p class="text-sm text-gray-600">Sirènes</p>
            </div>
            <p class="text-3xl font-bold text-gray-900">{{ ecole.sites_annexe?.length || 0 }}</p>
          </div>

          <div class="bg-white rounded-xl p-6 border border-gray-200">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle :size="20" class="text-green-600" />
              </div>
              <p class="text-sm text-gray-600">Abonnements actifs</p>
            </div>
            <p class="text-3xl font-bold text-gray-900">{{ activeSubscriptionsCount }}</p>
          </div>

          <div class="bg-white rounded-xl p-6 border border-gray-200" :class="pendingSubscriptionsCount > 0 ? 'border-amber-200' : ''">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock :size="20" class="text-amber-600" />
              </div>
              <p class="text-sm text-gray-600">Abonnements en attente</p>
            </div>
            <p class="text-3xl font-bold text-gray-900">{{ pendingSubscriptionsCount }}</p>
          </div>

          <div class="bg-white rounded-xl p-6 border border-gray-200">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <FileText :size="20" class="text-orange-600" />
              </div>
              <p class="text-sm text-gray-600">Référence</p>
            </div>
            <p class="text-lg font-mono font-bold text-gray-900">{{ ecole.reference }}</p>
          </div>
        </div>

        <!-- Site Principal -->
        <div v-if="ecole.site_principal" class="bg-white rounded-xl border border-gray-200">
          <div class="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <h3 class="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Building2 :size="24" class="text-blue-600" />
                  Site Principal
                </h3>
                <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
                  <Star :size="16" />
                  Principal
                </span>
              </div>
              <Can permission="manage_schools">
                <button
                  @click="openSitePrincipalModal"
                  class="px-3 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center gap-2 text-sm"
                >
                  <Edit :size="16" />
                  Modifier
                </button>
              </Can>
            </div>
          </div>

          <div class="p-6">
            <div
              class="bg-white rounded-xl p-6 border-2 border-blue-300 bg-blue-50/30 hover:shadow-lg transition-all"
            >
              <!-- Header -->
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-start gap-3 flex-1">
                  <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 :size="20" class="text-blue-600" />
                  </div>
                  <div class="flex-1">
                    <h4 class="font-bold text-gray-900 mb-1">{{ ecole.site_principal.nom }}</h4>
                  </div>
                </div>
              </div>

              <!-- Details -->
              <div class="space-y-3 mb-4">
                <div class="flex items-start gap-2 text-sm">
                  <MapPin :size="16" class="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div class="flex-1">
                    <p class="text-gray-600">{{ ecole.site_principal.adresse }}</p>
                    <p v-if="ecole.site_principal.ville" class="text-gray-500 text-xs mt-1">
                      {{ ecole.site_principal.ville.nom }}
                    </p>
                  </div>
                </div>

                <div v-if="ecole.site_principal.latitude && ecole.site_principal.longitude" class="flex items-center gap-2 text-sm text-gray-600">
                  <Navigation :size="16" class="text-gray-400 flex-shrink-0" />
                  <span class="font-mono text-xs">
                    {{ Number(ecole.site_principal.latitude).toFixed(6) }}, {{ Number(ecole.site_principal.longitude).toFixed(6) }}
                  </span>
                </div>
              </div>

              <!-- Sirène installée -->
              <div
                v-if="ecole.site_principal.sirene"
                class="mt-4 pt-4 border-t border-gray-200 space-y-3"
              >
                <!-- Info Sirène -->
                <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                  <div class="flex items-center gap-3 mb-3">
                    <div class="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Bell :size="20" class="text-white" />
                    </div>
                    <div class="flex-1">
                      <p class="text-xs text-purple-600 font-semibold">Sirène installée</p>
                      <p class="text-base font-bold text-purple-900">{{ ecole.site_principal.sirene.numero_serie }}</p>
                    </div>
                    <span
                      :class="[
                        'px-2 py-1 rounded-full font-semibold text-xs flex-shrink-0',
                        ecole.site_principal.sirene.statut === 'en_stock' ? 'bg-gray-100 text-gray-700' :
                        ecole.site_principal.sirene.statut === 'reserve' ? 'bg-yellow-100 text-yellow-700' :
                        ecole.site_principal.sirene.statut === 'installe' ? 'bg-green-100 text-green-700' :
                        ecole.site_principal.sirene.statut === 'en_panne' ? 'bg-red-100 text-red-700' :
                        ecole.site_principal.sirene.statut === 'hors_service' ? 'bg-red-200 text-red-900' :
                        'bg-blue-100 text-blue-700'
                      ]"
                    >
                      {{ formatStatut(ecole.site_principal.sirene.statut) }}
                    </span>
                  </div>

                  <div v-if="ecole.site_principal.sirene.modeleSirene || ecole.site_principal.sirene.modele" class="text-xs text-gray-600">
                    <span class="font-semibold">Modèle:</span> {{ ecole.site_principal.sirene.modeleSirene?.nom || ecole.site_principal.sirene.modele?.nom }}
                  </div>
                </div>

                <!-- Abonnement en attente -->
                <div
                  v-if="ecole.site_principal.sirene.abonnementEnAttente || ecole.site_principal.sirene.abonnement_en_attente"
                  class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border-2 border-amber-300"
                >
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center gap-2">
                      <Clock :size="18" class="text-amber-600" />
                      <div>
                        <p class="text-xs font-semibold text-amber-800">Abonnement en attente</p>
                        <p class="text-xs text-gray-600 mt-0.5">
                          {{ (ecole.site_principal.sirene.abonnementEnAttente || ecole.site_principal.sirene.abonnement_en_attente)?.numero_abonnement }}
                        </p>
                      </div>
                    </div>
                    <span class="px-2 py-1 bg-amber-200 text-amber-900 rounded-full font-semibold text-xs">
                      EN ATTENTE
                    </span>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-600">Montant:</span>
                    <span class="font-bold text-amber-900">
                      {{ formatMontant((ecole.site_principal.sirene.abonnementEnAttente || ecole.site_principal.sirene.abonnement_en_attente)?.montant) }} FCFA
                    </span>
                  </div>
                  <div class="mt-3 flex gap-2">
                    <button
                      @click="goToCheckout(ecole.id, (ecole.site_principal.sirene.abonnementEnAttente || ecole.site_principal.sirene.abonnement_en_attente)!.id)"
                      class="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition-colors text-sm"
                    >
                      <CreditCard :size="16" />
                      Payer maintenant
                    </button>
                    <button
                      @click="partagerQrCode((ecole.site_principal.sirene.abonnementEnAttente || ecole.site_principal.sirene.abonnement_en_attente)!)"
                      class="px-3 py-2 bg-white border-2 border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors text-sm"
                      title="Partager le QR code"
                    >
                      <Share2 :size="16" />
                    </button>
                    <button
                      @click="regenererQrCode((ecole.site_principal.sirene.abonnementEnAttente || ecole.site_principal.sirene.abonnement_en_attente)!.id)"
                      :disabled="regeneratingQrCode[(ecole.site_principal.sirene.abonnementEnAttente || ecole.site_principal.sirene.abonnement_en_attente)!.id]"
                      class="px-3 py-2 bg-white border-2 border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Régénérer le QR code"
                    >
                      <RefreshCw
                        :size="16"
                        :class="{ 'animate-spin': regeneratingQrCode[(ecole.site_principal.sirene.abonnementEnAttente || ecole.site_principal.sirene.abonnement_en_attente)!.id] }"
                      />
                    </button>
                  </div>
                </div>

                <!-- Abonnement actif -->
                <div
                  v-else-if="ecole.site_principal.sirene.abonnementActif || ecole.site_principal.sirene.abonnement_actif"
                  class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-300"
                >
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center gap-2">
                      <CheckCircle :size="18" class="text-green-600" />
                      <div>
                        <p class="text-xs font-semibold text-green-800">Abonnement actif</p>
                        <p class="text-xs text-gray-600 mt-0.5">
                          {{ (ecole.site_principal.sirene.abonnementActif || ecole.site_principal.sirene.abonnement_actif)?.numero_abonnement }}
                        </p>
                      </div>
                    </div>
                    <span class="px-2 py-1 bg-green-200 text-green-900 rounded-full font-semibold text-xs">
                      ACTIF
                    </span>
                  </div>
                  <div class="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p class="text-gray-500">Expire le:</p>
                      <p class="font-semibold text-gray-900">
                        {{ formatDate((ecole.site_principal.sirene.abonnementActif || ecole.site_principal.sirene.abonnement_actif)?.date_fin) }}
                      </p>
                    </div>
                    <div>
                      <p class="text-gray-500">Montant:</p>
                      <p class="font-semibold text-green-900">
                        {{ formatMontant((ecole.site_principal.sirene.abonnementActif || ecole.site_principal.sirene.abonnement_actif)?.montant) }} FCFA
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Pas d'abonnement -->
                <div v-else class="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div class="flex items-center gap-2">
                    <AlertCircle :size="16" class="text-gray-400" />
                    <span class="text-sm text-gray-600">Aucun abonnement</span>
                  </div>
                </div>
              </div>

              <!-- No Sirene -->
              <div v-else class="mt-4 pt-4 border-t border-gray-200">
                <div class="bg-gray-50 rounded-lg p-3 border border-gray-200 flex items-center gap-2">
                  <AlertCircle :size="16" class="text-gray-400" />
                  <span class="text-sm text-gray-600">Aucune sirène installée</span>
                </div>
              </div>

              <!-- Footer -->
              <div class="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <p class="text-xs text-gray-500">
                  <span v-if="ecole.site_principal.created_at">Créé le {{ formatDate(ecole.site_principal.created_at) }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Sites Annexes -->
        <div class="bg-white rounded-xl border border-gray-200">
          <div class="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <h3 class="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <MapPin :size="24" class="text-green-600" />
                  Sites Annexes
                </h3>
                <span v-if="ecole.sites_annexe && ecole.sites_annexe.length > 0" class="text-sm font-semibold text-gray-600">
                  {{ ecole.sites_annexe.length }} site{{ ecole.sites_annexe.length > 1 ? 's' : '' }}
                </span>
              </div>
              <Can permission="manage_schools">
                <button
                  @click="openAddSiteModal"
                  class="px-3 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all flex items-center gap-2 text-sm"
                >
                  <Plus :size="16" />
                  Ajouter un site
                </button>
              </Can>
            </div>
          </div>

          <div v-if="ecole.sites_annexe && ecole.sites_annexe.length > 0" class="p-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div
                v-for="site in ecole.sites_annexe"
                :key="site.id"
                class="bg-white rounded-xl p-6 border-2 border-gray-200 hover:shadow-lg transition-all"
              >
                <!-- Header -->
                <div class="flex items-start justify-between mb-4">
                  <div class="flex items-start gap-3 flex-1">
                    <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 :size="20" class="text-green-600" />
                    </div>
                    <div class="flex-1">
                      <h4 class="font-bold text-gray-900 mb-1">{{ site.nom }}</h4>
                    </div>
                  </div>
                  <Can permission="manage_schools">
                    <button
                      @click="openSiteAnnexeModal(site)"
                      class="px-2 py-1 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1"
                      title="Modifier le site"
                    >
                      <Edit :size="16" />
                    </button>
                  </Can>
                </div>

                <!-- Details -->
                <div class="space-y-3 mb-4">
                  <div class="flex items-start gap-2 text-sm">
                    <MapPin :size="16" class="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div class="flex-1">
                      <p class="text-gray-600">{{ site.adresse }}</p>
                      <p v-if="site.ville" class="text-gray-500 text-xs mt-1">{{ site.ville.nom }}</p>
                    </div>
                  </div>

                  <div v-if="site.latitude && site.longitude" class="flex items-center gap-2 text-sm text-gray-600">
                    <Navigation :size="16" class="text-gray-400 flex-shrink-0" />
                    <span class="font-mono text-xs">
                      {{ Number(site.latitude).toFixed(6) }}, {{ Number(site.longitude).toFixed(6) }}
                    </span>
                  </div>
                </div>

                <!-- Sirène installée -->
                <div
                  v-if="site.sirene"
                  class="mt-4 pt-4 border-t border-gray-200 space-y-3"
                >
                  <!-- Info Sirène -->
                  <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                    <div class="flex items-center gap-3 mb-3">
                      <div class="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Bell :size="20" class="text-white" />
                      </div>
                      <div class="flex-1">
                        <p class="text-xs text-purple-600 font-semibold">Sirène installée</p>
                        <p class="text-base font-bold text-purple-900">{{ site.sirene.numero_serie }}</p>
                      </div>
                      <span
                        :class="[
                          'px-2 py-1 rounded-full font-semibold text-xs flex-shrink-0',
                          site.sirene.statut === 'en_stock' ? 'bg-gray-100 text-gray-700' :
                          site.sirene.statut === 'reserve' ? 'bg-yellow-100 text-yellow-700' :
                          site.sirene.statut === 'installe' ? 'bg-green-100 text-green-700' :
                          site.sirene.statut === 'en_panne' ? 'bg-red-100 text-red-700' :
                          site.sirene.statut === 'hors_service' ? 'bg-red-200 text-red-900' :
                          'bg-blue-100 text-blue-700'
                        ]"
                      >
                        {{ formatStatut(site.sirene.statut) }}
                      </span>
                    </div>

                    <div v-if="site.sirene.modeleSirene || site.sirene.modele" class="text-xs text-gray-600">
                      <span class="font-semibold">Modèle:</span> {{ site.sirene.modeleSirene?.nom || site.sirene.modele?.nom }}
                    </div>
                  </div>

                  <!-- Abonnement en attente -->
                  <div
                    v-if="(!site.sirene.abonnementEnAttente && !site.sirene.abonnementActif) || ((site.sirene.abonnementEnAttente || site.sirene.abonnement_en_attente))"
                    class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border-2 border-amber-300"
                  >
                    <div class="flex items-start justify-between mb-3">
                      <div class="flex items-center gap-2">
                        <Clock :size="18" class="text-amber-600" />
                        <div>
                          <p class="text-xs font-semibold text-amber-800">Abonnement en attente</p>
                          <p class="text-xs text-gray-600 mt-0.5">
                            {{ (site.sirene.abonnementEnAttente || site.sirene.abonnement_en_attente)?.numero_abonnement }}
                          </p>
                        </div>
                      </div>
                      <span class="px-2 py-1 bg-amber-200 text-amber-900 rounded-full font-semibold text-xs">
                        EN ATTENTE
                      </span>
                    </div>
                    <div class="flex items-center justify-between text-sm">
                      <span class="text-gray-600">Montant:</span>
                      <span class="font-bold text-amber-900">
                        {{ formatMontant((site.sirene.abonnementEnAttente || site.sirene.abonnement_en_attente)?.montant) }} FCFA
                      </span>
                    </div>
                    <div class="mt-3 flex gap-2">
                      <button
                        @click="goToCheckout(ecole.id, (site.sirene.abonnementEnAttente || site.sirene.abonnement_en_attente)?.id)"
                        class="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition-colors text-sm"
                      >
                        <CreditCard :size="16" />
                        Payer maintenant
                      </button>
                      <button
                        @click="partagerQrCode((site.sirene.abonnementEnAttente || site.sirene.abonnement_en_attente)!)"
                        class="px-3 py-2 bg-white border-2 border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors text-sm"
                        title="Partager le QR code"
                      >
                        <Share2 :size="16" />
                      </button>
                      <button
                        @click="regenererQrCode((site.sirene.abonnementEnAttente || site.sirene.abonnement_en_attente)?.id)"
                        :disabled="regeneratingQrCode[(site.sirene.abonnementEnAttente || site.sirene.abonnement_en_attente)?.id]"
                        class="px-3 py-2 bg-white border-2 border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Régénérer le QR code"
                      >
                        <RefreshCw
                          :size="16"
                          :class="{ 'animate-spin': regeneratingQrCode[(site.sirene.abonnementEnAttente || site.sirene.abonnement_en_attente)?.id] }"
                        />
                      </button>
                    </div>
                  </div>

                  <!-- Abonnement actif -->
                  <div
                    v-else-if="site.sirene.abonnementActif || site.sirene.abonnement_actif"
                    class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-300"
                  >
                    <div class="flex items-start justify-between mb-3">
                      <div class="flex items-center gap-2">
                        <CheckCircle :size="18" class="text-green-600" />
                        <div>
                          <p class="text-xs font-semibold text-green-800">Abonnement actif</p>
                          <p class="text-xs text-gray-600 mt-0.5">
                            {{ (site.sirene.abonnementActif || site.sirene.abonnement_actif)?.numero_abonnement }}
                          </p>
                        </div>
                      </div>
                      <span class="px-2 py-1 bg-green-200 text-green-900 rounded-full font-semibold text-xs">
                        ACTIF
                      </span>
                    </div>
                    <div class="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p class="text-gray-500">Expire le:</p>
                        <p class="font-semibold text-gray-900">
                          {{ formatDate((site.sirene.abonnementActif || site.sirene.abonnement_actif)?.date_fin) }}
                        </p>
                      </div>
                      <div>
                        <p class="text-gray-500">Montant:</p>
                        <p class="font-semibold text-green-900">
                          {{ formatMontant((site.sirene.abonnementActif || site.sirene.abonnement_actif)?.montant) }} FCFA
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Pas d'abonnement -->
                  <div v-else class="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div class="flex items-center gap-2">
                      <AlertCircle :size="16" class="text-gray-400" />
                      <span class="text-sm text-gray-600">Aucun abonnement</span>
                    </div>
                  </div>
                </div>

                <!-- No Sirene -->
                <div v-else class="mt-4 pt-4 border-t border-gray-200">
                  <div class="bg-gray-50 rounded-lg p-3 border border-gray-200 flex items-center gap-2">
                    <AlertCircle :size="16" class="text-gray-400" />
                    <span class="text-sm text-gray-600">Aucune sirène installée</span>
                  </div>
                </div>

                <!-- Footer -->
                <div class="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <p class="text-xs text-gray-500">
                    <span v-if="site.created_at">Créé le {{ formatDate(site.created_at) }}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="bg-white rounded-xl p-12 text-center border border-gray-200">
        <Building2 :size="64" class="text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">École introuvable</h3>
        <p class="text-gray-600 mb-4">Impossible de charger les informations de cette école</p>
        <button
          @click="goBack"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retour à la liste
        </button>
      </div>

      <!-- École Form Modal -->
      <EcoleFormModal
        :is-open="editModalOpen"
        :ecole="ecole"
        @close="closeEditModal"
        @updated="handleEcoleUpdated"
      />

      <!-- Site Form Modal -->
      <SiteFormModal
        :is-open="siteModalOpen"
        :site="selectedSite"
        :ecole-id="ecole?.id || ''"
        :is-principal="isPrincipalSite"
        @close="closeSiteModal"
        @saved="handleSiteSaved"
      />
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import DashboardLayout from '../components/layout/DashboardLayout.vue'
import Can from '../components/permissions/Can.vue'
import EcoleFormModal from '../components/schools/EcoleFormModal.vue'
import SiteFormModal from '../components/schools/SiteFormModal.vue'
import {
  Building2, MapPin, Phone, Mail, ArrowLeft, Info, User,
  Calendar, Bell, CheckCircle, FileText, Hash, Star, Navigation, AlertCircle,
  Clock, CreditCard, RefreshCw, Share2, Download, Edit, Plus
} from 'lucide-vue-next'
import ecoleService, { type Ecole } from '../services/ecoleService'
import abonnementService from '../services/abonnementService'
import { useNotificationStore } from '../stores/notifications'

const router = useRouter()
const route = useRoute()
const notificationStore = useNotificationStore()

const ecole = ref<Ecole | null>(null)
const loading = ref(true)
const regeneratingQrCode = ref<Record<string, boolean>>({})
const editModalOpen = ref(false)
const siteModalOpen = ref(false)
const selectedSite = ref<any | null>(null)
const isPrincipalSite = ref(false)

const activeSubscriptionsCount = computed(() => {
  let count = 0

  // Count from principal site
  if (ecole.value?.site_principal?.sirene &&
      (ecole.value.site_principal.sirene.abonnementActif || ecole.value.site_principal.sirene.abonnement_actif)) {
    count++
  }

  // Count from annexes
  if (ecole.value?.sites_annexe) {
    count += ecole.value.sites_annexe.filter(site =>
      site.sirene && (site.sirene.abonnementActif || site.sirene.abonnement_actif)
    ).length
  }

  return count
})

const pendingSubscriptionsCount = computed(() => {
  let count = 0

  // Count from principal site
  if (ecole.value?.site_principal?.sirene &&
      (ecole.value.site_principal.sirene.abonnementEnAttente || ecole.value.site_principal.sirene.abonnement_en_attente)) {
    count++
  }

  // Count from annexes
  if (ecole.value?.sites_annexe) {
    count += ecole.value.sites_annexe.filter(site =>
      site.sirene && (site.sirene.abonnementEnAttente || site.sirene.abonnement_en_attente)
    ).length
  }

  return count
})

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatMontant = (montant: number | string | undefined) => {
  if (!montant) return '0'
  const amount = typeof montant === 'string' ? parseFloat(montant) : montant
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const formatStatut = (statut: string | undefined) => {
  if (!statut) return 'N/A'
  // Remplacer les underscores par des espaces et mettre en ucfirst
  return statut
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

const loadEcole = async () => {
  loading.value = true
  try {
    const ecoleId = route.params.id as string
    const response = await ecoleService.getById(ecoleId)

    if (response.success && response.data) {
      ecole.value = response.data
    } else {
      notificationStore.error('Erreur', 'École introuvable')
    }
  } catch (error: any) {
    console.error('Failed to load ecole:', error)
    notificationStore.error('Erreur', 'Impossible de charger les détails de l\'école')
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/schools')
}

const goToCheckout = (ecoleId: string, abonnementId: string) => {
  router.push(`/checkout/${ecoleId}/${abonnementId}`)
}

const regenererQrCode = async (abonnementId: string) => {
  try {
    regeneratingQrCode.value[abonnementId] = true

    const response = await abonnementService.regenererQrCode(abonnementId)

    if (response.success) {
      notificationStore.success('Succès', 'QR code régénéré avec succès')

      // Recharger les données de l'école pour avoir le nouveau QR code
      await loadEcole()
    } else {
      notificationStore.error('Erreur', response.message || 'Impossible de régénérer le QR code')
    }
  } catch (error: any) {
    console.error('Failed to regenerate QR code:', error)
    notificationStore.error('Erreur', error.response?.data?.message || 'Impossible de régénérer le QR code')
  } finally {
    regeneratingQrCode.value[abonnementId] = false
  }
}

const getBackendUrl = () => {
  return import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000'
}

const partagerQrCode = async (abonnement: any) => {
  try {
    if (!abonnement.qr_code_path) {
      notificationStore.error('Erreur', 'Aucun QR code disponible')
      return
    }

    const checkoutUrl = `${window.location.origin}/checkout/${ecole.value?.id}/${abonnement.id}`

    // Télécharger le QR code via l'API (évite les problèmes CORS)
    const blob = await abonnementService.telechargerQrCode(abonnement.id)
    const file = new File([blob], `qr-code-${abonnement.numero_abonnement}.png`, { type: 'image/png' })

    // Essayer d'utiliser l'API Web Share si disponible
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: `QR Code - ${abonnement.numero_abonnement}`,
        text: `QR Code de paiement pour l'abonnement ${abonnement.numero_abonnement}\nMontant: ${formatMontant(abonnement.montant)} FCFA\nLien de paiement: ${checkoutUrl}`,
        files: [file],
      })
      notificationStore.success('Succès', 'QR code partagé avec succès')
    } else {
      // Fallback: télécharger le QR code
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `qr-code-${abonnement.numero_abonnement}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)
      notificationStore.success('Succès', 'QR code téléchargé avec succès')
    }
  } catch (error: any) {
    console.error('Failed to share QR code:', error)
    if (error.name === 'AbortError') {
      // L'utilisateur a annulé le partage
      return
    }
    notificationStore.error('Erreur', 'Impossible de partager le QR code')
  }
}

const openEditModal = () => {
  editModalOpen.value = true
}

const closeEditModal = () => {
  editModalOpen.value = false
}

const handleEcoleUpdated = async () => {
  await loadEcole()
  closeEditModal()
}

const openSitePrincipalModal = () => {
  selectedSite.value = ecole.value?.site_principal
  isPrincipalSite.value = true
  siteModalOpen.value = true
}

const openSiteAnnexeModal = (site: any) => {
  selectedSite.value = site
  isPrincipalSite.value = false
  siteModalOpen.value = true
}

const openAddSiteModal = () => {
  selectedSite.value = null
  isPrincipalSite.value = false
  siteModalOpen.value = true
}

const closeSiteModal = () => {
  siteModalOpen.value = false
  selectedSite.value = null
}

const handleSiteSaved = async () => {
  await loadEcole()
  closeSiteModal()
}

onMounted(() => {
  loadEcole()
})
</script>
