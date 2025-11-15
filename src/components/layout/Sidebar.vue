<template>
  <aside class="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
    <div class="p-6 border-b border-gray-200">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
          <Bell :size="24" class="text-white" />
        </div>
        <div>
          <h1 class="text-lg font-bold text-gray-900">Sirène d'École</h1>
          <p class="text-xs text-gray-500">Gestion centralisée</p>
        </div>
      </div>
    </div>

    <nav class="flex-1 p-4 overflow-y-auto">
      <ul class="space-y-1">
        <li v-for="item in filteredNavItems" :key="item.to">
          <router-link
            :to="item.to"
            class="flex items-center gap-3 px-4 py-3 rounded-lg transition-all"
            active-class="bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-md"
            :class="{'text-gray-700 hover:bg-gray-100': !isActiveLink(item.to)}"
          >
            <component :is="item.icon" :size="20" class="flex-shrink-0" />
            <span class="text-sm font-medium">{{ item.label }}</span>
          </router-link>
        </li>
      </ul>
    </nav>

    <div class="p-4 border-t border-gray-200">
      <div class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-100">
        <p class="text-sm font-semibold text-gray-900 mb-1">
          {{ authStore.user?.nom_utilisateur }}
        </p>
        <p class="text-xs text-gray-600 capitalize">
          {{ authStore.user?.role?.nom || authStore.user?.roleSlug?.replace('_', ' ') }}
        </p>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import {
  Bell, LayoutDashboard, Building2, Users, Wrench,
  AlertCircle, CreditCard, Calendar, Settings,
  Globe, ShieldCheck, FileText, BarChart3, Package
} from 'lucide-vue-next'

interface NavItem {
  label: string
  to: string
  icon: Component
  roles: string[]
}

const authStore = useAuthStore()
const route = useRoute()

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'user', 'ecole', 'technicien'] },
  { label: 'Pays', to: '/countries', icon: Globe, roles: ['admin'] },
  { label: 'Écoles', to: '/schools', icon: Building2, roles: ['admin'] },
  { label: 'Mon école', to: '/my-school', icon: Building2, roles: ['ecole'] },
  { label: 'Utilisateurs', to: '/users', icon: Users, roles: ['admin', 'ecole'] },
  { label: 'Rôles & Permissions', to: '/roles', icon: ShieldCheck, roles: ['admin'] },
  { label: 'Techniciens', to: '/technicians', icon: Wrench, roles: ['admin'] },
  { label: 'Mes missions', to: '/my-missions', icon: Wrench, roles: ['technicien'] },
  { label: 'Modèles de sirène', to: '/siren-models', icon: Package, roles: ['admin'] },
  { label: 'Sirènes', to: '/sirens', icon: Bell, roles: ['admin', 'user', 'ecole', 'technicien'] },
  { label: 'Pannes', to: '/breakdowns', icon: AlertCircle, roles: ['admin', 'ecole', 'technicien'] },
  { label: 'Ordres de mission', to: '/work-orders', icon: FileText, roles: ['admin', 'technicien'] },
  { label: 'Abonnements', to: '/subscriptions', icon: CreditCard, roles: ['admin', 'ecole'] },
  { label: 'Calendrier scolaire', to: '/calendar', icon: Calendar, roles: ['admin', 'ecole'] },
  { label: 'Rapports', to: '/reports', icon: BarChart3, roles: ['admin'] },
  { label: 'Paramètres', to: '/settings', icon: Settings, roles: ['admin'] },
]

const filteredNavItems = computed(() => {
  const userRole = authStore.user?.roleSlug || authStore.user?.role?.slug

  // Si pas de rôle défini, afficher les éléments de base pour debug
  if (!userRole) {
    console.warn('User role is not defined:', authStore.user)
    // Afficher au minimum le dashboard
    return navItems.filter(item =>
      ['Dashboard', 'Paramètres'].includes(item.label)
    )
  }

  // Filtrer selon le rôle
  const filtered = navItems.filter(item =>
    item.roles.includes(userRole)
  )

  console.log('User role:', userRole, '| Filtered items:', filtered.length)
  console.log('User permissions:', authStore.user?.role?.permissions?.map(p => p.slug))

  return filtered
})

const isActiveLink = (path: string) => {
  return route.path === path
}
</script>
