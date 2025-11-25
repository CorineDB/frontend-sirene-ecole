<template>
  <DashboardLayout>
    <div class="p-6 space-y-6">
      <!-- Header with back button -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button
            @click="router.back()"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft :size="24" class="text-gray-600" />
          </button>
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Détails de l'abonnement</h1>
            <p v-if="abonnement" class="text-gray-600 mt-1">{{ abonnement.numero_abonnement }}</p>
          </div>
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

      <!-- Content -->
      <div v-if="!isLoading && !hasError && abonnement" class="space-y-6">
        <!-- Main Info Card -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <div class="flex items-start justify-between mb-6">
            <div>
              <h2 class="text-xl font-bold text-gray-900 mb-2">Informations générales</h2>
              <StatusBadge type="abonnement" :status="abonnement.statut" />
            </div>
            <div class="flex gap-2">
              <button
                v-if="canBeActivated(abonnement)"
                @click="handleActiver"
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors flex items-center gap-2"
              >
                <Play :size="18" />
                Activer abonnement
              </button>
              <button
                v-if="abonnement.statut === StatutAbonnement.EN_ATTENTE"
                @click="handlePayer"
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors flex items-center gap-2"
              >
                <CreditCard :size="18" />
                Payer maintenant
              </button>
              <button
                v-if="abonnement.statut === StatutAbonnement.EN_ATTENTE"
                @click="handlePartagerQr"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors flex items-center gap-2"
              >
                <Share2 :size="18" />
                Partager QR Code
              </button>
              <button
                v-if="canBeRenewed(abonnement)"
                @click="handleRenouveler"
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors flex items-center gap-2"
              >
                <RefreshCw :size="18" />
                Renouveler
              </button>
              <button
                v-if="canBeSuspended(abonnement)"
                @click="handleSuspendre"
                class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold transition-colors flex items-center gap-2"
              >
                <Pause :size="18" />
                Suspendre
              </button>
              <button
                v-if="canBeReactivated(abonnement)"
                @click="handleReactiver"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors flex items-center gap-2"
              >
                <Play :size="18" />
                Réactiver
              </button>
              <button
                v-if="canBeCancelled(abonnement)"
                @click="handleAnnuler"
                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors flex items-center gap-2"
              >
                <XCircle :size="18" />
                Annuler
              </button>
              <button
                v-if="abonnement.statut === StatutAbonnement.ACTIF || abonnement.statut === StatutAbonnement.EXPIRE || abonnement.statut === StatutAbonnement.SUSPENDU"
                @click="handleTelechargerFacture"
                class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition-colors flex items-center gap-2"
              >
                <FileText :size="18" />
                Télécharger facture
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p class="text-sm text-gray-600 mb-1">Numéro d'abonnement</p>
              <p class="font-mono text-lg font-semibold text-gray-900">{{ abonnement.numero_abonnement }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600 mb-1">Montant</p>
              <p class="text-lg font-semibold text-gray-900">{{ abonnement.montant.toLocaleString() }} XOF</p>
            </div>
            <div>
              <p class="text-sm text-gray-600 mb-1">Date de début</p>
              <p class="text-lg font-semibold text-gray-900">{{ formatDate(abonnement.date_debut) }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600 mb-1">Date de fin</p>
              <p class="text-lg font-semibold text-gray-900">{{ formatDate(abonnement.date_fin) }}</p>
            </div>
            <div v-if="abonnement.statut === StatutAbonnement.ACTIF">
              <p class="text-sm text-gray-600 mb-1">Jours restants</p>
              <p :class="`text-lg font-semibold ${joursRestants < 30 ? 'text-red-600' : joursRestants < 60 ? 'text-orange-600' : 'text-gray-900'}`">
                {{ joursRestants }} jours
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-600 mb-1">Auto-renouvellement</p>
              <p class="text-lg font-semibold text-gray-900">
                {{ abonnement.auto_renouvellement ? 'Activé' : 'Désactivé' }}
              </p>
            </div>
          </div>

          <div v-if="abonnement.notes" class="mt-6 pt-6 border-t border-gray-200">
            <p class="text-sm text-gray-600 mb-2">Notes</p>
            <p class="text-gray-900">{{ abonnement.notes }}</p>
          </div>
        </div>

        <!-- École Info -->
        <div v-if="abonnement.ecole" class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <School :size="24" class="text-blue-600" />
            École
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-600 mb-1">Nom</p>
              <p class="text-lg font-semibold text-gray-900">{{ abonnement.ecole.nom }}</p>
            </div>
            <div v-if="abonnement.ecole.email">
              <p class="text-sm text-gray-600 mb-1">Email</p>
              <p class="text-gray-900">{{ abonnement.ecole.email }}</p>
            </div>
            <div v-if="abonnement.ecole.telephone">
              <p class="text-sm text-gray-600 mb-1">Téléphone</p>
              <p class="text-gray-900">{{ abonnement.ecole.telephone }}</p>
            </div>
          </div>
        </div>

        <!-- Site Info -->
        <div v-if="abonnement.site" class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin :size="24" class="text-green-600" />
            Site
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-600 mb-1">Nom du site</p>
              <p class="text-lg font-semibold text-gray-900">{{ abonnement.site.nom }}</p>
            </div>
            <div v-if="abonnement.site.ville">
              <p class="text-sm text-gray-600 mb-1">Ville</p>
              <p class="text-gray-900">{{ abonnement.site.ville }}</p>
            </div>
            <div v-if="abonnement.site.adresse" class="md:col-span-2">
              <p class="text-sm text-gray-600 mb-1">Adresse</p>
              <p class="text-gray-900">{{ abonnement.site.adresse }}</p>
            </div>
          </div>
        </div>

        <!-- Sirène Info -->
        <div v-if="abonnement.sirene" class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Bell :size="24" class="text-purple-600" />
            Sirène
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-600 mb-1">Numéro de série</p>
              <p class="font-mono text-lg font-semibold text-gray-900">{{ abonnement.sirene.numero_serie }}</p>
            </div>
            <div v-if="abonnement.sirene.modele">
              <p class="text-sm text-gray-600 mb-1">Modèle</p>
              <p class="text-gray-900">{{ abonnement.sirene.modele }}</p>
            </div>
          </div>
        </div>

        <!-- QR Code -->
        <div v-if="abonnement.qr_code_url" class="bg-white rounded-xl border border-gray-200 p-6">
          <div class="flex items-start justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
              <QrCode :size="24" class="text-indigo-600" />
              QR Code
            </h2>
            <div class="flex gap-2">
              <button
                @click="handleTelechargerQr"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors flex items-center gap-2"
              >
                <Download :size="18" />
                Télécharger
              </button>
              <button
                v-if="abonnement.statut === StatutAbonnement.EN_ATTENTE"
                @click="handleRegenererQr"
                class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors flex items-center gap-2"
              >
                <RefreshCw :size="18" />
                Regénérer
              </button>
            </div>
          </div>
          <div class="flex justify-center">
            <img :src="abonnement.qr_code_url" alt="QR Code" class="w-64 h-64 border border-gray-200 rounded-lg" />
          </div>
        </div>

        <!-- Token Info -->
        <div v-if="abonnement.token" class="bg-white rounded-xl border border-gray-200 p-6">
          <div class="flex items-start justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Key :size="24" class="text-yellow-600" />
              Token de sirène
            </h2>
            <button
              @click="handleRegenererToken"
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors flex items-center gap-2"
            >
              <RefreshCw :size="18" />
              Regénérer
            </button>
          </div>
          <div class="bg-gray-50 rounded-lg p-4 font-mono text-sm break-all">
            {{ abonnement.token.token }}
          </div>
        </div>

        <!-- Paiements -->
        <div v-if="abonnement.paiements && abonnement.paiements.length > 0" class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard :size="24" class="text-green-600" />
            Paiements ({{ abonnement.paiements.length }})
          </h2>
          <div class="space-y-3">
            <div
              v-for="paiement in abonnement.paiements"
              :key="paiement.id"
              class="border border-gray-200 rounded-lg p-4"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-semibold text-gray-900">{{ paiement.montant.toLocaleString() }} XOF</p>
                  <p class="text-sm text-gray-600">{{ formatDate(paiement.date_paiement) }}</p>
                </div>
                <StatusBadge v-if="paiement.statut" type="paiement" :status="paiement.statut" />
              </div>
            </div>
          </div>
        </div>

        <!-- Metadata -->
        <div class="bg-gray-50 rounded-xl border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Métadonnées</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-gray-600 mb-1">Créé le</p>
              <p class="text-gray-900">{{ formatDateTime(abonnement.created_at) }}</p>
            </div>
            <div>
              <p class="text-gray-600 mb-1">Dernière modification</p>
              <p class="text-gray-900">{{ formatDateTime(abonnement.updated_at) }}</p>
            </div>
            <div>
              <p class="text-gray-600 mb-1">ID</p>
              <p class="font-mono text-gray-900">{{ abonnement.id }}</p>
            </div>
            <div v-if="abonnement.parent_abonnement_id">
              <p class="text-gray-600 mb-1">Abonnement parent</p>
              <p class="font-mono text-gray-900">{{ abonnement.parent_abonnement_id }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import DashboardLayout from '../components/layout/DashboardLayout.vue'
import StatusBadge from '../components/common/StatusBadge.vue'
import { useAbonnements } from '@/composables/useAbonnements'
import { useAbonnementRules } from '@/composables/useAbonnementRules'
import { StatutAbonnement } from '@/types/api'
import cinetpayService from '@/services/cinetpayService'
import { useNotificationStore } from '@/stores/notifications'
import {
  ArrowLeft,
  RefreshCw,
  Pause,
  Play,
  XCircle,
  School,
  MapPin,
  Bell,
  QrCode,
  Key,
  CreditCard,
  Download,
  AlertCircle,
  Share2,
  FileText
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const notificationStore = useNotificationStore()

// Composable
const {
  abonnement,
  isLoading,
  hasError,
  error,
  fetchById,
  renouveler,
  suspendre,
  reactiver,
  annuler,
  activer,
  regenererQrCode,
  regenererToken,
  telechargerQrCode,
  partagerQrCode
} = useAbonnements()

const { canBeRenewed, canBeCancelled, canBeSuspended, canBeReactivated, canBeActivated } = useAbonnementRules()

// Computed
const joursRestants = computed(() => {
  if (!abonnement.value) return 0
  const end = new Date(abonnement.value.date_fin)
  const now = new Date()
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
})

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleRenouveler = async () => {
  if (!abonnement.value) return
  if (confirm('Êtes-vous sûr de vouloir renouveler cet abonnement ?')) {
    await renouveler(abonnement.value.id)
  }
}

const handleSuspendre = async () => {
  if (!abonnement.value) return
  const raison = prompt('Raison de la suspension (optionnel):')
  if (raison !== null) {
    await suspendre(abonnement.value.id, raison || undefined)
  }
}

const handleReactiver = async () => {
  if (!abonnement.value) return
  if (confirm('Êtes-vous sûr de vouloir réactiver cet abonnement ?')) {
    await reactiver(abonnement.value.id)
  }
}

const handleAnnuler = async () => {
  if (!abonnement.value) return
  const raison = prompt('Raison de l\'annulation (optionnel):')
  if (raison !== null && confirm('Êtes-vous sûr de vouloir annuler cet abonnement ? Cette action est irréversible.')) {
    await annuler(abonnement.value.id, raison || undefined)
  }
}

const handleActiver = async () => {
  if (!abonnement.value) return
  if (confirm('Êtes-vous sûr de vouloir activer cet abonnement ?')) {
    await activer(abonnement.value.id)
  }
}

const handleRegenererQr = async () => {
  if (!abonnement.value) return
  if (confirm('Êtes-vous sûr de vouloir regénérer le QR code ?')) {
    await regenererQrCode(abonnement.value.id)
  }
}

const handleRegenererToken = async () => {
  if (!abonnement.value) return
  if (confirm('Êtes-vous sûr de vouloir regénérer le token ? L\'ancien token ne fonctionnera plus.')) {
    await regenererToken(abonnement.value.id)
  }
}

const handleTelechargerQr = async () => {
  if (!abonnement.value) return
  await telechargerQrCode(abonnement.value.id)
}

const goToCheckout = (ecoleId: string, abonnementId: string) => {
  router.push(`/checkout/${ecoleId}/${abonnementId}`)
}

const handlePayer = async () => {
  if (!abonnement.value) return

  try {
    // Générer un ID de transaction
    const transactionId = cinetpayService.generateTransactionId(abonnement.value.id)

    // Préparer les données de paiement
    const paymentData = {
      transaction_id: transactionId,
      amount: abonnement.value.montant,
      description: `Paiement abonnement ${abonnement.value.numero_abonnement}`,
      customer_name: abonnement.value.ecole?.nom || 'École',
      customer_surname: '',
      customer_phone_number: cinetpayService.formatPhoneNumber(abonnement.value.ecole?.telephone),
      customer_email: abonnement.value.ecole?.email || undefined,
      metadata: {
        abonnement_id: abonnement.value.id,
        ecole_id: abonnement.value.ecole_id,
        type: 'abonnement_payment'
      }
    }

    // Initier le paiement
    notificationStore.info('Paiement', 'Ouverture de la fenêtre de paiement...')
    const response = await cinetpayService.initierPaiement(paymentData)

    if (response.status === 'ACCEPTED') {
      notificationStore.success('Paiement réussi', 'Votre paiement a été accepté')
      // Recharger l'abonnement pour voir le nouveau statut
      await fetchById(abonnement.value.id)
    }
  } catch (err: any) {
    console.error('Erreur paiement:', err)
    notificationStore.error('Erreur de paiement', err.message || 'Impossible de traiter le paiement')
  }
}

const handlePartagerQr = async () => {
  if (!abonnement.value) return
  await partagerQrCode(abonnement.value)
}



const handleTelechargerFacture = async () => {
  if (!abonnement.value) return

  // TODO: Implémenter le téléchargement de facture quand le backend sera prêt
  notificationStore.warning(
    'Fonctionnalité à venir',
    'Le téléchargement de facture sera bientôt disponible'
  )

  // Placeholder pour future implémentation:
  // try {
  //   const blob = await abonnementService.telechargerFacture(abonnement.value.id)
  //   const url = window.URL.createObjectURL(blob)
  //   const link = document.createElement('a')
  //   link.href = url
  //   link.download = `facture-${abonnement.value.numero_abonnement}.pdf`
  //   document.body.appendChild(link)
  //   link.click()
  //   document.body.removeChild(link)
  //   window.URL.revokeObjectURL(url)
  // } catch (err) {
  //   notificationStore.error('Erreur', 'Impossible de télécharger la facture')
  // }
}

// Lifecycle
onMounted(async () => {
  const id = route.params.id as string
  if (id) {
    await fetchById(id)
  }
})
</script>
