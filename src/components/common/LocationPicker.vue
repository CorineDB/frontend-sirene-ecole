<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between mb-2">
      <label class="block text-sm font-semibold text-gray-700">
        {{ label }}
      </label>
      <button
        v-if="!showMap"
        @click="showMap = true"
        type="button"
        class="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
      >
        <MapPin :size="16" />
        Sélectionner sur la carte
      </button>
    </div>

    <!-- Map Container -->
    <div v-if="showMap" class="border border-gray-300 rounded-lg overflow-hidden">
      <div ref="mapContainer" class="w-full h-80"></div>
      <div class="p-3 bg-gray-50 border-t border-gray-300 flex items-center justify-between">
        <div class="text-sm">
          <span v-if="modelValue.latitude && modelValue.longitude" class="text-gray-700">
            <span class="font-semibold">Coordonnées:</span>
            <span class="font-mono ml-2">{{ modelValue.latitude.toFixed(6) }}, {{ modelValue.longitude.toFixed(6) }}</span>
          </span>
          <span v-else class="text-gray-500">Cliquez sur la carte pour sélectionner un point</span>
        </div>
        <button
          @click="closeMap"
          type="button"
          class="text-sm text-gray-600 hover:text-gray-700"
        >
          Fermer la carte
        </button>
      </div>
    </div>

    <!-- Manual Input -->
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="block text-xs text-gray-600 mb-1">Latitude</label>
        <input
          :value="modelValue.latitude || ''"
          @input="updateLatitude"
          type="number"
          step="any"
          placeholder="Ex: 12.3714"
          class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label class="block text-xs text-gray-600 mb-1">Longitude</label>
        <input
          :value="modelValue.longitude || ''"
          @input="updateLongitude"
          type="number"
          step="any"
          placeholder="Ex: -1.5197"
          class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { MapPin } from 'lucide-vue-next'

interface Props {
  modelValue: {
    latitude?: number
    longitude?: number
  }
  label?: string
  defaultCenter?: { lat: number; lng: number }
}

interface Emits {
  (e: 'update:modelValue', value: { latitude?: number; longitude?: number }): void
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Localisation GPS',
  defaultCenter: () => ({ lat: 12.3714, lng: -1.5197 }) // Ouagadougou par défaut
})

const emit = defineEmits<Emits>()

const showMap = ref(false)
const mapContainer = ref<HTMLElement | null>(null)
let map: any = null
let marker: any = null

// Charger Leaflet dynamiquement
const loadLeaflet = () => {
  return new Promise<void>((resolve, reject) => {
    // Vérifier si Leaflet est déjà chargé
    if ((window as any).L) {
      resolve()
      return
    }

    // Charger CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
    link.crossOrigin = ''
    document.head.appendChild(link)

    // Charger JS
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
    script.crossOrigin = ''
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Leaflet'))
    document.head.appendChild(script)
  })
}

const initMap = async () => {
  if (!mapContainer.value) return

  try {
    await loadLeaflet()

    const L = (window as any).L

    // Créer la carte
    const center = props.modelValue.latitude && props.modelValue.longitude
      ? [props.modelValue.latitude, props.modelValue.longitude]
      : [props.defaultCenter.lat, props.defaultCenter.lng]

    map = L.map(mapContainer.value).setView(center, 13)

    // Ajouter les tuiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map)

    // Ajouter un marqueur si on a déjà des coordonnées
    if (props.modelValue.latitude && props.modelValue.longitude) {
      marker = L.marker([props.modelValue.latitude, props.modelValue.longitude]).addTo(map)
    }

    // Gérer les clics sur la carte
    map.on('click', (e: any) => {
      const { lat, lng } = e.latlng

      // Supprimer l'ancien marqueur
      if (marker) {
        map.removeLayer(marker)
      }

      // Ajouter un nouveau marqueur
      marker = L.marker([lat, lng]).addTo(map)

      // Émettre les nouvelles coordonnées
      emit('update:modelValue', {
        latitude: lat,
        longitude: lng
      })
    })

    // Forcer le redimensionnement de la carte
    setTimeout(() => {
      map.invalidateSize()
    }, 100)
  } catch (error) {
    console.error('Error initializing map:', error)
  }
}

const updateLatitude = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  const latitude = value ? parseFloat(value) : undefined

  emit('update:modelValue', {
    ...props.modelValue,
    latitude
  })

  // Mettre à jour le marqueur sur la carte si elle est affichée
  if (map && latitude && props.modelValue.longitude) {
    updateMarker(latitude, props.modelValue.longitude)
  }
}

const updateLongitude = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  const longitude = value ? parseFloat(value) : undefined

  emit('update:modelValue', {
    ...props.modelValue,
    longitude
  })

  // Mettre à jour le marqueur sur la carte si elle est affichée
  if (map && props.modelValue.latitude && longitude) {
    updateMarker(props.modelValue.latitude, longitude)
  }
}

const updateMarker = (lat: number, lng: number) => {
  const L = (window as any).L

  if (marker) {
    map.removeLayer(marker)
  }

  marker = L.marker([lat, lng]).addTo(map)
  map.setView([lat, lng], 13)
}

const closeMap = () => {
  showMap.value = false
  if (map) {
    map.remove()
    map = null
    marker = null
  }
}

watch(() => showMap.value, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      initMap()
    }, 100)
  }
})

onBeforeUnmount(() => {
  if (map) {
    map.remove()
  }
})
</script>
