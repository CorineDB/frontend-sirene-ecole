# UserCard Component

Composant card pour afficher les informations d'un utilisateur de manière élégante.

## Utilisation

### Import

```vue
<script setup lang="ts">
import UserCard from '@/components/users/UserCard.vue'
import type { ApiUserData } from '@/types/api'

const user: ApiUserData = {
  id: "01K9463HGMKWTQ7FQ3HRDKE8T1",
  nom_utilisateur: "admin-user",
  identifiant: "2290162004867",
  type: "ADMIN",
  role_id: "01K9461SJ0Z6B7MM2TJYC8P388",
  actif: true,
  statut: 1,
  created_at: "2025-11-03T06:22:38.000000Z",
  role: {
    id: "01K9461SJ0Z6B7MM2TJYC8P388",
    nom: "Admin",
    slug: "admin"
  },
  user_info: {
    id: "01K9463HGWJ74VWN9S2425VPNF",
    user_id: "01K9463HGMKWTQ7FQ3HRDKE8T1",
    nom: "User",
    prenom: "Admin",
    telephone: "2290162004867",
    email: "admin@example.com",
    ville_id: null,
    adresse: null
  }
}
</script>

<template>
  <UserCard :user="user" />
</template>
```

### Avec actions personnalisées

```vue
<template>
  <UserCard :user="user" :show-actions="true">
    <template #actions>
      <button class="btn btn-primary" @click="editUser">
        Modifier
      </button>
      <button class="btn btn-danger" @click="deleteUser">
        Supprimer
      </button>
    </template>
  </UserCard>
</template>
```

### Dans une grille d'utilisateurs

```vue
<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <UserCard
      v-for="user in users"
      :key="user.id"
      :user="user"
      :show-actions="true"
    >
      <template #actions>
        <button @click="viewUser(user.id)">Voir</button>
        <button @click="editUser(user.id)">Modifier</button>
      </template>
    </UserCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import UserCard from '@/components/users/UserCard.vue'
import { useUsers } from '@/composables/useUsers'

const { users, loadUsers } = useUsers()

loadUsers()
</script>
```

## Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `user` | `ApiUserData` | **requis** | Objet utilisateur à afficher |
| `showActions` | `boolean` | `false` | Afficher le footer d'actions |

## Slots

| Slot | Description |
|------|-------------|
| `actions` | Contenu personnalisé pour les actions (boutons, etc.) |

## Informations affichées

### Toujours affichées
- **Nom complet** : `user_info.prenom` + `user_info.nom` (ou `nom_utilisateur` si user_info absent)
- **Initiales** : Avatar avec les initiales de l'utilisateur
- **Rôle** : Badge avec le nom du rôle
- **Type** : Badge avec le type d'utilisateur (ADMIN, USER, ECOLE, TECHNICIEN)
- **Statut actif/inactif** : Badge vert (actif) ou rouge (inactif)

### Conditionnelles (si disponibles)
- **Email** : `user_info.email`
- **Téléphone** : `user_info.telephone`
- **Identifiant** : `identifiant`
- **Adresse** : `user_info.adresse`
- **Ville** : `user_info.ville.nom` avec code postal
- **Pays** : `user_info.ville.pays.nom` avec code ISO (si la ville a un pays associé)
- **Date de création** : `created_at` (formatée en français)
- **Avertissement** : Si `doit_changer_mot_de_passe` est vrai

## Personnalisation des couleurs

Les types d'utilisateurs ont des couleurs prédéfinies :

| Type | Couleur du badge |
|------|------------------|
| ADMIN | Rouge (`bg-red-100 text-red-700`) |
| USER | Bleu (`bg-blue-100 text-blue-700`) |
| ECOLE | Vert (`bg-green-100 text-green-700`) |
| TECHNICIEN | Orange (`bg-orange-100 text-orange-700`) |

## Exemple complet avec événements

```vue
<template>
  <div class="container mx-auto p-6">
    <h1 class="text-3xl font-bold mb-8">Liste des utilisateurs</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UserCard
        v-for="user in users"
        :key="user.id"
        :user="user"
        :show-actions="true"
      >
        <template #actions>
          <button
            @click="handleEdit(user)"
            class="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
          >
            Modifier
          </button>
          <button
            @click="handleDelete(user)"
            class="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
          >
            Supprimer
          </button>
        </template>
      </UserCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import UserCard from '@/components/users/UserCard.vue'
import { useUsers } from '@/composables/useUsers'
import type { ApiUserData } from '@/types/api'

const { users, loadUsers, deleteUser } = useUsers()

onMounted(async () => {
  await loadUsers()
})

const handleEdit = (user: ApiUserData) => {
  console.log('Modifier:', user.id)
  // Ouvrir modal d'édition
}

const handleDelete = async (user: ApiUserData) => {
  if (confirm(`Voulez-vous vraiment supprimer ${user.nom_utilisateur} ?`)) {
    await deleteUser(user.id)
  }
}
</script>
```

## Structure de données attendue

```typescript
interface ApiPays {
  id: string
  nom: string
  code_iso: string
  indicatif_tel: string
  devise: string
  fuseau_horaire: string
  actif: boolean
}

interface ApiVille {
  id: string
  pays_id: string
  nom: string
  code: string
  latitude: number | null
  longitude: number | null
  actif: boolean
  pays?: ApiPays
}

interface ApiUserData {
  id: string
  nom_utilisateur: string
  identifiant: string
  type: 'ADMIN' | 'USER' | 'ECOLE' | 'TECHNICIEN'
  actif: boolean
  statut: number
  role?: {
    id: string
    nom: string
    slug: string
  }
  user_info?: {
    id: string
    user_id: string
    nom: string
    prenom: string
    telephone: string
    email: string | null
    ville_id: string | null
    adresse: string | null
    ville?: ApiVille | null
  }
  doit_changer_mot_de_passe?: boolean
  created_at?: string
  updated_at?: string
}
```

## Accessibilité

Le composant est conçu avec l'accessibilité en tête :
- Contraste des couleurs conforme WCAG
- Icônes SVG avec attributs sémantiques
- Structure HTML sémantique

## Responsive

Le composant s'adapte automatiquement :
- Mobile : Pleine largeur
- Tablette : 2 colonnes avec `md:grid-cols-2`
- Desktop : 3 colonnes avec `lg:grid-cols-3`
