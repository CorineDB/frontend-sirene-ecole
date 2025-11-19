<template>
  <PublicLayout>
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-2xl mx-auto">
        <!-- Success -->
        <div v-if="status === 'success'" class="bg-white rounded-xl p-8 border-2 border-green-200 shadow-lg text-center">
          <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle :size="48" class="text-green-600" />
          </div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Paiement réussi !</h1>
          <p class="text-gray-600 mb-6">{{ message }}</p>
          <div v-if="transactionId" class="bg-gray-50 rounded-lg p-4 mb-6">
            <p class="text-sm text-gray-500 mb-1">Transaction ID</p>
            <p class="font-mono font-semibold text-gray-900">{{ transactionId }}</p>
          </div>
          <div class="flex gap-4 justify-center">
            <button
              @click="router.push('/schools')"
              class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
            >
              Retour aux écoles
            </button>
          </div>
        </div>

        <!-- Pending -->
        <div v-else-if="status === 'pending'" class="bg-white rounded-xl p-8 border-2 border-amber-200 shadow-lg text-center">
          <div class="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock :size="48" class="text-amber-600" />
          </div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Paiement en attente</h1>
          <p class="text-gray-600 mb-6">{{ message }}</p>
          <div v-if="transactionId" class="bg-gray-50 rounded-lg p-4 mb-6">
            <p class="text-sm text-gray-500 mb-1">Transaction ID</p>
            <p class="font-mono font-semibold text-gray-900">{{ transactionId }}</p>
          </div>
          <div class="flex gap-4 justify-center">
            <button
              @click="checkStatus"
              :disabled="checking"
              class="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-semibold transition-colors disabled:opacity-50"
            >
              {{ checking ? 'Vérification...' : 'Vérifier le statut' }}
            </button>
            <button
              @click="router.push('/schools')"
              class="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition-colors"
            >
              Retour
            </button>
          </div>
        </div>

        <!-- Error -->
        <div v-else class="bg-white rounded-xl p-8 border-2 border-red-200 shadow-lg text-center">
          <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle :size="48" class="text-red-600" />
          </div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Erreur de paiement</h1>
          <p class="text-gray-600 mb-6">{{ message || 'Une erreur est survenue lors du paiement' }}</p>
          <div v-if="transactionId" class="bg-gray-50 rounded-lg p-4 mb-6">
            <p class="text-sm text-gray-500 mb-1">Transaction ID</p>
            <p class="font-mono font-semibold text-gray-900">{{ transactionId }}</p>
          </div>
          <div class="flex gap-4 justify-center">
            <button
              @click="router.push('/schools')"
              class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
            >
              Retour aux écoles
            </button>
          </div>
        </div>
      </div>
    </div>
  </PublicLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PublicLayout from '../components/layout/PublicLayout.vue'
import { CheckCircle, Clock, AlertCircle } from 'lucide-vue-next'
import cinetpayService from '../services/cinetpayService'
import { useNotificationStore } from '../stores/notifications'

const router = useRouter()
const route = useRoute()
const notificationStore = useNotificationStore()

const status = ref<'success' | 'pending' | 'error'>('pending')
const message = ref('')
const transactionId = ref<string | null>(null)
const checking = ref(false)

const checkStatus = async () => {
  if (!transactionId.value) return

  checking.value = true
  try {
    const result = await cinetpayService.checkStatus(transactionId.value)

    if (result.success && result.data?.data?.status) {
      const txStatus = result.data.data.status
      if (txStatus === 'ACCEPTED' || txStatus === '00') {
        status.value = 'success'
        message.value = 'Paiement confirmé avec succès'
        notificationStore.success('Succès', 'Paiement confirmé')
      } else {
        status.value = 'pending'
        message.value = 'Paiement toujours en attente'
      }
    }
  } catch (error: any) {
    console.error('Failed to check status:', error)
    notificationStore.error('Erreur', 'Impossible de vérifier le statut')
  } finally {
    checking.value = false
  }
}

onMounted(() => {
  status.value = (route.query.status as any) || 'error'
  message.value = (route.query.message as string) || ''
  transactionId.value = (route.query.transaction_id as string) || null
})
</script>
