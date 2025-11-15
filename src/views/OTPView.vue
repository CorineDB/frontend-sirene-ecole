<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <button
          @click="goBack"
          class="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          aria-label="Retour à la page de connexion"
        >
          <ArrowLeft :size="16" aria-hidden="true" />
          <span class="text-sm">Retour</span>
        </button>

        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl mb-4">
            <Shield :size="32" class="text-white" />
          </div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Vérification</h1>
          <p class="text-gray-600">
            Entrez le code à 6 chiffres envoyé au
            <br />
            <span class="font-semibold text-gray-900">{{ phone || '+226 XX XX XX XX' }}</span>
          </p>
        </div>

        <form @submit.prevent="handleVerifyOTP" class="space-y-6">
          <div class="flex justify-center gap-2" @paste="handlePaste" role="group" aria-labelledby="otp-label">
            <input
              v-for="(digit, index) in otp"
              :key="index"
              :ref="(el) => setInputRef(el, index)"
              type="text"
              inputmode="numeric"
              pattern="[0-9]"
              maxlength="1"
              :value="digit"
              @input="(e) => handleChange(index, (e.target as HTMLInputElement).value)"
              @keydown="(e) => handleKeyDown(index, e)"
              class="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus-visible:ring-2 focus-visible:ring-blue-600 transition-all"
              :autofocus="index === 0"
              :aria-label="`Chiffre ${index + 1} du code OTP`"
              :aria-describedby="errorMessage ? 'otp-error' : undefined"
            />
          </div>
          <span id="otp-label" class="sr-only">Code OTP à 6 chiffres</span>

          <p v-if="errorMessage" id="otp-error" class="text-sm text-center text-red-600" role="alert" aria-live="assertive">
            {{ errorMessage }}
          </p>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {{ loading ? 'Vérification...' : 'Vérifier le code' }}
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600 mb-2">Vous n'avez pas reçu le code ?</p>
          <button
            @click="handleResendOTP"
            class="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors focus:outline-none focus-visible:underline focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-2 py-1"
            aria-label="Renvoyer le code OTP"
          >
            Renvoyer le code
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, type ComponentPublicInstance } from 'vue'
import { useRouter } from 'vue-router'
import { Shield, ArrowLeft } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const otp = ref<string[]>(['', '', '', '', '', ''])
const loading = ref(false)
const inputRefs = ref<(HTMLInputElement | null)[]>([])
const phone = ref<string>('')
const errorMessage = ref('')

onMounted(() => {
  // Get phone number from auth store
  phone.value = authStore.phoneNumber

  // If no OTP requested or no phone number, redirect to login
  if (!authStore.otpRequested || !phone.value) {
    router.push('/login')
  }
})

const setInputRef = (el: Element | ComponentPublicInstance | null, index: number) => {
  if (el) {
    inputRefs.value[index] = el as HTMLInputElement
  }
}

const handleChange = (index: number, value: string) => {
  // Ne garder que les chiffres
  if (!/^\d*$/.test(value)) return

  const newOtp = [...otp.value]
  newOtp[index] = value
  otp.value = newOtp

  // Passer au champ suivant si une valeur a été entrée
  if (value && index < 5) {
    inputRefs.value[index + 1]?.focus()
  }
}

const handleKeyDown = (index: number, e: KeyboardEvent) => {
  if (e.key === 'Backspace' && !otp.value[index] && index > 0) {
    inputRefs.value[index - 1]?.focus()
  }
}

const handlePaste = (e: ClipboardEvent) => {
  e.preventDefault()
  const pastedData = e.clipboardData?.getData('text').slice(0, 6) || ''
  const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6)
  otp.value = newOtp
}

const handleVerifyOTP = async () => {
  const otpCode = otp.value.join('')

  // Clear previous error
  errorMessage.value = ''

  if (otpCode.length !== 6) {
    errorMessage.value = 'Veuillez entrer les 6 chiffres du code'
    return
  }

  loading.value = true

  try {
    const result = await authStore.verifyOtp({
      telephone: phone.value,
      otp: otpCode
    })

    if (!result.success) {
      errorMessage.value = result.message || 'Code OTP invalide'
      // Clear OTP inputs on error
      otp.value = ['', '', '', '', '', '']
      inputRefs.value[0]?.focus()
    }
    // Success case is handled by the store (redirects to dashboard)
  } catch (err) {
    const error = err as Error
    console.error('Erreur lors de la vérification:', error)
    errorMessage.value = error.message || 'Une erreur est survenue'
    otp.value = ['', '', '', '', '', '']
    inputRefs.value[0]?.focus()
  } finally {
    loading.value = false
  }
}

const handleResendOTP = async () => {
  errorMessage.value = ''

  try {
    const result = await authStore.requestOtp({
      telephone: phone.value
    })

    if (result.success) {
      otp.value = ['', '', '', '', '', '']
      inputRefs.value[0]?.focus()
      notificationStore.success('Code OTP renvoyé', 'Un nouveau code a été envoyé à votre numéro')
    } else {
      errorMessage.value = result.message || 'Erreur lors du renvoi du code'
    }
  } catch (err) {
    const error = err as Error
    console.error('Erreur lors du renvoi du code:', error)
    errorMessage.value = error.message || 'Une erreur est survenue'
  }
}

const goBack = () => {
  router.push('/login')
}
</script>
