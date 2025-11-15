<template>
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="translate-x-full opacity-0"
    enter-to-class="translate-x-0 opacity-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="translate-x-0 opacity-100"
    leave-to-class="translate-x-full opacity-0"
  >
    <div
      v-if="visible"
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      :class="[
        'max-w-sm sm:max-w-md md:max-w-lg w-full rounded-lg shadow-lg pointer-events-auto overflow-hidden',
        'border-l-4',
        colorClasses
      ]"
      @mouseenter="pauseTimer"
      @mouseleave="resumeTimer"
    >
      <div class="p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <component
              :is="icon"
              :class="['w-6 h-6', iconColorClass]"
              :aria-label="`Icône de ${notification.type}`"
              role="img"
            />
          </div>
          <div class="ml-3 w-0 flex-1 pt-0.5">
            <p class="text-sm font-semibold text-gray-900">
              {{ notification.title }}
            </p>
            <p v-if="notification.message" class="mt-1 text-sm text-gray-600">
              {{ notification.message }}
            </p>
          </div>
          <div class="ml-4 flex-shrink-0 flex">
            <button
              @click="close"
              class="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded transition-colors"
              aria-label="Fermer la notification"
            >
              <X :size="20" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      <!-- Progress bar -->
      <div
        v-if="notification.duration && notification.duration > 0"
        class="h-1 bg-gray-200"
      >
        <div
          :class="['h-full transition-all', progressBarColorClass]"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-vue-next'
import type { Notification } from '../../stores/notifications'

interface Props {
  notification: Notification
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: [id: string]
}>()

const visible = ref(false)
const progress = ref(100)
let startTime = 0
let remainingTime = 0
let animationFrameId: number | null = null
let isPaused = ref(false)

// Icônes selon le type
const icon = computed(() => {
  switch (props.notification.type) {
    case 'success':
      return CheckCircle
    case 'error':
      return XCircle
    case 'warning':
      return AlertTriangle
    case 'info':
    default:
      return Info
  }
})

// Classes de couleur selon le type
const colorClasses = computed(() => {
  switch (props.notification.type) {
    case 'success':
      return 'bg-white border-green-500'
    case 'error':
      return 'bg-white border-red-500'
    case 'warning':
      return 'bg-white border-orange-500'
    case 'info':
    default:
      return 'bg-white border-blue-500'
  }
})

const iconColorClass = computed(() => {
  switch (props.notification.type) {
    case 'success':
      return 'text-green-500'
    case 'error':
      return 'text-red-500'
    case 'warning':
      return 'text-orange-500'
    case 'info':
    default:
      return 'text-blue-500'
  }
})

const progressBarColorClass = computed(() => {
  switch (props.notification.type) {
    case 'success':
      return 'bg-green-500'
    case 'error':
      return 'bg-red-500'
    case 'warning':
      return 'bg-orange-500'
    case 'info':
    default:
      return 'bg-blue-500'
  }
})

const close = () => {
  visible.value = false
  setTimeout(() => {
    emit('close', props.notification.id)
  }, 300) // Attendre la fin de l'animation
}

const updateProgress = () => {
  if (!props.notification.duration || isPaused.value) return

  const elapsed = Date.now() - startTime
  const remaining = Math.max(0, remainingTime - elapsed)
  progress.value = (remaining / props.notification.duration) * 100

  if (remaining > 0) {
    animationFrameId = requestAnimationFrame(updateProgress)
  } else {
    close()
  }
}

const pauseTimer = () => {
  isPaused.value = true
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  remainingTime = (progress.value / 100) * (props.notification.duration || 0)
}

const resumeTimer = () => {
  isPaused.value = false
  startTime = Date.now()
  animationFrameId = requestAnimationFrame(updateProgress)
}

onMounted(() => {
  visible.value = true

  if (props.notification.duration && props.notification.duration > 0) {
    startTime = Date.now()
    remainingTime = props.notification.duration
    animationFrameId = requestAnimationFrame(updateProgress)
  }
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
})
</script>
