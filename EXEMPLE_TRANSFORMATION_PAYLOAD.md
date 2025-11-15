# Transformation de Payload Utilisateur

## Problème

Votre payload original a cette structure :

```json
{
    "role_id": "01K93VKDF6J9TEAQ762NBK722Y",
    "userInfoData": {
        "telephone": "2290153818589",
        "nom": "Excellente",
        "prenom": "Paul"
    }
}
```

Mais l'API attend ce format :

```json
{
    "nom_utilisateur": "Paul Excellente",
    "telephone": "2290153818589",
    "mot_de_passe": "mot_de_passe_requis",
    "role_id": "01K93VKDF6J9TEAQ762NBK722Y",
    "email": null
}
```

## Solution

Utilisez la fonction `transformUserPayload` :

### 1. Import

```typescript
import { transformUserPayload } from '@/utils/userPayloadTransformer'
// ou
import { transformUserPayload } from '@/utils'
```

### 2. Utilisation basique

```typescript
const payloadOriginal = {
  role_id: "01K93VKDF6J9TEAQ762NBK722Y",
  userInfoData: {
    telephone: "2290153818589",
    nom: "Excellente",
    prenom: "Paul"
  }
}

// Transformation avec mot de passe par défaut
const payloadTransforme = transformUserPayload(payloadOriginal, "MotDePasse123!")

console.log(payloadTransforme)
// Résultat:
// {
//   nom_utilisateur: "Paul Excellente",
//   telephone: "2290153818589",
//   mot_de_passe: "MotDePasse123!",
//   role_id: "01K93VKDF6J9TEAQ762NBK722Y",
//   email: null
// }
```

### 3. Utilisation avec mot de passe dans le payload

```typescript
const payloadAvecMotDePasse = {
  role_id: "01K93VKDF6J9TEAQ762NBK722Y",
  mot_de_passe: "MonMotDePasseSecurise!",
  userInfoData: {
    telephone: "2290153818589",
    nom: "Excellente",
    prenom: "Paul"
  }
}

const payloadTransforme = transformUserPayload(payloadAvecMotDePasse)

console.log(payloadTransforme)
// Résultat:
// {
//   nom_utilisateur: "Paul Excellente",
//   telephone: "2290153818589",
//   mot_de_passe: "MonMotDePasseSecurise!",
//   role_id: "01K93VKDF6J9TEAQ762NBK722Y",
//   email: null
// }
```

### 4. Utilisation stricte (avec validation)

```typescript
import { transformUserPayloadStrict } from '@/utils/userPayloadTransformer'

try {
  const payloadTransforme = transformUserPayloadStrict(payloadOriginal)
  // ❌ Lance une erreur car pas de mot de passe fourni
} catch (error) {
  console.error(error.message) // "Le mot de passe est requis pour créer un utilisateur"
}

// ✅ Avec mot de passe par défaut
const payloadOk = transformUserPayloadStrict(payloadOriginal, "Default123!")
```

### 5. Transformation par lot (batch)

```typescript
import { transformUserPayloadBatch } from '@/utils/userPayloadTransformer'

const utilisateurs = [
  {
    role_id: "01K93VKDF6J9TEAQ762NBK722Y",
    userInfoData: {
      telephone: "2290153818589",
      nom: "Excellente",
      prenom: "Paul"
    }
  },
  {
    role_id: "01K93VKDF6J9TEAQ762NBK722Y",
    userInfoData: {
      telephone: "2290153818590",
      nom: "Dupont",
      prenom: "Marie"
    }
  }
]

const utilisateursTransformes = transformUserPayloadBatch(utilisateurs, "Default123!")

console.log(utilisateursTransformes)
// Résultat: Array de 2 CreateUserRequest
```

### 6. Utilisation dans un composant Vue

```typescript
// Dans UserFormModal.vue ou tout autre composant
import { transformUserPayload } from '@/utils'
import { useUsers } from '@/composables/useUsers'

const { createUser } = useUsers()

// Payload reçu d'une API externe ou d'un formulaire
const payloadExterne = {
  role_id: "01K93VKDF6J9TEAQ762NBK722Y",
  userInfoData: {
    telephone: "2290153818589",
    nom: "Excellente",
    prenom: "Paul"
  }
}

// Transformation avant envoi
const handleCreateUser = async () => {
  try {
    const payloadAPI = transformUserPayload(payloadExterne, "TempPassword123!")
    const response = await createUser(payloadAPI)

    if (response?.success) {
      console.log('Utilisateur créé:', response.data)
    }
  } catch (error) {
    console.error('Erreur:', error)
  }
}
```

### 7. Utilisation avec TypeScript (types sécurisés)

```typescript
import { transformUserPayload, type UserPayloadWithUserInfoData } from '@/utils'
import type { CreateUserRequest } from '@/types/api'

// Type-safe payload
const payload: UserPayloadWithUserInfoData = {
  role_id: "01K93VKDF6J9TEAQ762NBK722Y",
  userInfoData: {
    telephone: "2290153818589",
    nom: "Excellente",
    prenom: "Paul"
  }
}

// Le résultat est typé comme CreateUserRequest
const result: CreateUserRequest = transformUserPayload(payload, "Pass123!")
```

## Cas d'usage

### Scénario 1 : Import de données depuis un système externe

```typescript
// Données venant d'un autre système
const donneesExternes = await fetch('/api/external-users')
const users = await donneesExternes.json()

// Transformation en masse
const usersTransformes = transformUserPayloadBatch(users, "DefaultPass2024!")

// Création des utilisateurs
for (const user of usersTransformes) {
  await createUser(user)
}
```

### Scénario 2 : Formulaire avec structure différente

```typescript
// Formulaire avec nom et prénom séparés
const formData = {
  role_id: selectedRole.value,
  userInfoData: {
    telephone: telephoneInput.value,
    nom: nomInput.value,
    prenom: prenomInput.value
  },
  mot_de_passe: passwordInput.value
}

// Transformation et envoi
const payload = transformUserPayload(formData)
await createUser(payload)
```

## Notes importantes

1. **Mot de passe** : Toujours requis pour créer un utilisateur. Fournissez-le soit :
   - Dans le payload original (`mot_de_passe`)
   - Comme paramètre par défaut dans `transformUserPayload(payload, "default")`

2. **Nom complet** : Le champ `nom_utilisateur` est créé en combinant `prenom` + `nom`

3. **Email** : Absent du payload original, sera `null` dans le résultat

4. **Téléphone** : Transféré tel quel depuis `userInfoData.telephone`

5. **role_id** : Optionnel, peut être `undefined`

## Fonctions disponibles

| Fonction | Description | Validation |
|----------|-------------|------------|
| `transformUserPayload` | Transformation basique | Non |
| `transformUserPayloadStrict` | Transformation avec validation | Oui (mot de passe requis) |
| `transformUserPayloadBatch` | Transformation en masse | Non |

## Tests manuels

Pour tester rapidement dans la console :

```typescript
// Ouvrez la console du navigateur et collez :
import { transformUserPayload } from '@/utils'

const test = transformUserPayload({
  role_id: "01K93VKDF6J9TEAQ762NBK722Y",
  userInfoData: {
    telephone: "2290153818589",
    nom: "Excellente",
    prenom: "Paul"
  }
}, "Test123!")

console.table(test)
```
