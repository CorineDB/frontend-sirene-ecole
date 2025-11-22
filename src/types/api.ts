/**
 * Types TypeScript pour les réponses API
 * Centralise toutes les interfaces pour éviter les types 'any'
 */

import type { AxiosError } from 'axios'

// ==================== Error Types ====================

export interface ApiErrorData {
  message?: string
  errors?: Record<string, string[]>
  error?: string
}

export type ApiAxiosError = AxiosError<ApiErrorData>

// ==================== Permissions & Roles ====================

export interface ApiPermission {
  id: string
  slug: string
  nom: string
  description?: string | null
  created_at?: string
  updated_at?: string
}

export interface ApiRole {
  id: string
  slug: string
  nom: string
  description?: string | null
  permissions?: ApiPermission[]
  created_at?: string
  updated_at?: string
}

// ==================== Géographie (Pays & Ville) ====================

export interface ApiPays {
  id: string
  nom: string
  code_iso: string
  indicatif_tel: string
  devise: string
  fuseau_horaire: string
  actif: boolean
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export interface ApiVille {
  id: string
  pays_id: string
  nom: string
  code: string
  latitude: number | null
  longitude: number | null
  actif: boolean
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
  pays?: ApiPays
}

// ==================== User ====================

export interface ApiUser {
  id: string
  email: string | null
  telephone: string | null
  nom_utilisateur: string
  type: string // ADMIN, USER, ECOLE, TECHNICIEN
  role?: ApiRole
  doit_changer_mot_de_passe?: boolean
  mot_de_passe_change?: boolean
  created_at?: string
  updated_at?: string
}

export interface ApiUserResponse {
  success: boolean
  message?: string
  data?: ApiUser
}

// ==================== Auth Responses ====================

export interface ApiAuthTokenData {
  access_token: string
  token_type: string
  expires_in: number
  user?: ApiUser
}

export interface ApiAuthResponse {
  success: boolean
  message: string
  data?: ApiAuthTokenData
}

export interface ApiMeResponse {
  success: boolean
  message?: string
  data?: ApiUser
}

// ==================== Roles & Permissions Management ====================

export interface ApiRoleData {
  id: string
  slug: string
  nom: string
  description?: string | null
  permissions?: ApiPermission[]
  created_at?: string
  updated_at?: string
}

export interface ApiRolesListResponse {
  success: boolean
  message?: string
  data?: {
    roles: ApiRoleData[]
    pagination?: {
      current_page: number
      last_page: number
      per_page: number
      total: number
      from: number
      to: number
    }
  }
}

export interface ApiRoleResponse {
  success: boolean
  message?: string
  data?: ApiRoleData
}

export interface ApiPermissionsListResponse {
  success: boolean
  message?: string
  data?: {
    permissions: ApiPermission[]
    pagination?: {
      current_page: number
      last_page: number
      per_page: number
      total: number
      from: number
      to: number
    }
  }
}

// ==================== Generic API Response ====================

export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
}

export interface ApiErrorResponse {
  success: false
  message: string
  errors?: Record<string, string[]>
}

export interface ApiPagination {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

export interface ApiPaginatedResponse<T> {
  success: boolean
  message?: string
  data?: {
    items: T[]
    pagination: ApiPagination
  }
}

// ==================== Users Management ====================

export interface ApiUserInfo {
  id: string
  user_id: string
  nom: string
  prenom: string
  telephone: string
  email: string | null
  ville_id: string | null
  adresse: string | null
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
  ville?: ApiVille | null
}

export interface ApiUserData {
  id: string
  nom_utilisateur: string
  identifiant: string
  type: string // ADMIN, USER, ECOLE, TECHNICIEN
  user_account_type_id: string | null
  user_account_type_type: string | null
  role?: ApiRole
  role_id?: string
  actif: boolean
  statut: number
  doit_changer_mot_de_passe?: boolean
  mot_de_passe_change?: boolean
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
  user_info?: ApiUserInfo
  // Anciens champs pour compatibilité ascendante
  email?: string | null
  telephone?: string | null
}

export interface ApiUsersListResponse {
  success: boolean
  message?: string | null
  data?: {
    current_page: number
    data: ApiUserData[] // This is the array of users
    first_page_url?: string
    from?: number | null
    last_page: number
    last_page_url?: string
    links?: {
      url: string | null
      label: string
      active: boolean
    }[]
    next_page_url?: string | null
    path?: string
    per_page: number
    prev_page_url?: string | null
    to?: number | null
    total: number
  }
}

export interface ApiUserDetailResponse {
  success: boolean
  message?: string
  data?: ApiUserData
}

// Format avec userInfoData imbriqué (nouveau format backend)
export interface UserInfoData {
  nom: string
  prenom: string
  telephone: string
}

export interface CreateUserRequest {
  nom_utilisateur?: string
  email?: string | null
  telephone?: string | null
  mot_de_passe?: string
  type?: string
  role_id?: string
  // Nouveau format avec userInfoData
  userInfoData?: UserInfoData
}

export interface UpdateUserRequest {
  nom_utilisateur?: string
  email?: string | null
  telephone?: string | null
  type?: string
  role_id?: string
  // Nouveau format avec userInfoData
  userInfoData?: UserInfoData
}

export interface UpdateProfileRequest {
  nom_utilisateur?: string
  email?: string | null
  telephone?: string | null
}

export interface ChangePasswordRequest {
  ancien_mot_de_passe: string
  nouveau_mot_de_passe: string
  confirmation_mot_de_passe: string
}

export interface AssignRoleRequest {
  role_id: string
}

// ==================== Sirènes ====================

export interface ApiSirenModel {
  id: string
  nom: string
  reference: string
  description?: string | null
  specifications?: Record<string, any>
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export interface ApiEcole {
  id: string
  nom: string
  nom_complet: string
  ville_id?: string | null
  ville?: ApiVille | null
  // Add other fields from the JSON if needed for display elsewhere
}

export interface ApiSite {
  id: string
  nom: string
  adresse: string
  ville_id?: string | null
  ville?: ApiVille | null
  // Add other fields from the JSON if needed for display elsewhere
}

export interface ApiSiren {
  id: string
  modele_id: string
  ecole_id?: string | null // Added based on JSON
  site_id?: string | null // Added based on JSON
  numero_serie?: string
  date_fabrication: string
  status?: 'en_stock' | 'reserve' | 'installe' | 'en_panne' | 'hors_service'
  notes?: string | null
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
  modele_sirene?: ApiSirenModel // Added based on JSON
  ecole?: ApiEcole // Added based on JSON
  site?: ApiSite // Added based on JSON
}

export interface CreateSirenRequest {
  modele_id?: string
  date_fabrication: string
  status: 'en_stock' | 'reserve' | 'installe' | 'en_panne' | 'hors_service'
  notes?: string | null
}

export interface UpdateSirenRequest {
  modele_id?: string
  date_fabrication?: string
  status?: 'en_stock' | 'reserve' | 'installe' | 'en_panne' | 'hors_service'
  notes?: string | null
}

export interface ApiSirensListResponse {
  success: boolean
  message?: string
  data?: {
    current_page: number
    data: ApiSiren[] // This is the array of sirens
    first_page_url?: string
    from?: number | null
    last_page: number
    last_page_url?: string
    links?: {
      url: string | null
      label: string
      active: boolean
    }[]
    next_page_url?: string | null
    path?: string
    per_page: number
    prev_page_url?: string | null
    to?: number | null
    total: number
  }
}

export interface ApiSirenResponse {
  success: boolean
  message?: string
  data?: ApiSiren
}

export interface ApiSirenModelsListResponse {
  success: boolean
  message?: string
  data?: {
    data: ApiSirenModel[] // Corrected from 'models' to 'data'
    pagination?: ApiPagination
  }
}

export interface ApiSirenModelResponse {
  success: boolean
  message?: string
  data?: ApiSirenModel
}

export interface CreateSirenModelRequest {
  model_name: string
  model_code: string
  description?: string | null
}

export interface UpdateSirenModelRequest {
  model_name?: string
  model_code?: string
  description?: string | null
}

// ==================== Affectation & Panne ====================

export interface AffecterSirenRequest {
  ecole_id?: string
  date_affectation?: string
  notes?: string | null
}

export interface DeclarerPanneRequest {
  description: string
  date_panne?: string
  gravite?: string // 'faible', 'moyenne', 'elevee'
}

// ==================== Programmations ====================

// Format horaire ESP8266
export interface HoraireSonnerie {
  heure: number // 0-23
  minute: number // 0-59
  jours: number[] // 0-6 (0=Dimanche, 1=Lundi, ..., 6=Samedi)
  duree_sonnerie?: number // Durée en secondes (optionnel)
  description?: string | null // Description de l'horaire (optionnel)
}

// Exception de jour férié
export interface JourFerieException {
  date: string // Format: YYYY-MM-DD
  action: 'include' | 'exclude'
  est_national?: boolean | null // Jour férié national (true) ou local (false)
  recurrent?: boolean | null // Récurrent/annuel (true) ou exceptionnel (false)
  intitule_journee?: string | null // Nom du jour férié (ex: "Noël", "Nouvel An")
}

// Calendrier scolaire (pour la relation)
export interface ApiCalendrierScolaire {
  id: string
  nom: string
  annee_scolaire: string
  date_debut: string
  date_fin: string
}

// Abonnement (pour la relation)
export interface ApiAbonnement {
  id: string
  nom: string
  date_debut: string
  date_fin: string
  actif: boolean
}

export interface ApiProgrammation {
  id: string
  ecole_id: string
  site_id?: string | null
  sirene_id: string
  abonnement_id?: string | null
  calendrier_id?: string | null
  nom_programmation: string
  horaires_sonneries: HoraireSonnerie[] // Format ESP8266
  jour_semaine?: number[] | null // Jours de la semaine globaux (optionnel)
  jours_feries_inclus: boolean
  jours_feries_exceptions?: JourFerieException[] | null
  chaine_programmee?: string | null // Chaîne programmée générée
  chaine_cryptee?: string | null // Chaîne cryptée pour ESP8266
  date_debut: string // Format: YYYY-MM-DD
  date_fin: string // Format: YYYY-MM-DD
  actif: boolean
  cree_par?: string | null
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
  // Relations (loaded optionally)
  ecole?: ApiEcole
  site?: ApiSite
  sirene?: ApiSiren
  abonnement?: ApiAbonnement
  calendrier?: ApiCalendrierScolaire
}

export interface CreateProgrammationRequest {
  nom_programmation: string
  date_debut: string // Format: YYYY-MM-DD
  date_fin: string // Format: YYYY-MM-DD
  actif?: boolean
  calendrier_id?: string | null
  horaires_sonneries: HoraireSonnerie[] // Requis, min 1
  jours_feries_inclus?: boolean
  jours_feries_exceptions?: JourFerieException[]
  abonnement_id?: string | null
}

export interface UpdateProgrammationRequest {
  nom_programmation?: string
  date_debut?: string
  date_fin?: string
  actif?: boolean
  calendrier_id?: string | null
  horaires_sonneries?: HoraireSonnerie[]
  jours_feries_inclus?: boolean
  jours_feries_exceptions?: JourFerieException[]
  abonnement_id?: string | null
}

export interface ApiProgrammationsListResponse {
  success: boolean
  message?: string
  data?: ApiProgrammation[] | {
    programmations?: ApiProgrammation[]
    data?: ApiProgrammation[]
    pagination?: ApiPagination
  }
}

export interface ApiProgrammationResponse {
  success: boolean
  message?: string
  data?: ApiProgrammation
}

// ==================== Abonnements ====================

export enum StatutAbonnement {
  ACTIF = 'actif',
  EXPIRE = 'expire',
  SUSPENDU = 'suspendu',
  EN_ATTENTE = 'en_attente'
}

export interface ApiAbonnement {
  id: string
  ecole_id: string
  site_id: string
  sirene_id: string
  parent_abonnement_id: string | null
  numero_abonnement: string
  date_debut: string
  date_fin: string
  montant: number
  statut: StatutAbonnement
  auto_renouvellement: boolean
  notes: string | null
  qr_code_path: string | null
  qr_code_url?: string
  created_at: string
  updated_at: string

  // Relations
  ecole?: ApiEcole
  site?: ApiSite
  sirene?: ApiSiren
  paiements?: ApiPaiement[]
  token?: ApiTokenSirene
}

export interface ApiPaiement {
  id: string
  abonnement_id: string
  ecole_id: string
  numero_transaction: string
  montant: number
  moyen: 'cinetpay' | 'virement' | 'especes'
  statut: 'en_attente' | 'valide' | 'echoue' | 'annule'
  reference_externe: string | null
  metadata: any
  date_paiement: string
  date_validation: string | null
  created_at: string
  updated_at: string
}

export interface ApiTokenSirene {
  id: string
  abonnement_id: string
  sirene_id: string
  site_id: string
  token_crypte: string
  date_debut: string
  date_fin: string
  actif: boolean
  date_generation: string
  date_expiration: string
  date_activation: string | null
}

export interface ApiAbonnementsListResponse {
  success: boolean
  message?: string
  data?: {
    current_page: number
    data: ApiAbonnement[]
    per_page: number
    total: number
    last_page: number
  }
}

export interface ApiAbonnementResponse {
  success: boolean
  message?: string
  data?: ApiAbonnement
}

export interface CreateAbonnementRequest {
  ecole_id: string
  site_id: string
  sirene_id: string
  date_debut: string
  date_fin: string
  montant: number
  auto_renouvellement?: boolean
  notes?: string
}

export interface UpdateAbonnementRequest {
  date_debut?: string
  date_fin?: string
  montant?: number
  auto_renouvellement?: boolean
  notes?: string
}

export interface AbonnementStatsResponse {
  success: boolean
  message?: string
  data?: {
    total_abonnements: number
    actifs: number
    expires: number
    suspendus: number
    en_attente: number
    revenus_total: number
    revenus_mois_courant: number
  }
}

// ==================== Pannes & Interventions ====================

export enum StatutPanne {
  DECLAREE = 'declaree',
  VALIDEE = 'validee',
  ASSIGNEE = 'assignee',
  EN_COURS = 'en_cours',
  RESOLUE = 'resolue',
  CLOTUREE = 'cloturee'
}

export enum PrioritePanne {
  BASSE = 'basse',
  MOYENNE = 'moyenne',
  HAUTE = 'haute',
  URGENTE = 'urgente'
}

export enum StatutOrdreMission {
  EN_ATTENTE = 'en_attente',
  EN_COURS = 'en_cours',
  TERMINE = 'termine',
  CLOTURE = 'cloture'
}

export enum StatutCandidature {
  EN_ATTENTE = 'en_attente',
  ACCEPTEE = 'acceptee',
  REFUSEE = 'refusee',
  RETIREE = 'retiree'
}

export enum StatutMission {
  NON_DEMARREE = 'non_demarree',
  EN_COURS = 'en_cours',
  TERMINEE = 'terminee',
  ANNULEE = 'annulee'
}

export enum StatutIntervention {
  PLANIFIEE = 'planifiee',
  ASSIGNEE = 'assignee',
  ACCEPTEE = 'acceptee',
  EN_COURS = 'en_cours',
  TERMINEE = 'terminee',
  ANNULEE = 'annulee'
}

export enum TypeIntervention {
  INSPECTION = 'inspection',
  CONSTAT = 'constat',
  REPARATION = 'reparation',
  INSTALLATION = 'installation',
  MAINTENANCE = 'maintenance',
  AUTRE = 'autre'
}

export enum ResultatIntervention {
  RESOLU = 'resolu',
  PARTIELLEMENT_RESOLU = 'partiellement_resolu',
  NON_RESOLU = 'non_resolu'
}

export enum StatutRapportIntervention {
  EN_ATTENTE = 'en_attente',
  VALIDE = 'valide',
  REJETE = 'rejete',
  EN_REVISION = 'en_revision'
}

export interface ApiTechnicien {
  id: string
  user_id: string
  ville_id: string
  specialite: string | null
  experience_annees: number | null
  certifications: string[] | null
  disponibilite: boolean
  statut: 'actif' | 'inactif' | 'suspendu'
  note_moyenne: number | null
  nombre_interventions: number
  created_at: string
  updated_at: string
  deleted_at: string | null

  user?: ApiUser
  ville?: ApiVille
}

export interface ApiPanne {
  id: string
  ecole_id: string
  sirene_id: string
  site_id: string
  numero_panne: string
  description: string
  date_signalement: string
  priorite: PrioritePanne
  statut: StatutPanne
  date_declaration: string | null
  date_validation: string | null
  valide_par: string | null
  est_cloture: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null

  ecole?: ApiEcole
  sirene?: ApiSiren
  site?: ApiSite
  validePar?: ApiUser
  interventions?: ApiIntervention[]
}

export interface ApiOrdreMission {
  id: string
  panne_id: string
  ville_id: string
  date_generation: string
  date_debut_candidature: string | null
  date_fin_candidature: string | null
  nombre_techniciens_requis: number
  nombre_techniciens_acceptes: number
  candidature_cloturee: boolean
  date_cloture_candidature: string | null
  cloture_par: string | null
  valide_par: string | null
  statut: StatutOrdreMission
  commentaire: string | null
  numero_ordre: string
  created_at: string
  updated_at: string
  deleted_at: string | null

  panne?: ApiPanne
  ville?: ApiVille
  validePar?: ApiUser
  cloturePar?: ApiUser
  missionsTechniciens?: ApiMissionTechnicien[]
  interventions?: ApiIntervention[]
}

export interface ApiMissionTechnicien {
  id: string
  ordre_mission_id: string
  technicien_id: string
  statut_candidature: StatutCandidature
  statut: StatutMission
  date_acceptation: string | null
  date_cloture: string | null
  date_retrait: string | null
  motif_retrait: string | null
  created_at: string
  updated_at: string

  ordreMission?: ApiOrdreMission
  technicien?: ApiTechnicien
}

export interface ApiIntervention {
  id: string
  panne_id: string
  ordre_mission_id: string
  type_intervention: TypeIntervention | null
  nombre_techniciens_requis: number
  date_intervention: string | null
  date_affectation: string | null
  date_assignation: string | null
  date_acceptation: string | null
  date_debut: string | null
  date_fin: string | null
  statut: StatutIntervention
  old_statut: StatutIntervention | null
  note_ecole: number | null
  commentaire_ecole: string | null
  observations: string | null
  instructions: string | null
  lieu_rdv: string | null
  heure_rdv: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null

  panne?: ApiPanne
  ordreMission?: ApiOrdreMission
  techniciens?: ApiTechnicien[]
  rapports?: ApiRapportIntervention[]
  avis?: ApiAvisIntervention[]
}

export interface ApiRapportIntervention {
  id: string
  intervention_id: string
  technicien_id: string | null
  rapport: string
  date_soumission: string
  statut: StatutRapportIntervention
  photo_url: string[]
  review_note: number | null
  review_admin: string | null
  diagnostic: string | null
  travaux_effectues: string | null
  pieces_utilisees: string | null
  resultat: ResultatIntervention
  recommandations: string | null
  photos: string[]
  date_rapport: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null

  intervention?: ApiIntervention
  technicien?: ApiTechnicien | null
  avis?: ApiAvisRapport[]
}

export interface ApiAvisIntervention {
  id: string
  intervention_id: string
  auteur_id: string
  commentaire: string
  note: number
  created_at: string
  updated_at: string

  auteur?: ApiUser
}

export interface ApiAvisRapport {
  id: string
  rapport_intervention_id: string
  auteur_id: string
  commentaire: string
  note: number
  created_at: string
  updated_at: string

  auteur?: ApiUser
}

// Request types for Pannes & Interventions

export interface DeclarerPanneRequest {
  description: string
  priorite?: PrioritePanne
}

export interface ValiderPanneRequest {
  nombre_techniciens_requis: number
  date_debut_candidature?: string
  date_fin_candidature?: string
  commentaire?: string
}

export interface CreateOrdreMissionRequest {
  panne_id: string
  ville_id: string
  valide_par: string
  nombre_techniciens_requis: number
  date_debut_candidature?: string
  date_fin_candidature?: string
  commentaire?: string
}

export interface SoumettreCandidatureRequest {
  technicien_id: string
}

export interface AccepterCandidatureRequest {
  admin_id: string
}

export interface RefuserCandidatureRequest {
  admin_id: string
}

export interface RetirerCandidatureRequest {
  motif_retrait: string
}

export interface CreateInterventionRequest {
  type_intervention?: TypeIntervention
  nombre_techniciens_requis?: number
  date_intervention?: string
  instructions?: string
  lieu_rdv?: string
  heure_rdv?: string
  technicien_ids?: string[]
}

export interface PlanifierInterventionRequest {
  date_intervention: string
  instructions?: string
  lieu_rdv?: string
  heure_rdv?: string
}

export interface AssignerTechnicienRequest {
  technicien_id: string
  role?: string
}

export interface RetirerTechnicienRequest {
  technicien_id: string
}

export interface DemarrerInterventionRequest {
  technicien_id: string
}

export interface TerminerInterventionRequest {
  technicien_id: string
}

export interface RetirerMissionRequest {
  admin_id: string
  raison: string
}

export interface RedigerRapportRequest {
  technicien_id?: string | null
  rapport: string
  diagnostic?: string
  travaux_effectues?: string
  pieces_utilisees?: string
  resultat: ResultatIntervention
  recommandations?: string
  photos?: string[]
}

export interface NoterInterventionRequest {
  note: number
  commentaire?: string
}

export interface NoterRapportRequest {
  review_note: number
  review_admin?: string
}

export interface AjouterAvisRequest {
  auteur_id: string
  commentaire: string
  note: number
}

// Response types for Pannes & Interventions

export interface ApiPannesListResponse {
  success: boolean
  message?: string
  data?: {
    current_page: number
    data: ApiPanne[]
    per_page: number
    total: number
    last_page: number
  }
}

export interface ApiPanneResponse {
  success: boolean
  message?: string
  data?: ApiPanne
}

export interface ApiOrdresMissionListResponse {
  success: boolean
  message?: string
  data?: {
    current_page: number
    data: ApiOrdreMission[]
    per_page: number
    total: number
    last_page: number
  }
}

export interface ApiOrdreMissionResponse {
  success: boolean
  message?: string
  data?: ApiOrdreMission
}

export interface ApiInterventionsListResponse {
  success: boolean
  message?: string
  data?: {
    current_page: number
    data: ApiIntervention[]
    per_page: number
    total: number
    last_page: number
  }
}

export interface ApiInterventionResponse {
  success: boolean
  message?: string
  data?: ApiIntervention
}

export interface ApiRapportsListResponse {
  success: boolean
  message?: string
  data?: {
    current_page: number
    data: ApiRapportIntervention[]
    per_page: number
    total: number
    last_page: number
  }
}

export interface ApiRapportResponse {
  success: boolean
  message?: string
  data?: ApiRapportIntervention
}
