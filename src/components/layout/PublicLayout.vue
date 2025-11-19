<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Public Simple -->
    <header class="bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <Bell :size="32" class="text-blue-600" />
          <h1 class="text-xl font-bold text-gray-900">Sirène d'École</h1>
        </div>
        <a
          href="/login"
          class="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Se connecter
        </a>
      </div>
    </header>

    <!-- Contenu -->
    <main>
      <slot />
    </main>

    <!-- Footer Simple -->
    <footer class="bg-white border-t border-gray-200 mt-12">
      <div class="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-600">
        © 2025 Sirène d'École - Paiement sécurisé
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { Bell } from 'lucide-vue-next'
</script>
