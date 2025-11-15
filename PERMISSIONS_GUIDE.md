# Guide d'utilisation des Permissions

Ce guide explique comment utiliser le système de permissions dans l'application.

## 📋 Table des matières

- [Composable usePermissions](#composable-usepermissions)
- [Composants Can et Cannot](#composants-can-et-cannot)
- [Exemples d'utilisation](#exemples-dutilisation)

---

## Composable usePermissions

Le composable `usePermissions` fournit des méthodes pour vérifier les permissions de l'utilisateur.

### Import

```typescript
import { usePermissions } from '@/composables/usePermissions'
```

### Méthodes disponibles

```typescript
const {
  userPermissions,      // Liste des permissions de l'utilisateur
  hasPermission,        // Vérifier une permission
  hasAnyPermission,     // Vérifier au moins une permission
  hasAllPermissions,    // Vérifier toutes les permissions
  hasRole,              // Vérifier un rôle
  hasAnyRole,           // Vérifier au moins un rôle
  isAdmin,              // Est admin ?
  isUser,               // Est utilisateur de base ?
  isEcole,              // Est école ?
  isTechnicien,         // Est technicien ?
} = usePermissions()
```

### Exemples dans un composant

```vue
<script setup lang="ts">
import { usePermissions } from '@/composables/usePermissions'

const { hasPermission, isAdmin } = usePermissions()

// Vérifier une permission
const canManageUsers = hasPermission('manage_users')

// Vérifier un rôle
if (isAdmin.value) {
  console.log('Utilisateur est admin')
}
</script>
```

---

## Composants Can et Cannot

Les composants `Can` et `Cannot` permettent d'afficher conditionnellement du contenu selon les permissions.

### Import

```vue
<script setup>
import { Can, Cannot } from '@/components/permissions'
</script>
```

### Composant Can

Affiche le contenu SI l'utilisateur a la permission/le rôle.

#### Props

- `permission`: Une permission unique (string)
- `permissions`: Plusieurs permissions (string[])
- `role`: Un rôle unique (string)
- `roles`: Plusieurs rôles (string[])
- `requireAll`: Si true, toutes les permissions doivent être présentes (booléen, défaut: false)

#### Exemples

```vue
<!-- Vérifier une permission unique -->
<Can permission="manage_users">
  <button>Gérer les utilisateurs</button>
</Can>

<!-- Vérifier plusieurs permissions (au moins une) -->
<Can :permissions="['manage_users', 'view_users']">
  <div>Section utilisateurs</div>
</Can>

<!-- Vérifier plusieurs permissions (toutes requises) -->
<Can :permissions="['manage_users', 'manage_roles']" :requireAll="true">
  <button>Administration avancée</button>
</Can>

<!-- Vérifier un rôle -->
<Can role="super_admin">
  <button>Configuration système</button>
</Can>

<!-- Vérifier plusieurs rôles -->
<Can :roles="['super_admin', 'country_admin']">
  <div>Zone admin</div>
</Can>
```

### Composant Cannot

Affiche le contenu SI l'utilisateur N'A PAS la permission/le rôle.

```vue
<!-- Afficher un message si pas de permission -->
<Cannot permission="manage_users">
  <p class="text-red-600">Vous n'avez pas accès à cette fonctionnalité</p>
</Cannot>

<!-- Afficher une version limitée -->
<Cannot role="super_admin">
  <button disabled>Fonctionnalité réservée aux admins</button>
</Cannot>
```

---

## Exemples d'utilisation

### Exemple 1: Bouton conditionnel

```vue
<template>
  <div class="flex gap-2">
    <button @click="viewDetails" class="btn-primary">
      Voir les détails
    </button>

    <Can permission="manage_users">
      <button @click="editUser" class="btn-secondary">
        Modifier
      </button>
    </Can>

    <Can permission="manage_users">
      <button @click="deleteUser" class="btn-danger">
        Supprimer
      </button>
    </Can>
  </div>
</template>

<script setup lang="ts">
import { Can } from '@/components/permissions'

const viewDetails = () => { /* ... */ }
const editUser = () => { /* ... */ }
const deleteUser = () => { /* ... */ }
</script>
```

### Exemple 2: Section entière

```vue
<template>
  <div class="dashboard">
    <!-- Visible pour tous -->
    <section class="statistics">
      <h2>Statistiques</h2>
      <!-- ... -->
    </section>

    <!-- Visible uniquement pour les admins -->
    <Can :roles="['super_admin', 'country_admin']">
      <section class="admin-panel">
        <h2>Panneau d'administration</h2>
        <!-- ... -->
      </section>
    </Can>

    <!-- Visible uniquement pour super admin -->
    <Can role="super_admin">
      <section class="system-settings">
        <h2>Paramètres système</h2>
        <!-- ... -->
      </section>
    </Can>
  </div>
</template>
```

### Exemple 3: Navigation conditionnelle

```vue
<template>
  <nav>
    <router-link to="/dashboard">Tableau de bord</router-link>

    <Can permission="view_schools">
      <router-link to="/schools">Écoles</router-link>
    </Can>

    <Can permission="view_users">
      <router-link to="/users">Utilisateurs</router-link>
    </Can>

    <Can permission="manage_settings">
      <router-link to="/settings">Paramètres</router-link>
    </Can>
  </nav>
</template>
```

### Exemple 4: Utilisation dans le script

```vue
<template>
  <div>
    <button @click="handleAction">Action</button>
  </div>
</template>

<script setup lang="ts">
import { usePermissions } from '@/composables/usePermissions'
import { useNotificationStore } from '@/stores/notifications'

const { hasPermission } = usePermissions()
const notificationStore = useNotificationStore()

const handleAction = () => {
  if (!hasPermission('manage_users')) {
    notificationStore.error('Accès refusé', 'Vous n\'avez pas la permission nécessaire')
    return
  }

  // Effectuer l'action
  console.log('Action autorisée')
}
</script>
```

### Exemple 5: Message alternatif

```vue
<template>
  <div>
    <Can permission="view_reports">
      <ReportsDashboard />
    </Can>

    <Cannot permission="view_reports">
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p class="text-yellow-800">
          ⚠️ Vous n'avez pas accès aux rapports.
          Contactez votre administrateur pour obtenir les autorisations nécessaires.
        </p>
      </div>
    </Cannot>
  </div>
</template>
```

---

## Permissions disponibles

### Super Admin
- Toutes les permissions

### Country Admin
- `view_dashboard`
- `manage_schools`, `view_schools`
- `manage_users`, `view_users`
- `manage_technicians`, `view_technicians`
- `manage_sirens`, `view_sirens`
- `manage_breakdowns`, `view_breakdowns`
- `manage_work_orders`, `view_work_orders`
- `manage_subscriptions`, `view_subscriptions`
- `manage_calendar`, `view_calendar`
- `view_reports`
- `manage_settings`
- `view_payments`

### School Admin
- `view_dashboard`
- `view_schools`, `edit_own_school`
- `view_sirens`
- `manage_breakdowns`, `view_breakdowns`
- `view_subscriptions`, `manage_subscriptions`
- `view_calendar`, `manage_calendar`
- `view_payments`

### Technician
- `view_dashboard`
- `view_work_orders`
- `manage_own_missions`
- `view_breakdowns`
- `manage_interventions`
- `view_sirens`

---

## Bonnes pratiques

1. **Utiliser les composants pour l'UI**: Préférer `<Can>` et `<Cannot>` pour afficher/cacher des éléments visuels

2. **Utiliser le composable pour la logique**: Utiliser `usePermissions()` dans les fonctions pour vérifier les permissions avant d'effectuer des actions

3. **Toujours vérifier côté backend**: Les permissions frontend sont pour l'UX. Le backend doit TOUJOURS vérifier les permissions

4. **Messages clairs**: Quand l'accès est refusé, expliquer pourquoi avec `<Cannot>`

5. **Désactiver plutôt que cacher**: Pour certains cas, mieux vaut désactiver un bouton que de le cacher complètement

```vue
<!-- Bon : L'utilisateur voit le bouton mais comprend pourquoi il est désactivé -->
<button :disabled="!hasPermission('manage_users')" :title="!hasPermission('manage_users') ? 'Permission requise: manage_users' : ''">
  Modifier
</button>
```
