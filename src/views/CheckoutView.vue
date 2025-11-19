<template>
  <DashboardLayout>
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-gray-900 mb-2">Paiement de l'abonnement</h1>
          <p class="text-gray-600">Complétez votre paiement pour activer votre abonnement</p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center h-96">
          <div class="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center">
          <AlertCircle :size="64" class="text-red-400 mx-auto mb-4" />
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Erreur</h3>
          <p class="text-gray-600 mb-4">{{ error }}</p>
          <button
            @click="router.push('/schools')"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour aux écoles
          </button>
        </div>

        <!-- Checkout Content -->
        <div v-else-if="abonnement && ecole" class="space-y-6">
          <!-- School Info Card -->
          <div class="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <Building2 :size="32" class="text-white" />
              </div>
              <div>
                <h2 class="text-2xl font-bold text-gray-900">{{ ecole.nom_complet }}</h2>
                <p class="text-gray-600">{{ ecole.code_etablissement }}</p>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div class="flex items-center gap-2">
                <Phone :size="18" class="text-gray-400" />
                <span class="text-sm text-gray-600">{{ ecole.telephone_contact }}</span>
              </div>
              <div v-if="ecole.email_contact" class="flex items-center gap-2">
                <Mail :size="18" class="text-gray-400" />
                <span class="text-sm text-gray-600">{{ ecole.email_contact }}</span>
              </div>
              <div class="flex items-center gap-2">
                <MapPin :size="18" class="text-gray-400" />
                <span class="text-sm text-gray-600">{{ site?.ville?.nom || 'N/A' }}</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Order Summary -->
            <div class="lg:col-span-2 space-y-6">
              <!-- Subscription Details -->
              <div class="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div class="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                  <h3 class="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <FileText :size="24" class="text-purple-600" />
                    Détails de l'abonnement
                  </h3>
                </div>
                <div class="p-6 space-y-4">
                  <div class="flex items-start justify-between">
                    <div>
                      <p class="text-sm text-gray-500">Numéro d'abonnement</p>
                      <p class="text-lg font-mono font-bold text-gray-900">{{ abonnement.numero_abonnement }}</p>
                    </div>
                    <span class="px-3 py-1 bg-amber-100 text-amber-800 rounded-full font-semibold text-sm">
                      {{ abonnement.statut.replace('_', ' ').toUpperCase() }}
                    </span>
                  </div>

                  <div class="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <p class="text-sm text-gray-500 mb-1">Date de début</p>
                      <div class="flex items-center gap-2">
                        <Calendar :size="18" class="text-gray-400" />
                        <span class="font-medium text-gray-900">{{ formatDate(abonnement.date_debut) }}</span>
                      </div>
                    </div>
                    <div>
                      <p class="text-sm text-gray-500 mb-1">Date de fin</p>
                      <div class="flex items-center gap-2">
                        <Calendar :size="18" class="text-gray-400" />
                        <span class="font-medium text-gray-900">{{ formatDate(abonnement.date_fin) }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="pt-4 border-t border-gray-200">
                    <p class="text-sm text-gray-500 mb-1">Durée</p>
                    <p class="font-medium text-gray-900">{{ calculateDuration() }}</p>
                  </div>
                </div>
              </div>

              <!-- Site Details -->
              <div v-if="site" class="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div class="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <h3 class="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <MapPin :size="24" class="text-blue-600" />
                    Détails du site
                  </h3>
                </div>
                <div class="p-6 space-y-4">
                  <div>
                    <p class="text-sm text-gray-500 mb-1">Nom du site</p>
                    <p class="font-medium text-gray-900">{{ site.nom }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500 mb-1">Adresse</p>
                    <p class="font-medium text-gray-900">{{ site.adresse }}</p>
                  </div>
                  <div v-if="site.ville">
                    <p class="text-sm text-gray-500 mb-1">Ville</p>
                    <p class="font-medium text-gray-900">{{ site.ville.nom }}</p>
                  </div>

                  <!-- Sirène Details -->
                  <div v-if="site.sirene" class="pt-4 border-t border-gray-200">
                    <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                      <div class="flex items-center gap-3 mb-3">
                        <div class="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                          <Bell :size="20" class="text-white" />
                        </div>
                        <div class="flex-1">
                          <p class="text-xs text-purple-600 font-semibold">Sirène</p>
                          <p class="text-base font-bold text-purple-900">{{ site.sirene.numero_serie }}</p>
                        </div>
                        <span
                          :class="[
                            'px-2 py-1 rounded-full font-semibold text-xs',
                            site.sirene.statut === 'en_stock' ? 'bg-gray-100 text-gray-700' :
                            site.sirene.statut === 'reserve' ? 'bg-yellow-100 text-yellow-700' :
                            site.sirene.statut === 'installe' ? 'bg-green-100 text-green-700' :
                            site.sirene.statut === 'en_panne' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          ]"
                        >
                          {{ site.sirene.statut?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'N/A' }}
                        </span>
                      </div>
                      <div v-if="site.sirene.modeleSirene || site.sirene.modele" class="text-xs text-gray-600">
                        <span class="font-semibold">Modèle:</span> {{ site.sirene.modeleSirene?.nom || site.sirene.modele?.nom }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Payment Methods -->
              <div class="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div class="p-6 border-b border-gray-200">
                  <h3 class="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <CreditCard :size="24" class="text-blue-600" />
                    Méthode de paiement
                  </h3>
                </div>
                <div class="p-6">
                  <div class="flex items-center gap-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Smartphone :size="24" class="text-white" />
                    </div>
                    <div class="flex-1">
                      <p class="font-semibold text-gray-900">CinetPay</p>
                      <p class="text-sm text-gray-600">Paiement mobile sécurisé</p>
                    </div>
                    <CheckCircle :size="24" class="text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Payment Summary -->
            <div class="lg:col-span-1">
              <div class="bg-white rounded-xl border border-gray-200 shadow-sm sticky top-6">
                <div class="p-6 border-b border-gray-200 bg-gradient-to-br from-green-50 to-emerald-50">
                  <h3 class="text-xl font-bold text-gray-900">Récapitulatif</h3>
                </div>
                <div class="p-6 space-y-4">
                  <div class="flex items-center justify-between">
                    <span class="text-gray-600">Montant de l'abonnement</span>
                    <span class="font-semibold text-gray-900">{{ formatMontant(abonnement.montant) }} FCFA</span>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-600">Frais de traitement</span>
                    <span class="font-medium text-gray-900">0 FCFA</span>
                  </div>
                  <div class="pt-4 border-t-2 border-gray-200">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-lg font-bold text-gray-900">Total à payer</span>
                      <span class="text-2xl font-bold text-green-600">{{ formatMontant(abonnement.montant) }} FCFA</span>
                    </div>
                  </div>

                  <!-- Payment Buttons -->
                  <div class="space-y-3 mt-6">
                    <!-- Real Payment Button -->
                    <button
                      @click="proceedToPayment"
                      class="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
                    >
                      <Lock :size="20" />
                      Payer maintenant
                    </button>

                    <!-- Simulate Payment Button (DEV ONLY) -->
                    <button
                      @click="simulateSuccessfulPayment"
                      class="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg border-2 border-green-300"
                    >
                      🎭
                      <span>Simuler paiement réussi (DEV)</span>
                    </button>
                  </div>

                  <!-- QR Code -->
                  <div v-if="abonnement.qr_code_path" class="mt-6 pt-6 border-t border-gray-200">
                    <p class="text-sm text-gray-600 text-center mb-3">Ou scannez le QR code</p>
                    <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <img
                        :src="`${getBackendUrl()}/storage/${abonnement.qr_code_path}`"
                        alt="QR Code"
                        class="w-full h-auto object-contain"
                      />
                    </div>
                  </div>

                  <!-- Security Info -->
                  <div class="mt-6 pt-6 border-t border-gray-200">
                    <div class="flex items-start gap-2 text-sm text-gray-600">
                      <Shield :size="18" class="text-green-600 mt-0.5 flex-shrink-0" />
                      <p>Paiement 100% sécurisé avec CinetPay. Vos données bancaires sont protégées.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Additional Info -->
          <div class="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div class="flex items-start gap-3">
              <Info :size="24" class="text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 class="font-semibold text-gray-900 mb-2">Informations importantes</h4>
                <ul class="space-y-1 text-sm text-gray-700">
                  <li>• Votre abonnement sera activé automatiquement après le paiement</li>
                  <li>• Vous recevrez une confirmation par email et SMS</li>
                  <li>• Le paiement peut prendre quelques minutes pour être traité</li>
                  <li>• En cas de problème, contactez notre support</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import DashboardLayout from '../components/layout/DashboardLayout.vue'
import {
  Building2, Phone, Mail, MapPin, FileText, Calendar, CreditCard,
  Smartphone, CheckCircle, Lock, Shield, Info, AlertCircle, Bell
} from 'lucide-vue-next'
import ecoleService, { type Ecole, type Abonnement } from '../services/ecoleService'
import { useNotificationStore } from '../stores/notifications'

const router = useRouter()
const route = useRoute()
const notificationStore = useNotificationStore()

const ecole = ref<Ecole | null>(null)
const abonnement = ref<Abonnement | null>(null)
const site = ref<any | null>(null) // Site correspondant à l'abonnement
const loading = ref(true)
const error = ref<string | null>(null)
const paymentUrl = ref<string | null>(null)

const formatDate = (dateString: string) => {
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

const calculateDuration = () => {
  if (!abonnement.value) return 'N/A'
  const start = new Date(abonnement.value.date_debut)
  const end = new Date(abonnement.value.date_fin)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  const years = Math.floor(diffDays / 365)
  const months = Math.floor((diffDays % 365) / 30)

  if (years > 0) {
    return `${years} an${years > 1 ? 's' : ''}`
  } else if (months > 0) {
    return `${months} mois`
  } else {
    return `${diffDays} jours`
  }
}

const getPaymentUrl = (notes: string | undefined): string | null => {
  if (!notes) return null
  const match = notes.match(/Payment URL:\s*(https?:\/\/[^\s]+)/)
  return match ? (match[1] || null) : null
}

const getBackendUrl = () => {
  return import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000'
}

const loadData = async () => {
  loading.value = true
  error.value = null

  try {
    const ecoleId = route.params.ecoleId as string
    const abonnementId = route.params.abonnementId as string

    if (!ecoleId || !abonnementId) {
      error.value = 'Paramètres manquants'
      return
    }

    // Check if we have encoded data from QR code
    const encodedData = (route.query.d || route.query.data) as string
    if (encodedData) {
      try {
        const decodedData = JSON.parse(atob(encodedData))
        console.log('Données QR code décodées:', decodedData)

        // Support pour nouveau format avec clés courtes
        const qrAbonnementId = decodedData.a || decodedData.abonnement_id
        const qrEcoleId = decodedData.e || decodedData.ecole_id

        // Afficher les infos du QR code pour debug
        if (qrAbonnementId === abonnementId && qrEcoleId === ecoleId) {
          console.log('✓ QR code data matches:', {
            numero: decodedData.n,
            montant: decodedData.m,
            statut: decodedData.s,
            ecole: decodedData.ec,
            site: decodedData.si,
            sirene: decodedData.sr
          })
        }
      } catch (e) {
        console.warn('Failed to decode QR code data:', e)
      }
    }

    // Load school data from API
    const ecoleResponse = await ecoleService.getById(ecoleId)
    if (!ecoleResponse.success || !ecoleResponse.data) {
      error.value = 'École introuvable'
      return
    }

    ecole.value = ecoleResponse.data

    // Find the abonnement from all sites' sirens
    let foundAbonnement = null
    let foundSite = null

    // Check principal site first
    if (ecole.value.site_principal?.sirene) {
      const sireneAbonnement = ecole.value.site_principal.sirene.abonnementEnAttente ||
                              ecole.value.site_principal.sirene.abonnement_en_attente
      if (sireneAbonnement?.id === abonnementId) {
        foundAbonnement = sireneAbonnement
        foundSite = ecole.value.site_principal
      }

      if (!foundAbonnement) {
        const sireneAbonnementActif = ecole.value.site_principal.sirene.abonnementActif ||
                                     ecole.value.site_principal.sirene.abonnement_actif
        if (sireneAbonnementActif?.id === abonnementId) {
          foundAbonnement = sireneAbonnementActif
          foundSite = ecole.value.site_principal
        }
      }
    }

    // Then check annexes sites
    if (!foundAbonnement && ecole.value.sites_annexe) {
      for (const siteAnnexe of ecole.value.sites_annexe) {
        if (!siteAnnexe.sirene) continue

        const sireneAbonnement = siteAnnexe.sirene.abonnementEnAttente || siteAnnexe.sirene.abonnement_en_attente
        if (sireneAbonnement?.id === abonnementId) {
          foundAbonnement = sireneAbonnement
          foundSite = siteAnnexe
          break
        }

        const sireneAbonnementActif = siteAnnexe.sirene.abonnementActif || siteAnnexe.sirene.abonnement_actif
        if (sireneAbonnementActif?.id === abonnementId) {
          foundAbonnement = sireneAbonnementActif
          foundSite = siteAnnexe
          break
        }
      }
    }

    if (!foundAbonnement) {
      error.value = 'Abonnement introuvable'
      return
    }

    abonnement.value = foundAbonnement
    site.value = foundSite
    paymentUrl.value = getPaymentUrl(foundAbonnement.notes)

  } catch (err: any) {
    console.error('Failed to load checkout data:', err)
    error.value = 'Impossible de charger les informations de paiement'
    notificationStore.error('Erreur', 'Impossible de charger les informations')
  } finally {
    loading.value = false
  }
}

const proceedToPayment = async () => {
  if (!abonnement.value || !ecole.value) {
    notificationStore.error('Erreur', 'Données manquantes')
    return
  }

  try {
    loading.value = true

    // Importer le service CinetPay
    const cinetpayService = (await import('../services/cinetpayService')).default

    // Générer l'ID de transaction
    const transactionId = cinetpayService.generateTransactionId(abonnement.value.id)

    // Préparer les métadonnées
    const metadata = {
      abonnement_id: abonnement.value.id,
      numero_abonnement: abonnement.value.numero_abonnement,
      ecole_id: ecole.value.id,
      ecole_nom: ecole.value.nom,
      site_id: abonnement.value.site_id,
      sirene_id: abonnement.value.sirene_id,
      date_debut: abonnement.value.date_debut,
      date_fin: abonnement.value.date_fin,
      montant: abonnement.value.montant,
      type_paiement: 'ABONNEMENT_INITIAL',
    }

    // Préparer les données de paiement pour le SDK Seamless
    const paymentData: any = {
      transaction_id: transactionId,
      amount: typeof abonnement.value.montant === 'string'
        ? parseInt(abonnement.value.montant)
        : abonnement.value.montant,
      currency: 'XOF',
      channels: 'ALL',
      description: `Paiement abonnement sirene ${abonnement.value.numero_abonnement}`,
      customer_name: ecole.value.responsable_nom || ecole.value.nom,
      customer_surname: ecole.value.responsable_prenom || '',
      customer_phone_number: cinetpayService.formatPhoneNumber(ecole.value.telephone_contact),
      lang: 'FR',
      metadata: metadata,
    }

    // Ajouter les champs optionnels seulement s'ils ont des valeurs valides
    if (ecole.value.email_contact && ecole.value.email_contact.includes('@')) {
      paymentData.customer_email = ecole.value.email_contact
    }

    if (site.value?.adresse) {
      paymentData.customer_address = site.value.adresse
    }

    if (site.value?.ville?.nom) {
      paymentData.customer_city = site.value.ville.nom
      paymentData.customer_state = site.value.ville.nom
    }

    if (site.value?.ville?.pays?.code_iso) {
      paymentData.customer_country = site.value.ville.pays.code_iso
    }

    // Invoice data simplifié
    paymentData.invoice_data = {
      Ecole: ecole.value.nom,
      Abonnement: abonnement.value.numero_abonnement,
      Periode: `${formatDate(abonnement.value.date_debut)} au ${formatDate(abonnement.value.date_fin)}`,
    }

    console.log('Payment data being sent to CinetPay:', paymentData)

    // Initier le paiement avec le SDK Seamless (modal sur la même page)
    const result = await cinetpayService.initierPaiement(paymentData)

    // Paiement réussi
    notificationStore.success('Succès', 'Paiement effectué avec succès !')

    // Rediriger vers la page de callback avec le statut
    router.push({
      path: '/paiement/callback',
      query: {
        status: 'success',
        message: 'Paiement effectué avec succès',
        transaction_id: result.transaction_id
      }
    })

  } catch (error: any) {
    console.error('Failed to initiate payment:', error)

    // Check if it's a user cancellation
    if (error.message === 'Fenêtre de paiement fermée') {
      notificationStore.warning('Annulé', 'Paiement annulé')
    } else if (error.message === 'Paiement refusé') {
      notificationStore.error('Refusé', 'Le paiement a été refusé')
    } else {
      notificationStore.error('Erreur', error.message || 'Impossible d\'initier le paiement')
    }
  } finally {
    loading.value = false
  }
}

const simulateSuccessfulPayment = async () => {
  if (!abonnement.value || !ecole.value) {
    notificationStore.error('Erreur', 'Données manquantes')
    return
  }

  try {
    loading.value = true
    notificationStore.info('Simulation', 'Simulation du paiement en cours...')

    // Importer le service CinetPay
    const cinetpayService = (await import('../services/cinetpayService')).default

    // Générer l'ID de transaction
    const transactionId = cinetpayService.generateTransactionId(abonnement.value.id)

    // Préparer les métadonnées
    const metadata = {
      abonnement_id: abonnement.value.id,
      numero_abonnement: abonnement.value.numero_abonnement,
      ecole_id: ecole.value.id,
      ecole_nom: ecole.value.nom,
      site_id: abonnement.value.site_id,
      sirene_id: abonnement.value.sirene_id,
      date_debut: abonnement.value.date_debut,
      date_fin: abonnement.value.date_fin,
      montant: abonnement.value.montant,
      type_paiement: 'ABONNEMENT_INITIAL',
    }

    // Simuler le paiement
    const result = await cinetpayService.simulerPaiementReussi({
      transaction_id: transactionId,
      amount: typeof abonnement.value.montant === 'string'
        ? parseInt(abonnement.value.montant)
        : abonnement.value.montant,
      metadata: metadata,
    })

    // Paiement simulé réussi
    notificationStore.success('Simulation réussie', 'Paiement simulé avec succès ! L\'abonnement devrait être activé.')

    // Rediriger vers la page de callback avec le statut
    router.push({
      path: '/paiement/callback',
      query: {
        status: 'success',
        message: 'Paiement simulé avec succès',
        transaction_id: result.transaction_id,
        simulated: 'true'
      }
    })

  } catch (error: any) {
    console.error('Failed to simulate payment:', error)
    notificationStore.error('Erreur', error.message || 'Impossible de simuler le paiement')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
