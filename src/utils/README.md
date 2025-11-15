# Transformation de Payload Utilisateur

## Utilisation

### Votre payload original

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

### Import et transformation

```typescript
import { transformUserPayload } from '@/utils'

const payload = {
  role_id: "01K93VKDF6J9TEAQ762NBK722Y",
  userInfoData: {
    telephone: "2290153818589",
    nom: "Excellente",
    prenom: "Paul"
  }
}

const transformed = transformUserPayload(payload)
```

### Résultat

```json
{
    "nom_utilisateur": "Paul Excellente",
    "telephone": "2290153818589",
    "role_id": "01K93VKDF6J9TEAQ762NBK722Y"
}
```

## Transformation par lot

```typescript
import { transformUserPayloadBatch } from '@/utils'

const users = [
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

const transformed = transformUserPayloadBatch(users)
```

## Types TypeScript

```typescript
// Type du payload original
interface UserPayloadWithUserInfoData {
  role_id?: string
  userInfoData: {
    telephone: string
    nom: string
    prenom: string
  }
}

// Type du payload transformé
interface TransformedUserPayload {
  nom_utilisateur: string
  telephone: string | null
  role_id?: string
  email?: string | null
}
```
