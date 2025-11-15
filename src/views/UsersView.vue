<template>
  <DashboardLayout>
    <div class="p-6 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Utilisateurs</h1>
          <p class="text-gray-600 mt-1">Gérer les comptes utilisateurs</p>
        </div>
        <button
          @click="openCreateModal"
          class="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all"
        >
          <Plus :size="20" />
          Nouvel utilisateur
        </button>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="bg-white rounded-xl p-6 border border-gray-200"
        >
          <p class="text-sm text-gray-600 mb-2">{{ stat.label }}</p>
          <p class="text-3xl font-bold text-gray-900">{{ stat.count }}</p>
          <div :class="`mt-3 h-1 rounded-full bg-gradient-to-r ${stat.color}`"></div>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1 relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              v-model="searchTerm"
              @input="handleSearch"
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            v-model="filterType"
            @change="handleFilterChange"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tous les types</option>
            <option value="ADMIN">Administrateur</option>
            <option value="USER">Utilisateur</option>
            <option value="ECOLE">École</option>
            <option value="TECHNICIEN">Technicien</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div class="animate-spin text-4xl mb-4">⏳</div>
        <p class="text-gray-600">Chargement des utilisateurs...</p>
      </div>

      <!-- Users Table -->
      <div v-else-if="users.length > 0" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Utilisateur</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rôle</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date création</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="user in users"
              :key="user.id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
                    <span class="text-white font-bold text-sm">
                      {{ getUserInitials(user.nom_utilisateur) }}
                    </span>
                  </div>
                  <div>
                    <p class="font-semibold text-gray-900">{{ user.nom_utilisateur }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <p v-if="user.email" class="text-sm text-gray-900">{{ user.email }}</p>
                <p v-if="user.telephone" class="text-sm text-gray-600">{{ user.telephone }}</p>
              </td>
              <td class="px-6 py-4">
                <span :class="`inline-block px-3 py-1 rounded-full text-xs font-semibold ${typeColors[user.type]}`">
                  {{ typeLabels[user.type] }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span v-if="user.role" class="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                  {{ user.role.nom }}
                </span>
                <span v-else class="text-sm text-gray-400">Aucun rôle</span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ formatDate(user.created_at) }}
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="openRolesModal(user)"
                    class="text-sm text-purple-600 hover:text-purple-700 font-semibold"
                    title="Gérer le rôle"
                  >
                    Rôle
                  </button>
                  <button
                    @click="openEditModal(user)"
                    class="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                    title="Modifier"
                  >
                    Modifier
                  </button>
                  <button
                    @click="handleDeleteUser(user)"
                    class="text-sm text-red-600 hover:text-red-700 font-semibold"
                    title="Supprimer"
                  >
                    Supprimer
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div v-if="lastPage > 1" class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p class="text-sm text-gray-600">
            Page {{ currentPage }} sur {{ lastPage }} - Total: {{ totalUsers }} utilisateurs
          </p>
          <div class="flex gap-2">
            <button
              @click="handlePageChange(currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-3 py-1 border border-gray-300 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Précédent
            </button>
            <button
              @click="handlePageChange(currentPage + 1)"
              :disabled="currentPage === lastPage"
              class="px-3 py-1 border border-gray-300 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white rounded-xl p-12 text-center border border-gray-200">
        <Users :size="64" class="text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
        <p class="text-gray-600">{{ searchTerm ? 'Aucun utilisateur ne correspond à vos critères' : 'Commencez par créer un utilisateur' }}</p>
      </div>
    </div>

    <!-- Modals -->
    <UserFormModal
      :is-open="isFormModalOpen"
      :user="selectedUser"
      @close="closeFormModal"
      @created="handleUserCreated"
      @updated="handleUserUpdated"
    />

    <UserRolesModal
      :is-open="isRolesModalOpen"
      :user="selectedUser"
      @close="closeRolesModal"
      @updated="handleUserUpdated"
    />
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import DashboardLayout from '../components/layout/DashboardLayout.vue'
import { Users, Plus, Search } from 'lucide-vue-next'
import { useUsers } from '@/composables/useUsers'
import UserFormModal from '@/components/users/UserFormModal.vue'
import UserRolesModal from '@/components/users/UserRolesModal.vue'
import type { ApiUserData } from '@/types/api'

const {
  users,
  totalUsers,
  currentPage,
  lastPage,
  loading,
  loadUsers,
  deleteUser,
} = useUsers()

const searchTerm = ref('')
const filterType = ref('')
const isFormModalOpen = ref(false)
const isRolesModalOpen = ref(false)
const selectedUser = ref<ApiUserData | null>(null)

const typeColors: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700',
  USER: 'bg-blue-100 text-blue-700',
  ECOLE: 'bg-green-100 text-green-700',
  TECHNICIEN: 'bg-orange-100 text-orange-700',
}

const typeLabels: Record<string, string> = {
  ADMIN: 'Administrateur',
  USER: 'Utilisateur',
  ECOLE: 'École',
  TECHNICIEN: 'Technicien',
}

const stats = computed(() => {
  const usersByType = (users.value || []).reduce((acc, user) => {
    acc[user.type] = (acc[user.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return [
    { label: 'Total', count: totalUsers.value, color: 'from-blue-500 to-blue-600' },
    { label: 'Admins', count: usersByType['ADMIN'] || 0, color: 'from-red-500 to-red-600' },
    { label: 'Écoles', count: usersByType['ECOLE'] || 0, color: 'from-green-500 to-green-600' },
    { label: 'Techniciens', count: usersByType['TECHNICIEN'] || 0, color: 'from-orange-500 to-orange-600' },
  ]
})

const getUserInitials = (fullName: string) => {
  return fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const handleSearch = () => {
  loadUsers({
    page: 1,
    search: searchTerm.value,
    type: filterType.value || undefined,
  })
}

const handleFilterChange = () => {
  loadUsers({
    page: 1,
    search: searchTerm.value || undefined,
    type: filterType.value || undefined,
  })
}

const handlePageChange = (page: number) => {
  loadUsers({
    page,
    search: searchTerm.value || undefined,
    type: filterType.value || undefined,
  })
}

const openCreateModal = () => {
  selectedUser.value = null
  isFormModalOpen.value = true
}

const openEditModal = (user: ApiUserData) => {
  selectedUser.value = user
  isFormModalOpen.value = true
}

const openRolesModal = (user: ApiUserData) => {
  selectedUser.value = user
  isRolesModalOpen.value = true
}

const closeFormModal = () => {
  isFormModalOpen.value = false
  selectedUser.value = null
}

const closeRolesModal = () => {
  isRolesModalOpen.value = false
  selectedUser.value = null
}

const handleUserCreated = () => {
  loadUsers({
    page: currentPage.value,
    search: searchTerm.value || undefined,
    type: filterType.value || undefined,
  })
}

const handleUserUpdated = () => {
  loadUsers({
    page: currentPage.value,
    search: searchTerm.value || undefined,
    type: filterType.value || undefined,
  })
}

const handleDeleteUser = async (user: ApiUserData) => {
  const confirmDelete = confirm(
    `Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.nom_utilisateur}" ?\n\nCette action est irréversible.`
  )

  if (!confirmDelete) return

  await deleteUser(user.id)
}

// Load users on component mount
onMounted(() => {
  loadUsers()
})
</script>
