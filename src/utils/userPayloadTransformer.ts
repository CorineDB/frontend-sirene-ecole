/**
 * Utilitaire pour transformer les payloads utilisateur
 * Convertit les différents formats de payload vers le format attendu par l'API
 */

/**
 * Interface pour le payload avec userInfoData imbriqué
 */
export interface UserPayloadWithUserInfoData {
  role_id?: string
  userInfoData: {
    telephone: string
    nom: string
    prenom: string
  }
}

/**
 * Payload transformé (sans mot de passe)
 */
export interface TransformedUserPayload {
  nom_utilisateur: string
  telephone: string | null
  role_id?: string
  email?: string | null
}

/**
 * Transforme un payload avec userInfoData imbriqué
 *
 * @param payload - Le payload original avec userInfoData
 * @returns Payload transformé
 *
 * @example
 * ```typescript
 * const payload = {
 *   role_id: "01K93VKDF6J9TEAQ762NBK722Y",
 *   userInfoData: {
 *     telephone: "2290153818589",
 *     nom: "Excellente",
 *     prenom: "Paul"
 *   }
 * }
 *
 * const transformed = transformUserPayload(payload)
 * // Résultat:
 * // {
 * //   nom_utilisateur: "Paul Excellente",
 * //   telephone: "2290153818589",
 * //   role_id: "01K93VKDF6J9TEAQ762NBK722Y"
 * // }
 * ```
 */
export function transformUserPayload(
  payload: UserPayloadWithUserInfoData
): TransformedUserPayload {
  const { userInfoData, role_id } = payload

  // Combine prenom et nom pour créer nom_utilisateur
  const nom_utilisateur = `${userInfoData.prenom} ${userInfoData.nom}`.trim()

  // Construction du payload transformé
  const transformedPayload: TransformedUserPayload = {
    nom_utilisateur,
    telephone: userInfoData.telephone || null,
    role_id: role_id || undefined
  }

  return transformedPayload
}

/**
 * Transforme un tableau de payloads utilisateur
 *
 * @param payloads - Tableau de payloads à transformer
 * @returns Tableau de payloads transformés
 */
export function transformUserPayloadBatch(
  payloads: UserPayloadWithUserInfoData[]
): TransformedUserPayload[] {
  return payloads.map(payload => transformUserPayload(payload))
}
