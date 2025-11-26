# Plan d'Intégration API - Gestion du Profil Utilisateur (/profile)

## Vue d'ensemble

Ce document présente le plan d'intégration pour la page de gestion du profil utilisateur (`ProfileView.vue`), en suivant l'architecture en 3 couches du projet :

**Vue Component → Composable → Service → API Client**

### Architecture
```
ProfileView.vue (Handlers)
    ↓ devrait utiliser
useUsers() (Composable - État réactif + Logique)
    ↓ appelle
userService (Service - Appels API)
    ↓ utilise
apiClient (Axios avec intercepteurs)
```

### État Actuel
La page `ProfileView.vue` **appelle directement le service** au lieu d'utiliser un composable, ce qui ne suit pas l'architecture du projet.

---

## 📊 ÉTAT DES LIEUX

### ✅ Fonctionnalités EXISTANTES (2)

#### 1. Mise à jour du profil
- **Handler**: `handleSaveProfile` dans `ProfileView.vue:270`
- **Appel actuel**: ❌ Direct `userService.updateProfile()` (pas d'architecture en couches)
- **Service**: ✅ `userService.updateProfile()` existe (`userService.ts:119`)
- **Backend API**: ✅ `PUT /profile` existe
- **Composable**: ❌ Pas de méthode dans `useUsers()`

#### 2. Changement de mot de passe
- **Handler**: `handleChangePassword` dans `ProfileView.vue:304`
- **Appel actuel**: ❌ Direct `userService.changePassword()` (pas d'architecture en couches)
- **Service**: ✅ `userService.changePassword()` existe (`userService.ts:133`)
- **Backend API**: ✅ `POST /auth/changerMotDePasse` existe
- **Composable**: ❌ Pas de méthode dans `useUsers()`

### 🆕 Fonctionnalités À AJOUTER (suggérées)

1. **Upload de photo de profil**
2. **Authentification à deux facteurs (2FA)**
3. **Gestion des préférences utilisateur**
4. **Gestion des notifications**
5. **Historique de connexion**
6. **Suppression de compte**
7. **Export des données (RGPD)**
8. **Sessions actives et déconnexion à distance**

---

## 🎯 IMPORTANT : Architecture Actuelle vs Recommandée

### ❌ Implémentation ACTUELLE (Non conforme)

```typescript
// ProfileView.vue - <script setup>
import userService from '@/services/userService'

// Appel DIRECT du service dans le handler
const handleSaveProfile = async () => {
  loadingProfile.value = true
  try {
    const response = await userService.updateProfile(profileFormData.value)  // ❌ Direct

    if (response.success && response.data) {
      notificationStore.success('Profil mis à jour')
      await authStore.fetchUser()
    }
  } catch (error) {
    notificationStore.error('Erreur')
  } finally {
    loadingProfile.value = false
  }
}
```

**Problèmes** :
- ❌ Ne suit pas l'architecture en 3 couches (Vue → Composable → Service)
- ❌ Gestion manuelle du loading state dans chaque handler
- ❌ Gestion manuelle des erreurs répétée
- ❌ État non réactif et non partagé avec d'autres composants

### ✅ Implémentation RECOMMANDÉE (Conforme)

```typescript
// ProfileView.vue - <script setup>

// 1️⃣ Appel du composable AU TOP-LEVEL
const {
  loading,
  error,
  updateProfile,
  changePassword
} = useUsers()

// 2️⃣ Handler simplifié qui utilise le composable
const handleSaveProfile = async () => {
  try {
    await updateProfile(profileFormData.value)
    // Le composable gère déjà la notification de succès
    await authStore.fetchUser()
  } catch (error) {
    // Le composable gère déjà la notification d'erreur
  }
}
```

**Avantages** :
- ✅ Suit l'architecture en 3 couches
- ✅ Gestion automatique du loading state
- ✅ Gestion automatique des erreurs et notifications
- ✅ État réactif partageable entre composants
- ✅ Code plus concis et maintenable

---

## 📝 PLAN DE REFACTORISATION

### Étape 1 : Ajouter les méthodes au composable useUsers

**Fichier**: `src/composables/useUsers.ts`

```typescript
/**
 * Mettre à jour le profil de l'utilisateur connecté
 */
const updateProfile = async (profileData: UpdateProfileRequest) => {
  const result = await execute(
    () => userService.updateProfile(profileData),
    {
      errorTitle: 'Erreur de mise à jour',
      errorMessage: 'Impossible de mettre à jour le profil'
    }
  )

  if (result?.success) {
    notificationStore.success(
      'Profil mis à jour',
      'Vos informations ont été mises à jour avec succès'
    )
  }

  return result
}

/**
 * Changer le mot de passe de l'utilisateur connecté
 */
const changePassword = async (passwordData: ChangePasswordRequest) => {
  const result = await execute(
    () => userService.changePassword(passwordData),
    {
      errorTitle: 'Erreur de changement de mot de passe',
      errorMessage: 'Impossible de changer le mot de passe'
    }
  )

  if (result?.success) {
    notificationStore.success(
      'Mot de passe modifié',
      'Votre mot de passe a été modifié avec succès'
    )
  }

  return result
}

// Ajouter au return du composable
return {
  // État
  users,
  currentUser,
  totalUsers,
  currentPage,
  perPage,
  lastPage,
  loading,
  error,

  // Méthodes existantes
  loadUsers,
  loadUserById,
  createUser,
  updateUser,
  deleteUser,
  assignRole,
  removeRole,
  activateUser,
  deactivateUser,
  resetPassword,
  searchUsers,

  // 🆕 Nouvelles méthodes profil
  updateProfile,
  changePassword
}
```

### Étape 2 : Refactoriser ProfileView.vue

**Fichier**: `src/views/ProfileView.vue`

**Avant** (lignes 189-199, appels directs) :
```typescript
import { ref, computed, onMounted } from 'vue'
import DashboardLayout from '../components/layout/DashboardLayout.vue'
import { User, Shield, Calendar, Lock } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import userService from '@/services/userService'  // ❌ Import direct du service
import { useNotificationStore } from '@/stores/notifications'
import type { UpdateProfileRequest, ChangePasswordRequest } from '@/types/api'

const authStore = useAuthStore()
const notificationStore = useNotificationStore()
```

**Après** (utilisation du composable) :
```typescript
import { ref, computed, onMounted } from 'vue'
import DashboardLayout from '../components/layout/DashboardLayout.vue'
import { User, Shield, Calendar, Lock } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useUsers } from '@/composables/useUsers'  // ✅ Import du composable
import { useNotificationStore } from '@/stores/notifications'
import type { UpdateProfileRequest, ChangePasswordRequest } from '@/types/api'

const authStore = useAuthStore()
const notificationStore = useNotificationStore()

// ✅ Utilisation du composable au top-level
const {
  loading,
  error,
  updateProfile,
  changePassword
} = useUsers()
```

**Avant** (lignes 270-298, handler avec gestion manuelle) :
```typescript
const loadingProfile = ref(false)  // ❌ Loading state manuel

const handleSaveProfile = async () => {
  loadingProfile.value = true  // ❌ Gestion manuelle du loading
  try {
    const response = await userService.updateProfile(profileFormData.value)  // ❌ Appel direct

    if (response.success && response.data) {
      notificationStore.success(
        'Profil mis à jour',
        'Vos informations ont été mises à jour avec succès'
      )
      await authStore.fetchUser()
    } else {
      notificationStore.error(
        'Erreur',
        response.message || 'Impossible de mettre à jour le profil'
      )
    }
  } catch (error) {
    console.error('Failed to update profile:', error)
    notificationStore.error(
      'Erreur',
      'Une erreur est survenue lors de la mise à jour du profil'
    )
  } finally {
    loadingProfile.value = false  // ❌ Gestion manuelle du loading
  }
}
```

**Après** (handler simplifié) :
```typescript
// ❌ Supprimer : const loadingProfile = ref(false)
// ✅ Utiliser 'loading' du composable directement

const handleSaveProfile = async () => {
  try {
    const result = await updateProfile(profileFormData.value)  // ✅ Utilise le composable

    if (result?.success) {
      await authStore.fetchUser()  // Recharger les infos utilisateur
    }
  } catch (error) {
    // Les erreurs sont déjà gérées par le composable
    console.error('Failed to update profile:', error)
  }
}
```

**Avant** (lignes 304-352, handler changement mot de passe) :
```typescript
const loadingPassword = ref(false)  // ❌ Loading state manuel

const handleChangePassword = async () => {
  if (!isPasswordFormValid.value) {
    notificationStore.error(
      'Erreur de validation',
      'Veuillez remplir tous les champs correctement'
    )
    return
  }

  if (passwordData.value.nouveau_mot_de_passe !== passwordData.value.confirmation_mot_de_passe) {
    notificationStore.error(
      'Erreur',
      'Les mots de passe ne correspondent pas'
    )
    return
  }

  loadingPassword.value = true  // ❌ Gestion manuelle du loading
  try {
    const response = await userService.changePassword(passwordData.value)  // ❌ Appel direct

    if (response.success) {
      notificationStore.success(
        'Mot de passe modifié',
        'Votre mot de passe a été modifié avec succès'
      )
      // Reset password form
      passwordData.value = {
        ancien_mot_de_passe: '',
        nouveau_mot_de_passe: '',
        confirmation_mot_de_passe: '',
      }
    } else {
      notificationStore.error(
        'Erreur',
        response.message || 'Impossible de modifier le mot de passe'
      )
    }
  } catch (error) {
    console.error('Failed to change password:', error)
    notificationStore.error(
      'Erreur',
      'Une erreur est survenue lors du changement de mot de passe'
    )
  } finally {
    loadingPassword.value = false  // ❌ Gestion manuelle du loading
  }
}
```

**Après** (handler simplifié) :
```typescript
// ❌ Supprimer : const loadingPassword = ref(false)
// ✅ Utiliser 'loading' du composable directement

const handleChangePassword = async () => {
  // Validations côté client (gardées car spécifiques au formulaire)
  if (!isPasswordFormValid.value) {
    notificationStore.error(
      'Erreur de validation',
      'Veuillez remplir tous les champs correctement'
    )
    return
  }

  if (passwordData.value.nouveau_mot_de_passe !== passwordData.value.confirmation_mot_de_passe) {
    notificationStore.error(
      'Erreur',
      'Les mots de passe ne correspondent pas'
    )
    return
  }

  try {
    const result = await changePassword(passwordData.value)  // ✅ Utilise le composable

    if (result?.success) {
      // Reset password form uniquement en cas de succès
      passwordData.value = {
        ancien_mot_de_passe: '',
        nouveau_mot_de_passe: '',
        confirmation_mot_de_passe: '',
      }
    }
  } catch (error) {
    // Les erreurs sont déjà gérées par le composable
    console.error('Failed to change password:', error)
  }
}
```

**Mise à jour du template** (lignes 106, 175) :
```vue
<!-- Avant -->
<button
  type="submit"
  :disabled="loadingProfile"  <!-- ❌ -->
  class="..."
>
  <span v-if="loadingProfile" class="animate-spin">⏳</span>
  {{ loadingProfile ? 'Enregistrement...' : 'Enregistrer les modifications' }}
</button>

<!-- Après -->
<button
  type="submit"
  :disabled="loading"  <!-- ✅ Utilise loading du composable -->
  class="..."
>
  <span v-if="loading" class="animate-spin">⏳</span>
  {{ loading ? 'Enregistrement...' : 'Enregistrer les modifications' }}
</button>

<!-- Idem pour le bouton changement de mot de passe -->
<button
  type="submit"
  :disabled="loading || !isPasswordFormValid"  <!-- ✅ -->
  class="..."
>
  <span v-if="loading" class="animate-spin">⏳</span>
  {{ loading ? 'Modification...' : 'Changer le mot de passe' }}
</button>
```

---

## 🆕 NOUVELLES FONCTIONNALITÉS À IMPLÉMENTER

### 1. Upload de Photo de Profil

#### Backend API
**Endpoint**: 🆕 `POST /profile/photo`
- **Méthode**: POST (multipart/form-data)
- **Auth**: Bearer token
- **Request**: FormData avec fichier image
- **Response**:
```json
{
  "success": true,
  "message": "Photo de profil mise à jour",
  "data": {
    "photo_url": "https://cdn.example.com/users/123/photo.jpg"
  }
}
```

#### Service
**Fichier**: `src/services/userService.ts`

```typescript
/**
 * Uploader une photo de profil
 */
async uploadProfilePhoto(photo: File): Promise<ApiResponse<{ photo_url: string }>> {
  const formData = new FormData()
  formData.append('photo', photo)

  const response = await apiClient.post<ApiResponse<{ photo_url: string }>>(
    '/profile/photo',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  )
  return response.data
}

/**
 * Supprimer la photo de profil
 */
async deleteProfilePhoto(): Promise<ApiResponse> {
  const response = await apiClient.delete<ApiResponse>('/profile/photo')
  return response.data
}
```

#### Composable
**Fichier**: `src/composables/useUsers.ts`

```typescript
/**
 * Uploader une photo de profil
 */
const uploadProfilePhoto = async (photo: File) => {
  const result = await execute(
    () => userService.uploadProfilePhoto(photo),
    {
      errorTitle: 'Erreur d\'upload',
      errorMessage: 'Impossible de télécharger la photo de profil'
    }
  )

  if (result?.success) {
    notificationStore.success(
      'Photo mise à jour',
      'Votre photo de profil a été mise à jour avec succès'
    )
  }

  return result
}

/**
 * Supprimer la photo de profil
 */
const deleteProfilePhoto = async () => {
  const result = await execute(
    () => userService.deleteProfilePhoto(),
    {
      errorTitle: 'Erreur de suppression',
      errorMessage: 'Impossible de supprimer la photo de profil'
    }
  )

  if (result?.success) {
    notificationStore.success(
      'Photo supprimée',
      'Votre photo de profil a été supprimée avec succès'
    )
  }

  return result
}
```

#### Vue Component
**Fichier**: `src/views/ProfileView.vue`

```vue
<!-- Ajouter dans le template après la section profil -->
<div v-if="activeSection === 'photo'">
  <h2 class="text-xl font-bold text-gray-900 mb-6">Photo de profil</h2>

  <div class="flex flex-col items-center space-y-6">
    <!-- Aperçu de la photo -->
    <div class="relative">
      <div v-if="authUser?.photo_url" class="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500">
        <img :src="authUser.photo_url" alt="Photo de profil" class="w-full h-full object-cover">
      </div>
      <div v-else class="w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
        <span class="text-white font-bold text-4xl">
          {{ getUserInitials() }}
        </span>
      </div>

      <!-- Badge pour supprimer -->
      <button
        v-if="authUser?.photo_url"
        @click="handleDeletePhoto"
        class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
      >
        <Trash2 :size="16" />
      </button>
    </div>

    <!-- Input file caché -->
    <input
      ref="photoInput"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      class="hidden"
      @change="handlePhotoSelected"
    />

    <!-- Bouton pour choisir -->
    <button
      @click="photoInput?.click()"
      :disabled="loading"
      class="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
    >
      <Upload :size="20" />
      {{ authUser?.photo_url ? 'Changer la photo' : 'Ajouter une photo' }}
    </button>

    <p class="text-sm text-gray-600">
      Formats acceptés : JPG, PNG, WEBP. Taille max : 5 Mo
    </p>
  </div>
</div>
```

```typescript
// <script setup>
import { Upload, Trash2 } from 'lucide-vue-next'

const {
  loading,
  updateProfile,
  changePassword,
  uploadProfilePhoto,  // 🆕
  deleteProfilePhoto   // 🆕
} = useUsers()

const photoInput = ref<HTMLInputElement | null>(null)

const handlePhotoSelected = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // Validation de la taille (5 Mo max)
  if (file.size > 5 * 1024 * 1024) {
    notificationStore.error(
      'Fichier trop volumineux',
      'La taille maximale est de 5 Mo'
    )
    return
  }

  // Validation du type
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    notificationStore.error(
      'Format non supporté',
      'Veuillez choisir un fichier JPG, PNG ou WEBP'
    )
    return
  }

  try {
    const result = await uploadProfilePhoto(file)
    if (result?.success) {
      await authStore.fetchUser()  // Recharger pour avoir la nouvelle URL
    }
  } catch (error) {
    console.error('Failed to upload photo:', error)
  }

  // Reset input
  if (photoInput.value) {
    photoInput.value.value = ''
  }
}

const handleDeletePhoto = async () => {
  // Afficher confirmation
  if (!confirm('Êtes-vous sûr de vouloir supprimer votre photo de profil ?')) {
    return
  }

  try {
    const result = await deleteProfilePhoto()
    if (result?.success) {
      await authStore.fetchUser()
    }
  } catch (error) {
    console.error('Failed to delete photo:', error)
  }
}

// Ajouter dans menuItems
const menuItems = computed(() => [
  { id: 'general', label: 'Informations générales', icon: User },
  { id: 'photo', label: 'Photo de profil', icon: Upload },  // 🆕
  { id: 'security', label: 'Sécurité', icon: Lock },
])
```

---

### 2. Authentification à Deux Facteurs (2FA)

#### Backend API
**Endpoints** :
- 🆕 `POST /profile/2fa/enable` - Activer 2FA (retourne QR code)
- 🆕 `POST /profile/2fa/verify` - Vérifier code 2FA lors de l'activation
- 🆕 `POST /profile/2fa/disable` - Désactiver 2FA
- 🆕 `GET /profile/2fa/recovery-codes` - Obtenir codes de récupération

#### Service
**Fichier**: `src/services/userService.ts`

```typescript
/**
 * Activer l'authentification à deux facteurs
 */
async enable2FA(): Promise<ApiResponse<{ qr_code_url: string; secret: string }>> {
  const response = await apiClient.post<ApiResponse<{ qr_code_url: string; secret: string }>>(
    '/profile/2fa/enable'
  )
  return response.data
}

/**
 * Vérifier et confirmer l'activation 2FA
 */
async verify2FA(code: string): Promise<ApiResponse<{ recovery_codes: string[] }>> {
  const response = await apiClient.post<ApiResponse<{ recovery_codes: string[] }>>(
    '/profile/2fa/verify',
    { code }
  )
  return response.data
}

/**
 * Désactiver l'authentification à deux facteurs
 */
async disable2FA(password: string): Promise<ApiResponse> {
  const response = await apiClient.post<ApiResponse>(
    '/profile/2fa/disable',
    { password }
  )
  return response.data
}

/**
 * Régénérer les codes de récupération 2FA
 */
async regenerate2FARecoveryCodes(): Promise<ApiResponse<{ recovery_codes: string[] }>> {
  const response = await apiClient.post<ApiResponse<{ recovery_codes: string[] }>>(
    '/profile/2fa/recovery-codes'
  )
  return response.data
}
```

---

### 3. Gestion des Préférences Utilisateur

#### Backend API
**Endpoints** :
- 🆕 `GET /profile/preferences` - Obtenir les préférences
- 🆕 `PUT /profile/preferences` - Mettre à jour les préférences

**Request Body**:
```json
{
  "language": "fr",
  "timezone": "Europe/Paris",
  "theme": "light",
  "email_notifications": true,
  "sms_notifications": false,
  "notification_types": ["new_mission", "mission_update"]
}
```

#### Service & Composable
Similaire aux patterns ci-dessus.

---

### 4. Historique de Connexion

#### Backend API
**Endpoint**: 🆕 `GET /profile/login-history`

**Response**:
```json
{
  "success": true,
  "data": {
    "logins": [
      {
        "id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
        "ip_address": "192.168.1.1",
        "user_agent": "Mozilla/5.0...",
        "device": "Desktop",
        "location": "Paris, France",
        "login_at": "2025-11-26T10:30:00Z",
        "success": true
      }
    ]
  }
}
```

---

### 5. Sessions Actives et Déconnexion à Distance

#### Backend API
**Endpoints** :
- 🆕 `GET /profile/sessions` - Lister les sessions actives
- 🆕 `DELETE /profile/sessions/{sessionId}` - Déconnecter une session
- 🆕 `DELETE /profile/sessions` - Déconnecter toutes les autres sessions

---

### 6. Suppression de Compte

#### Backend API
**Endpoint**: 🆕 `DELETE /profile`

**Request Body**:
```json
{
  "password": "user_password",
  "confirmation": "DELETE"
}
```

---

### 7. Export des Données (RGPD)

#### Backend API
**Endpoint**: 🆕 `GET /profile/export`

**Response**: Fichier JSON avec toutes les données utilisateur

---

## ✅ CHECKLIST D'IMPLÉMENTATION

### Phase 1 - Refactorisation (Priorité HAUTE)
- [ ] Ajouter `updateProfile()` dans `useUsers` composable
- [ ] Ajouter `changePassword()` dans `useUsers` composable
- [ ] Refactoriser `ProfileView.vue` pour utiliser le composable
- [ ] Supprimer les `loadingProfile` et `loadingPassword` manuels
- [ ] Utiliser `loading` du composable dans le template
- [ ] Tester que tout fonctionne après refactorisation

### Phase 2 - Photo de Profil (Priorité HAUTE)
- [ ] Backend: Créer `POST /profile/photo` endpoint
- [ ] Backend: Créer `DELETE /profile/photo` endpoint
- [ ] Service: Ajouter `uploadProfilePhoto()` méthode
- [ ] Service: Ajouter `deleteProfilePhoto()` méthode
- [ ] Composable: Ajouter les méthodes correspondantes
- [ ] Vue: Ajouter section "Photo de profil" dans ProfileView
- [ ] Vue: Implémenter upload avec validation
- [ ] Tester upload et suppression

### Phase 3 - 2FA (Priorité MOYENNE)
- [ ] Backend: Endpoints 2FA (enable, verify, disable, recovery)
- [ ] Service: Méthodes 2FA
- [ ] Composable: Méthodes 2FA
- [ ] Vue: Section 2FA avec QR code
- [ ] Tester activation et désactivation 2FA

### Phase 4 - Préférences (Priorité MOYENNE)
- [ ] Backend: GET/PUT /profile/preferences
- [ ] Service: Méthodes préférences
- [ ] Composable: Méthodes préférences
- [ ] Vue: Section préférences avec formulaire
- [ ] Tester sauvegarde des préférences

### Phase 5 - Sécurité Avancée (Priorité BASSE)
- [ ] Backend: Historique de connexion
- [ ] Backend: Gestion des sessions actives
- [ ] Vue: Section "Sécurité avancée"
- [ ] Tester déconnexion à distance

### Phase 6 - RGPD (Priorité BASSE)
- [ ] Backend: Export des données
- [ ] Backend: Suppression de compte
- [ ] Vue: Section "Données et confidentialité"
- [ ] Tester export et suppression

---

## 📊 RÉSUMÉ

### État actuel
- **2 fonctionnalités** implémentées mais NON conformes à l'architecture
- Appels directs du service sans passer par un composable
- Gestion manuelle du loading state et des erreurs

### Actions immédiates
1. **Refactoriser** ProfileView.vue pour utiliser useUsers composable
2. **Ajouter** 2 méthodes manquantes dans useUsers (updateProfile, changePassword)
3. **Suivre** l'architecture Vue Component → Composable → Service → API Client

### Fonctionnalités futures suggérées
- Photo de profil
- Authentification à deux facteurs
- Préférences utilisateur
- Historique de connexion
- Sessions actives
- Export données RGPD
- Suppression de compte

---

**Document créé le**: 2025-11-26
**Version**: 1.0
**Auteur**: Claude AI
**Statut**: À valider par l'équipe
