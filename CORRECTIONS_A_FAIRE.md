# 🔧 CORRECTIONS À FAIRE - Sirène d'École

> Analyse complète du code effectuée le 2025-11-21
>
> **Note Globale:** 6.5/10
>
> **Statut Production:** ❌ Pas prêt - Nécessite corrections critiques

---

## 📋 TABLE DES MATIÈRES

1. [Problèmes Critiques (Sécurité)](#-problèmes-critiques-sécurité)
2. [Problèmes Importants (Code Quality)](#-problèmes-importants-code-quality)
3. [Problèmes Moyens (Maintenabilité)](#-problèmes-moyens-maintenabilité)
4. [Améliorations (Enhancement)](#-améliorations-enhancement)
5. [Plan d'Action](#-plan-daction)

---

## 🔴 PROBLÈMES CRITIQUES (Sécurité)

### 1. Tokens JWT en localStorage

**Fichier:** `src/services/api.ts:19-22`

**Problème:**
```typescript
const token = localStorage.getItem(AUTH_CONFIG.tokenKey)
if (token && config.headers) {
  config.headers.Authorization = `${AUTH_CONFIG.tokenPrefix} ${token}`
}
```

**Risque:** Vulnérable aux attaques XSS. Un script malveillant peut voler le token.

**Solution:**
- Migrer vers httpOnly cookies
- Configurer le backend pour envoyer les tokens en cookies sécurisés
- Utiliser SameSite=Strict
- Implémenter refresh token rotation

**Fichiers à modifier:**
- `src/services/api.ts`
- `src/stores/auth.ts`
- Backend API (configuration cookies)

---

### 2. Simulation de Paiement en Production

**Fichier:** `src/views/CheckoutView.vue:564-623`

**Problème:**
```typescript
const simulateSuccessfulPayment = async () => {
  console.log('🎭 SIMULATION: Paiement simulé')
  await cinetpayService.simulerPaiementReussi({ ... })
}
```

**Risque:** ⚠️ CRITIQUE - Permet de contourner les paiements réels

**Solution:**
```typescript
// Option 1: Supprimer complètement
// Option 2: Protéger par variable d'environnement
const simulateSuccessfulPayment = async () => {
  if (import.meta.env.MODE !== 'development') {
    throw new Error('Payment simulation not allowed in production')
  }
  // ... code simulation
}
```

**Fichiers à modifier:**
- `src/views/CheckoutView.vue`
- `src/services/cinetpayService.ts` (ligne 258-309)

---

### 3. Données Sensibles en localStorage

**Fichier:** `src/stores/auth.ts:314`

**Problème:**
```typescript
localStorage.setItem(AUTH_CONFIG.userKey, JSON.stringify(transformedUser))
```

**Risque:** Rôles, permissions et données utilisateur exposés en clair

**Solution:**
- Stocker uniquement l'ID utilisateur
- Récupérer les données depuis l'API à chaque session
- Ou chiffrer les données avant stockage

**Fichiers à modifier:**
- `src/stores/auth.ts`

---

### 4. Aucune Protection CSRF

**Problème:** Aucun token CSRF dans les requêtes POST/PUT/DELETE

**Solution:**
- Implémenter CSRF tokens
- Ajouter header `X-CSRF-Token`
- Configurer backend pour valider les tokens

**Fichiers à créer/modifier:**
- `src/services/api.ts` (intercepteur CSRF)
- Backend API

---

### 5. Logs de Débogage en Production

**Fichier:** `src/stores/auth.ts:203-214`

**Problème:**
```typescript
console.log('=== BEFORE REDIRECT ===')
console.log('user.value:', user.value)
console.log('isAuthenticated.value:', isAuthenticated.value)
// ... 12+ console.log statements
```

**Risque:** Expose des informations sensibles dans la console

**Solution:**
```typescript
// Créer un logger avec niveaux
// src/utils/logger.ts
export const logger = {
  debug: (...args: any[]) => {
    if (import.meta.env.DEV) {
      console.log(...args)
    }
  },
  error: (...args: any[]) => {
    console.error(...args)
    // Envoyer à service de monitoring
  }
}

// Utiliser:
logger.debug('=== BEFORE REDIRECT ===')
```

**Fichiers à modifier:**
- `src/stores/auth.ts`
- `src/services/*.ts` (tous les console.log)
- Créer `src/utils/logger.ts`

---

### 6. Validation des Entrées Insuffisante

**Problème:**
- Validation téléphone uniquement sur la longueur
- Email avec regex simple
- Pas de sanitization des inputs

**Solution:**
```typescript
// Créer src/utils/validation.ts
export const validatePhone = (phone: string): boolean => {
  // Validation internationale
  return /^\+?[1-9]\d{1,14}$/.test(phone)
}

export const validateEmail = (email: string): boolean => {
  // RFC 5322 compliant
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
}

export const sanitizeInput = (input: string): string => {
  return input.trim()
    .replace(/[<>]/g, '') // Basique XSS prevention
}
```

**Fichiers à créer:**
- `src/utils/validation.ts`
- Mettre à jour tous les formulaires

---

## 🟠 PROBLÈMES IMPORTANTS (Code Quality)

### 7. Aucun Test

**Problème:** ❌ Zéro fichier de test trouvé

**Impact:**
- Pas de garantie de non-régression
- Risque élevé de bugs en production
- Difficile de refactorer en confiance

**Solution:**
```bash
# Installer framework de test
npm install -D vitest @vue/test-utils jsdom
npm install -D @testing-library/vue @testing-library/user-event

# Créer vitest.config.ts
# Créer tests/__mocks__/
# Commencer par tester les fonctions critiques
```

**Tests prioritaires:**
1. `src/stores/auth.ts` - Flux d'authentification
2. `src/composables/usePermissions.ts` - Système de permissions
3. `src/utils/dateFormatter.ts` - Formatage de dates
4. `src/services/cinetpayService.ts` - Paiements
5. Composants de formulaires

**Fichiers à créer:**
```
tests/
├── unit/
│   ├── stores/auth.spec.ts
│   ├── composables/usePermissions.spec.ts
│   ├── utils/dateFormatter.spec.ts
│   └── services/cinetpayService.spec.ts
├── integration/
│   └── auth-flow.spec.ts
└── e2e/
    └── user-journey.spec.ts
```

---

### 8. Duplication de Types

**Problème:** Types définis dans plusieurs fichiers

**Exemples:**
- `ApiResponse<T>` dans `ecoleService.ts:184` ET `types/api.ts:162`
- `Ecole` dans `ecoleService.ts` ET `types/api.ts`
- `User` dans plusieurs services

**Solution:**
```typescript
// AVANT: Duplication
// src/services/ecoleService.ts
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// src/services/userService.ts
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// APRÈS: Centralisation
// src/types/api.ts - UN SEUL ENDROIT
export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
  errors?: Record<string, string[]>
}

// Tous les services importent:
import { ApiResponse } from '@/types/api'
```

**Fichiers à nettoyer:**
- `src/services/ecoleService.ts`
- `src/services/userService.ts`
- `src/services/roleService.ts`
- `src/services/abonnementService.ts`
- Tous les autres services avec types locaux

---

### 9. Services Dupliqués

**Problème:**
- `src/services/sirenService.ts`
- `src/services/sireneService.ts`

**Solution:**
1. Déterminer quel fichier est utilisé
2. Migrer tous les imports vers un seul
3. Supprimer le fichier dupliqué
4. Standardiser le nom (sireneService ou sirenService)

---

### 10. Composants Trop Grands

**Fichier:** `src/views/CalendarView.vue` - **737 lignes**

**Problème:** Trop de responsabilités dans un seul fichier

**Solution:** Décomposer en sous-composants
```
src/components/calendrier/
├── CalendarHeader.vue          (Navigation mois/année)
├── CalendarGrid.vue            (Grille des jours)
├── CalendarDay.vue             (Case jour individuelle)
├── CalendarFilters.vue         (Filtres pays/année)
├── CalendarLegend.vue          (Légende des couleurs)
└── HolidayModal.vue            (Modal édition jour férié)
```

**Fichier:** `src/views/CheckoutView.vue` - **629 lignes**

**Solution:** Décomposer en:
```
src/components/checkout/
├── CheckoutForm.vue            (Formulaire paiement)
├── PaymentSummary.vue          (Résumé commande)
├── CinetPayButton.vue          (Bouton paiement)
└── PaymentSimulator.vue        (Simulation - dev only)
```

---

### 11. Gestion d'Erreurs Inconsistante

**Problème:** Plusieurs patterns différents

**Exemples:**
```typescript
// Pattern 1: Check success
if (response.success && response.data) { ... }

// Pattern 2: Check status
if (response.status === 204) { ... }

// Pattern 3: Pas de check
const data = response.data // ⚠️ Peut être undefined
```

**Solution:** Standardiser avec un wrapper
```typescript
// src/utils/apiHelper.ts
export const handleApiResponse = <T>(
  response: AxiosResponse<ApiResponse<T>>
): T => {
  if (response.status === 204) {
    return null as T
  }

  const { success, data, message, errors } = response.data

  if (!success || !data) {
    throw new Error(message || 'Une erreur est survenue')
  }

  return data
}

// Utilisation:
try {
  const response = await apiClient.get('/users')
  const users = handleApiResponse<User[]>(response)
  // users est garanti d'être User[]
} catch (error) {
  // Gestion centralisée
}
```

**Fichiers à modifier:**
- Tous les services dans `src/services/`

---

### 12. Utilisation de `any`

**Problème:** Perte de type safety

**Exemples:**
```typescript
// src/services/calendrierService.ts:281
async getCalendrierWithHolidays(filters?: Record<string, any>)

// src/services/cinetpayService.ts:490
const checkoutData: any = { ... }
```

**Solution:**
```typescript
// AVANT
async getCalendrierWithHolidays(filters?: Record<string, any>)

// APRÈS: Typer correctement
interface CalendarFilters {
  pays_id?: string
  annee_scolaire?: string
  ecole_id?: string
}

async getCalendrierWithHolidays(filters?: CalendarFilters)

// Pour CinetPay
interface CinetPayCheckoutData {
  transaction_id: string
  amount: number
  currency: string
  customer_name: string
  customer_email: string
  // ... tous les champs
}

const checkoutData: CinetPayCheckoutData = { ... }
```

**Fichiers à modifier:**
- `src/services/calendrierService.ts`
- `src/services/cinetpayService.ts`

---

## 🟡 PROBLÈMES MOYENS (Maintenabilité)

### 13. Duplication de Code - Formatage de Dates

**Problème:** Code répété dans 5+ composants

**Solution:**
```typescript
// src/utils/dateFormatter.ts - ÉTENDRE
export const formatters = {
  // Existant
  convertDMYToYMD: (date: string): string => { ... },
  convertYMDToDMY: (date: string): string => { ... },

  // AJOUTER:
  toLocaleDateString: (dateString: string, locale = 'fr-FR'): string => {
    return new Date(dateString).toLocaleDateString(locale)
  },

  toLocaleTimeString: (dateString: string, locale = 'fr-FR'): string => {
    return new Date(dateString).toLocaleTimeString(locale)
  },

  toRelativeTime: (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Aujourd'hui"
    if (diffDays === 1) return "Hier"
    if (diffDays < 7) return `Il y a ${diffDays} jours`
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`
    return date.toLocaleDateString('fr-FR')
  }
}
```

**Composants à nettoyer:**
- `src/views/UsersView.vue`
- `src/views/SirensView.vue`
- `src/views/SchoolsView.vue`
- `src/views/CheckoutView.vue`
- `src/views/CalendarView.vue`

---

### 14. Duplication de Code - Couleurs de Statut

**Problème:** Mapping couleurs répété dans plusieurs composants

**Solution:**
```typescript
// src/utils/statusColors.ts
export const SIREN_STATUS_COLORS: Record<string, string> = {
  en_stock: 'bg-blue-100 text-blue-700 border-blue-300',
  reserve: 'bg-purple-100 text-purple-700 border-purple-300',
  installe: 'bg-green-100 text-green-700 border-green-300',
  en_panne: 'bg-red-100 text-red-700 border-red-300',
  hors_service: 'bg-gray-100 text-gray-700 border-gray-300'
}

export const SIREN_STATUS_LABELS: Record<string, string> = {
  en_stock: 'En stock',
  reserve: 'Réservé',
  installe: 'Installé',
  en_panne: 'En panne',
  hors_service: 'Hors service'
}

export const SUBSCRIPTION_STATUS_COLORS: Record<string, string> = {
  en_attente: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  actif: 'bg-green-100 text-green-700 border-green-300',
  suspendu: 'bg-orange-100 text-orange-700 border-orange-300',
  annule: 'bg-red-100 text-red-700 border-red-300'
}

// Composant réutilisable
// src/components/common/StatusBadge.vue
<template>
  <span :class="['px-3 py-1 rounded-full text-sm font-medium border', colorClass]">
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  status: string
  type: 'siren' | 'subscription' | 'user'
}

const props = defineProps<Props>()

const colorClass = computed(() => {
  if (props.type === 'siren') return SIREN_STATUS_COLORS[props.status]
  if (props.type === 'subscription') return SUBSCRIPTION_STATUS_COLORS[props.status]
  return ''
})

const label = computed(() => {
  if (props.type === 'siren') return SIREN_STATUS_LABELS[props.status]
  return props.status
})
</script>
```

**Fichiers à nettoyer:**
- `src/views/SirensView.vue`
- `src/views/CheckoutView.vue`
- `src/views/SubscriptionsView.vue`

---

### 15. Données Mock Hardcodées

**Fichier:** `src/views/SchoolsView.vue:207-219`

**Problème:**
```typescript
schools.value = [
  {
    id: '1',
    name: 'École Primaire Wemtenga',
    // ... données hardcodées
  }
]
```

**Solution:**
```typescript
// Option 1: Supprimer complètement (préféré)
} catch (error: any) {
  console.error('Failed to load schools:', error)
  notificationStore.error('Erreur', 'Impossible de charger les écoles')
  schools.value = [] // Tableau vide
}

// Option 2: Guard avec variable d'environnement
} catch (error: any) {
  console.error('Failed to load schools:', error)
  notificationStore.error('Erreur', 'Impossible de charger les écoles')

  if (import.meta.env.DEV) {
    schools.value = getMockSchools()
  } else {
    schools.value = []
  }
}
```

**Fichiers à nettoyer:**
- `src/views/SchoolsView.vue`
- Vérifier autres vues pour données mock

---

### 16. Pas de Cache API

**Problème:**
- Mêmes données rechargées à chaque navigation
- Requêtes dupliquées possibles
- Pas d'invalidation de cache

**Solution:**
```typescript
// src/composables/useCache.ts
import { ref, Ref } from 'vue'

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresIn: number
}

class ApiCache {
  private cache = new Map<string, CacheEntry<any>>()

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const now = Date.now()
    if (now - entry.timestamp > entry.expiresIn) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  set<T>(key: string, data: T, expiresIn = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn
    })
  }

  invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }

  clear(): void {
    this.cache.clear()
  }
}

export const apiCache = new ApiCache()

// Utilisation dans services
export const roleService = {
  async getAllRoles(): Promise<ApiResponse<Role[]>> {
    const cacheKey = 'roles:all'
    const cached = apiCache.get<Role[]>(cacheKey)

    if (cached) {
      return { success: true, data: cached }
    }

    const response = await apiClient.get('/roles')
    const roles = response.data.data

    apiCache.set(cacheKey, roles, 10 * 60 * 1000) // 10 min

    return { success: true, data: roles }
  }
}
```

**Services à modifier:**
- `src/services/roleService.ts`
- `src/services/paysService.ts`
- `src/services/cityService.ts`
- Tous les services avec données "statiques"

---

### 17. Pas de Loading States Partout

**Problème:** Certaines vues n'affichent pas d'indicateur de chargement

**Solution:** Créer un composant réutilisable
```vue
<!-- src/components/common/LoadingSpinner.vue -->
<template>
  <div v-if="loading" class="flex items-center justify-center" :class="containerClass">
    <div class="relative">
      <div
        class="animate-spin rounded-full border-4 border-gray-200"
        :class="spinnerClass"
        :style="{ borderTopColor: color }"
      ></div>
      <span v-if="message" class="mt-4 text-sm text-gray-600">{{ message }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  loading: boolean
  size?: 'sm' | 'md' | 'lg'
  message?: string
  color?: string
  containerClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: '#3B82F6',
  containerClass: 'h-96'
})

const spinnerClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'h-8 w-8'
    case 'lg': return 'h-16 w-16'
    default: return 'h-12 w-12'
  }
})
</script>
```

**Vues à mettre à jour:**
- Toutes les vues sans loading state

---

### 18. Pas de Pagination Propre

**Fichier:** `src/services/roleService.ts:75`

**Problème:**
```typescript
params: { per_page: 1000 } // Hack pour "tout" charger
```

**Solution:**
```typescript
// Option 1: Vraie pagination
async getRoles(page = 1, perPage = 20): Promise<PaginatedResponse<Role>> {
  const response = await apiClient.get('/roles', {
    params: { page, per_page: perPage }
  })
  return response.data
}

// Option 2: Endpoint "all" dédié
async getAllRoles(): Promise<ApiResponse<Role[]>> {
  const response = await apiClient.get('/roles/all')
  return response.data
}
```

**Services à corriger:**
- `src/services/roleService.ts`
- Vérifier autres services

---

### 19. Auth Store Trop Complexe

**Fichier:** `src/stores/auth.ts` - **400 lignes**

**Problème:** Trop de responsabilités

**Solution:** Décomposer en modules
```typescript
// src/stores/auth/index.ts - Store principal
// src/stores/auth/userTransformer.ts - Transformation user
// src/stores/auth/tokenManager.ts - Gestion tokens
// src/stores/auth/navigationGuard.ts - Logique navigation
```

---

### 20. Pas d'AbortController

**Problème:** Requêtes non annulées lors du démontage de composants

**Solution:**
```typescript
// src/composables/useAbortable.ts
import { onUnmounted } from 'vue'

export const useAbortable = () => {
  const controllers = new Set<AbortController>()

  const createAbortSignal = (): AbortSignal => {
    const controller = new AbortController()
    controllers.add(controller)
    return controller.signal
  }

  const abortAll = () => {
    controllers.forEach(controller => controller.abort())
    controllers.clear()
  }

  onUnmounted(() => {
    abortAll()
  })

  return { createAbortSignal, abortAll }
}

// Utilisation:
const { createAbortSignal } = useAbortable()

const loadData = async () => {
  const signal = createAbortSignal()
  const response = await apiClient.get('/users', { signal })
  // ...
}
```

---

## 🟢 AMÉLIORATIONS (Enhancement)

### 21. Ajouter ESLint + Prettier

**Solution:**
```bash
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D eslint-plugin-vue
npm install -D prettier eslint-config-prettier eslint-plugin-prettier
```

**Créer `.eslintrc.cjs`:**
```javascript
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/vue3-recommended',
    'prettier'
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'vue/multi-word-component-names': 'off'
  }
}
```

**Créer `.prettierrc`:**
```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "none",
  "printWidth": 100,
  "tabWidth": 2
}
```

---

### 22. Virtual Scrolling

**Problème:** Listes longues (1000+ items) peuvent ralentir

**Solution:**
```bash
npm install vue-virtual-scroller
```

```vue
<!-- Exemple UsersView.vue -->
<template>
  <RecycleScroller
    :items="users"
    :item-size="80"
    key-field="id"
    v-slot="{ item }"
  >
    <UserCard :user="item" />
  </RecycleScroller>
</template>
```

---

### 23. Bundle Analysis

**Solution:**
```bash
npm install -D rollup-plugin-visualizer

# vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    vue(),
    visualizer({ open: true })
  ]
})
```

---

### 24. Améliorer Accessibilité

**À implémenter:**

1. **Skip to content link:**
```vue
<template>
  <a href="#main-content" class="sr-only focus:not-sr-only">
    Aller au contenu principal
  </a>
</template>
```

2. **Focus trap dans modals:**
```typescript
// src/composables/useFocusTrap.ts
import { onMounted, onUnmounted } from 'vue'

export const useFocusTrap = (elementRef: Ref<HTMLElement | null>) => {
  // Implémenter focus trap
}
```

3. **Reduced motion:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

### 25. Feature Flags

**Solution:**
```typescript
// src/config/features.ts
export const features = {
  paymentSimulation: import.meta.env.DEV,
  analytics: import.meta.env.PROD,
  betaFeatures: import.meta.env.VITE_BETA_FEATURES === 'true',
  mockData: import.meta.env.DEV
}

// Utilisation:
import { features } from '@/config/features'

if (features.paymentSimulation) {
  // Afficher bouton simulation
}
```

---

### 26. Monitoring & Analytics

**Solution:**
```typescript
// src/services/monitoring.ts
import * as Sentry from '@sentry/vue'

export const initMonitoring = (app: App) => {
  if (import.meta.env.PROD) {
    Sentry.init({
      app,
      dsn: import.meta.env.VITE_SENTRY_DSN,
      tracesSampleRate: 1.0
    })
  }
}

// src/services/analytics.ts
export const trackEvent = (event: string, data?: Record<string, any>) => {
  if (import.meta.env.PROD) {
    // Google Analytics, Mixpanel, etc.
  }
}
```

---

### 27. Retry Logic

**Solution:**
```typescript
// src/utils/retry.ts
export const retryRequest = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
    }
  }
  throw new Error('Max retries reached')
}

// Utilisation dans services:
const response = await retryRequest(() =>
  apiClient.get('/users')
)
```

---

### 28. Offline Support

**Solution:**
```typescript
// src/composables/useOffline.ts
import { ref, onMounted, onUnmounted } from 'vue'

export const useOffline = () => {
  const isOffline = ref(!navigator.onLine)

  const handleOnline = () => isOffline.value = false
  const handleOffline = () => isOffline.value = true

  onMounted(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
  })

  onUnmounted(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  })

  return { isOffline }
}
```

---

### 29. Debounce sur Recherches

**Solution:**
```typescript
// src/utils/debounce.ts
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

// Utilisation:
const debouncedSearch = debounce((query: string) => {
  searchUsers(query)
}, 300)
```

---

### 30. Variables d'Environnement Documentées

**Créer `.env.example`:**
```bash
# API Configuration
VITE_API_URL=http://localhost:8000/api
VITE_API_TIMEOUT=30000

# CinetPay
VITE_CINETPAY_API_KEY=your_api_key_here
VITE_CINETPAY_SITE_ID=your_site_id_here

# Features
VITE_BETA_FEATURES=false
VITE_ENABLE_MOCK_DATA=false

# Monitoring (Production only)
VITE_SENTRY_DSN=
VITE_GA_TRACKING_ID=

# Environment
NODE_ENV=development
```

---

## 📊 PLAN D'ACTION

### Phase 1: SÉCURITÉ (Semaine 1-2) - URGENT

**Priorité Critique:**
- [ ] Supprimer/protéger simulation de paiement
- [ ] Implémenter logger avec niveaux
- [ ] Remplacer tous les `console.log` par logger
- [ ] Ajouter validation inputs robuste
- [ ] Créer `.env.example`

**Priorité Haute:**
- [ ] Migrer tokens vers httpOnly cookies
- [ ] Implémenter protection CSRF
- [ ] Chiffrer données sensibles localStorage

**Livrable:** Application sécurisée pour production

---

### Phase 2: QUALITÉ (Semaine 3-4)

**Tests:**
- [ ] Installer Vitest + Testing Library
- [ ] Tests unitaires auth store
- [ ] Tests unitaires usePermissions
- [ ] Tests unitaires dateFormatter
- [ ] Tests unitaires services critiques
- [ ] Tests E2E flux principaux

**Code Quality:**
- [ ] Consolider types dans `/src/types`
- [ ] Supprimer duplication services sirène
- [ ] Standardiser gestion d'erreurs
- [ ] Remplacer tous les `any` par types explicites

**Livrable:** 70%+ couverture de tests

---

### Phase 3: MAINTENABILITÉ (Semaine 5-6)

**Refactoring:**
- [ ] Décomposer CalendarView.vue
- [ ] Décomposer CheckoutView.vue
- [ ] Créer utilitaires formatage dates
- [ ] Créer composant StatusBadge
- [ ] Supprimer données mock
- [ ] Implémenter cache API

**Tooling:**
- [ ] Configurer ESLint + Prettier
- [ ] Ajouter pre-commit hooks
- [ ] Configurer bundle analysis

**Livrable:** Code maintenable et scalable

---

### Phase 4: AMÉLIORATIONS (Semaine 7-8)

**Performance:**
- [ ] Virtual scrolling listes longues
- [ ] Code splitting par route
- [ ] Optimiser bundle size

**UX:**
- [ ] Loading states partout
- [ ] Retry logic requêtes
- [ ] Offline detection
- [ ] Debounce recherches

**Monitoring:**
- [ ] Intégrer Sentry
- [ ] Configurer analytics
- [ ] Dashboard métriques

**Livrable:** Application performante et monitored

---

## 📈 MÉTRIQUES DE SUCCÈS

### Avant Corrections:
- ❌ Tests: 0%
- ⚠️ Type Safety: ~70% (usage de `any`)
- ⚠️ Sécurité: Vulnérabilités critiques
- ⚠️ Performance: Non optimisé
- ⚠️ Maintenabilité: Code dupliqué

### Après Corrections:
- ✅ Tests: 70%+
- ✅ Type Safety: 95%+
- ✅ Sécurité: Aucune vulnérabilité critique
- ✅ Performance: Bundle < 500KB, FCP < 2s
- ✅ Maintenabilité: DRY, SOLID principles

---

## 🎯 ESTIMATION

**Temps Total:** 6-8 semaines (1 développeur)

**Phase 1 (Sécurité):** 2 semaines - CRITIQUE
**Phase 2 (Qualité):** 2 semaines - IMPORTANT
**Phase 3 (Maintenabilité):** 2 semaines - MOYEN
**Phase 4 (Améliorations):** 2 semaines - BONUS

---

## 📝 NOTES

- Commencer par Phase 1 (sécurité) avant toute mise en production
- Tests doivent être écrits en parallèle de chaque correction
- Faire des PRs petites et incrémentales
- Code review obligatoire pour chaque changement de sécurité
- Documentation à mettre à jour au fur et à mesure

---

**Document créé le:** 2025-11-21
**Dernière mise à jour:** 2025-11-21
**Version:** 1.0
