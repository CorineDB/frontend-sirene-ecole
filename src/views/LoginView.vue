<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl mb-4">
            <Bell :size="32" class="text-white" />
          </div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Sirène d'École</h1>
          <p class="text-gray-600">Connectez-vous à votre compte</p>
        </div>

        <form @submit.prevent="handleSendOTP" class="space-y-6">
          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
              Numéro de téléphone
            </label>
            <div class="relative">
              <Phone class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="phone"
                type="tel"
                v-model="phone"
                placeholder="+226 XX XX XX XX"
                class="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus-visible:ring-2 focus-visible:ring-blue-600 transition-all"
                required
                aria-label="Numéro de téléphone"
                aria-describedby="phone-help"
              />
            </div>
            <p id="phone-help" class="mt-2 text-sm text-gray-500">
              Un code de vérification sera envoyé à ce numéro
            </p>
            <p v-if="errorMessage" class="mt-2 text-sm text-red-600" role="alert" aria-live="assertive">
              {{ errorMessage }}
            </p>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {{ loading ? 'Envoi en cours...' : 'Recevoir le code OTP' }}
          </button>
        </form>

        <div class="mt-6 text-center text-sm text-gray-600">
          <p>Besoin d'aide ? Contactez votre administrateur</p>
        </div>
      </div>

      <div class="mt-6 text-center text-xs text-gray-500">
        <p>© 2025 Sirène d'École. Tous droits réservés.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Phone, Bell } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const phone = ref('')
const loading = ref(false)
const errorMessage = ref('')

const handleSendOTP = async () => {
  // Clear previous error
  errorMessage.value = ''

  // Validate phone number
  if (!phone.value || phone.value.trim().length < 8) {
    errorMessage.value = 'Veuillez entrer un numéro de téléphone valide'
    return
  }

  loading.value = true

  try {
    const result = await authStore.requestOtp({
      telephone: phone.value.trim()
    })

    if (result.success) {
      // Redirect to OTP page
      router.push({ name: 'OTP' })
    } else {
      errorMessage.value = result.message || 'Erreur lors de l\'envoi du code OTP'
    }
  } catch (err) {
    const error = err as Error
    console.error('Erreur lors de l\'envoi du code OTP:', error)
    errorMessage.value = error.message || 'Une erreur est survenue'
  } finally {
    loading.value = false
  }
}
</script>
