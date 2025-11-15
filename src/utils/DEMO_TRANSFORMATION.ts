/**
 * DÉMONSTRATION DE LA TRANSFORMATION DE PAYLOAD
 *
 * Ce fichier montre comment transformer votre payload original
 * vers le format attendu par l'API
 */

import { transformUserPayload, type UserPayloadWithUserInfoData } from './userPayloadTransformer'
import type { CreateUserRequest } from '@/types/api'

// ============================================================
// VOTRE PAYLOAD ORIGINAL
// ============================================================
const payloadOriginal: UserPayloadWithUserInfoData = {
  role_id: "01K93VKDF6J9TEAQ762NBK722Y",
  userInfoData: {
    telephone: "2290153818589",
    nom: "Excellente",
    prenom: "Paul"
  }
}

// ============================================================
// TRANSFORMATION
// ============================================================

// Option 1 : Avec mot de passe par défaut
const payloadTransforme: CreateUserRequest = transformUserPayload(
  payloadOriginal,
  "MotDePasseParDefaut123!"
)

console.log("========================================")
console.log("PAYLOAD ORIGINAL:")
console.log("========================================")
console.log(JSON.stringify(payloadOriginal, null, 2))

console.log("\n========================================")
console.log("PAYLOAD TRANSFORMÉ:")
console.log("========================================")
console.log(JSON.stringify(payloadTransforme, null, 2))

/*
RÉSULTAT ATTENDU :

========================================
PAYLOAD ORIGINAL:
========================================
{
  "role_id": "01K93VKDF6J9TEAQ762NBK722Y",
  "userInfoData": {
    "telephone": "2290153818589",
    "nom": "Excellente",
    "prenom": "Paul"
  }
}

========================================
PAYLOAD TRANSFORMÉ:
========================================
{
  "nom_utilisateur": "Paul Excellente",
  "telephone": "2290153818589",
  "mot_de_passe": "MotDePasseParDefaut123!",
  "role_id": "01K93VKDF6J9TEAQ762NBK722Y",
  "email": null
}
*/

// ============================================================
// UTILISATION AVEC L'API
// ============================================================

/**
 * Exemple d'utilisation dans un composant
 */
export async function exempleDUtilisation() {
  // Import du service
  // import { useUsers } from '@/composables/useUsers'
  // const { createUser } = useUsers()

  // 1. Recevoir le payload (depuis un formulaire, API externe, etc.)
  const payload = {
    role_id: "01K93VKDF6J9TEAQ762NBK722Y",
    userInfoData: {
      telephone: "2290153818589",
      nom: "Excellente",
      prenom: "Paul"
    }
  }

  // 2. Transformer le payload
  const payloadAPI = transformUserPayload(payload, "TempPassword2024!")

  // 3. Envoyer à l'API
  // const response = await createUser(payloadAPI)

  console.log("Payload prêt pour l'API:", payloadAPI)

  return payloadAPI
}

// ============================================================
// EXEMPLE AVEC MOT DE PASSE DANS LE PAYLOAD ORIGINAL
// ============================================================

const payloadAvecMotDePasse = {
  role_id: "01K93VKDF6J9TEAQ762NBK722Y",
  mot_de_passe: "SuperMotDePasse!",
  userInfoData: {
    telephone: "2290153818589",
    nom: "Excellente",
    prenom: "Paul"
  }
}

const payloadFinal = transformUserPayload(payloadAvecMotDePasse)

console.log("\n========================================")
console.log("AVEC MOT DE PASSE FOURNI:")
console.log("========================================")
console.log(JSON.stringify(payloadFinal, null, 2))

/*
RÉSULTAT :
{
  "nom_utilisateur": "Paul Excellente",
  "telephone": "2290153818589",
  "mot_de_passe": "SuperMotDePasse!",
  "role_id": "01K93VKDF6J9TEAQ762NBK722Y",
  "email": null
}
*/

// ============================================================
// EXPORT POUR UTILISATION
// ============================================================
export { payloadOriginal, payloadTransforme, payloadFinal }
