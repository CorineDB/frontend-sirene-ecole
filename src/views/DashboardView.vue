<template>
  <DashboardLayout>
    <div class="p-6 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p class="text-gray-600 mt-1">
            Bienvenue, <span class="font-semibold">{{ authStore.user?.nom_utilisateur }}</span>
          </p>
        </div>
        <div class="text-sm text-gray-500">
          {{ currentDate }}
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="(card, index) in statCards"
          :key="index"
          class="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all transform hover:scale-[1.02]"
        >
          <div class="flex items-center justify-between mb-4">
            <div :class="`${card.bgColor} p-3 rounded-xl`">
              <component :is="card.icon" :size="24" :class="`${card.iconColor}`" />
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-600">{{ card.title }}</p>
              <p :class="`text-2xl font-bold text-gray-900 ${card.isAmount ? 'text-lg' : ''}`">
                {{ card.value }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <TrendingUp :size="16" class="text-green-600" />
            <span class="text-green-600 font-semibold">+12%</span>
            <span class="text-gray-500">vs mois dernier</span>
          </div>
        </div>
      </div>

      <!-- Pannes récentes & Techniciens actifs -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Pannes récentes -->
        <div class="bg-white rounded-xl p-6 border border-gray-200">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-gray-900">Pannes récentes</h2>
            <button class="text-sm text-blue-600 hover:text-blue-700 font-semibold">
              Voir tout
            </button>
          </div>
          <div class="space-y-3">
            <div
              v-for="i in 4"
              :key="i"
              class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertCircle :size="20" class="text-orange-600" />
              </div>
              <div class="flex-1">
                <p class="font-semibold text-gray-900">École Primaire {{ i }}</p>
                <p class="text-sm text-gray-600">Sirène ne sonne plus</p>
              </div>
              <div class="text-right">
                <span class="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full font-semibold">
                  En attente
                </span>
                <p class="text-xs text-gray-500 mt-1">Il y a {{ i }}h</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Techniciens actifs -->
        <div class="bg-white rounded-xl p-6 border border-gray-200">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-gray-900">Techniciens actifs</h2>
            <button class="text-sm text-blue-600 hover:text-blue-700 font-semibold">
              Voir tout
            </button>
          </div>
          <div class="space-y-3">
            <div
              v-for="(tech, i) in technicians"
              :key="i"
              class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                <span class="text-white font-bold text-sm">
                  {{ tech.name.split(' ').map(n => n[0]).join('') }}
                </span>
              </div>
              <div class="flex-1">
                <p class="font-semibold text-gray-900">{{ tech.name }}</p>
                <p class="text-sm text-gray-600">Technicien certifié</p>
              </div>
              <span :class="`text-xs px-2 py-1 ${tech.color} rounded-full font-semibold`">
                {{ tech.status }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { usePermissions } from '../composables/usePermissions'
import DashboardLayout from '../components/layout/DashboardLayout.vue'
import { Can } from '../components/permissions'
import {
  Building2, Bell, CheckCircle, AlertCircle, Wrench,
  CreditCard, TrendingUp
} from 'lucide-vue-next'

const authStore = useAuthStore()
const { hasPermission, isAdmin } = usePermissions()

const stats = ref({
  total_schools: 47,
  active_subscriptions: 42,
  total_sirens: 89,
  pending_breakdowns: 8,
  total_technicians: 12,
  total_payments: 4850000,
})

const statCards = computed(() => [
  {
    title: 'Écoles',
    value: stats.value.total_schools,
    icon: Building2,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    title: 'Sirènes actives',
    value: stats.value.total_sirens,
    icon: Bell,
    color: 'from-cyan-500 to-cyan-600',
    bgColor: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
  },
  {
    title: 'Abonnements actifs',
    value: stats.value.active_subscriptions,
    icon: CheckCircle,
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    title: 'Pannes en attente',
    value: stats.value.pending_breakdowns,
    icon: AlertCircle,
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
    iconColor: 'text-orange-600',
  },
  {
    title: 'Techniciens',
    value: stats.value.total_technicians,
    icon: Wrench,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
  {
    title: 'Revenus totaux',
    value: `${stats.value.total_payments.toLocaleString()} XOF`,
    icon: CreditCard,
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    isAmount: true,
  },
])

const technicians = ref([
  { name: 'Jean Ouédraogo', status: 'En intervention', color: 'bg-green-100 text-green-700' },
  { name: 'Marie Kaboré', status: 'Disponible', color: 'bg-blue-100 text-blue-700' },
  { name: 'Paul Sawadogo', status: 'En intervention', color: 'bg-green-100 text-green-700' },
  { name: 'Sophie Traoré', status: 'Disponible', color: 'bg-blue-100 text-blue-700' },
])

const currentDate = computed(() => {
  return new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})
</script>
