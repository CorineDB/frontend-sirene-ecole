/**
 * Utilitaire pour transformer les payloads utilisateur
 * Convertit les différents formats de payload vers le format attendu par l'API
 */

import type { CreateUserRequest } from '@/types/api'

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
  mot_de_passe?: string
}

/**
 * Transforme un payload avec userInfoData imbriqué vers CreateUserRequest
 *
 * @param payload - Le payload original avec userInfoData
 * @param defaultPassword - Mot de passe par défaut si non fourni (requis pour la création)
 * @returns CreateUserRequest compatible avec l'API
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
 * const transformed = transformUserPayload(payload, "defaultPassword123")
 * // Résultat:
 * // {
 * //   nom_utilisateur: "Paul Excellente",
 * //   telephone: "2290153818589",
 * //   mot_de_passe: "defaultPassword123",
 * //   role_id: "01K93VKDF6J9TEAQ762NBK722Y"
 * // }
 * ```
 */
export function transformUserPayload(
  payload: UserPayloadWithUserInfoData,
  defaultPassword?: string
): CreateUserRequest {
  const { userInfoData, role_id, mot_de_passe } = payload

  // Combine prenom et nom pour créer nom_utilisateur
  const nom_utilisateur = `${userInfoData.prenom} ${userInfoData.nom}`.trim()

  // Construction du payload transformé
  const transformedPayload: CreateUserRequest = {
    nom_utilisateur,
    telephone: userInfoData.telephone || null,
    mot_de_passe: mot_de_passe || defaultPassword || '',
    role_id: role_id || undefined,
    email: null // Email non fourni dans le payload original
  }

  return transformedPayload
}

/**
 * Transforme un payload avec userInfoData imbriqué vers CreateUserRequest
 * avec validation stricte du mot de passe
 *
 * @param payload - Le payload original avec userInfoData
 * @param defaultPassword - Mot de passe par défaut si non fourni
 * @throws Error si le mot de passe n'est pas fourni
 * @returns CreateUserRequest compatible avec l'API
 */
export function transformUserPayloadStrict(
  payload: UserPayloadWithUserInfoData,
  defaultPassword?: string
): CreateUserRequest {
  const transformed = transformUserPayload(payload, defaultPassword)

  if (!transformed.mot_de_passe) {
    throw new Error('Le mot de passe est requis pour créer un utilisateur')
  }

  return transformed
}

/**
 * Transforme un tableau de payloads utilisateur
 *
 * @param payloads - Tableau de payloads à transformer
 * @param defaultPassword - Mot de passe par défaut
 * @returns Tableau de CreateUserRequest
 */
export function transformUserPayloadBatch(
  payloads: UserPayloadWithUserInfoData[],
  defaultPassword?: string
): CreateUserRequest[] {
  return payloads.map(payload => transformUserPayload(payload, defaultPassword))
}
