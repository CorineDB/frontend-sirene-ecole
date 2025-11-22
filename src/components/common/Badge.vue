<template>
  <span
    :class="[
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      colorClasses
    ]"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  color?: 'gray' | 'red' | 'yellow' | 'green' | 'blue' | 'indigo' | 'purple' | 'pink' | 'orange'
  variant?: 'solid' | 'outline'
}

const props = withDefaults(defineProps<Props>(), {
  color: 'gray',
  variant: 'solid'
})

const colorClasses = computed(() => {
  if (props.variant === 'outline') {
    const outlineColors = {
      gray: 'bg-gray-100 text-gray-800 border border-gray-300',
      red: 'bg-red-100 text-red-800 border border-red-300',
      yellow: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
      green: 'bg-green-100 text-green-800 border border-green-300',
      blue: 'bg-blue-100 text-blue-800 border border-blue-300',
      indigo: 'bg-indigo-100 text-indigo-800 border border-indigo-300',
      purple: 'bg-purple-100 text-purple-800 border border-purple-300',
      pink: 'bg-pink-100 text-pink-800 border border-pink-300',
      orange: 'bg-orange-100 text-orange-800 border border-orange-300'
    }
    return outlineColors[props.color]
  }

  // Solid variant
  const solidColors = {
    gray: 'bg-gray-100 text-gray-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    indigo: 'bg-indigo-100 text-indigo-800',
    purple: 'bg-purple-100 text-purple-800',
    pink: 'bg-pink-100 text-pink-800',
    orange: 'bg-orange-100 text-orange-800'
  }
  return solidColors[props.color]
})
</script>
