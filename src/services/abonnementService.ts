import apiClient from './api'
import type {
  ApiResponse,
  ApiAbonnement,
  ApiAbonnementsListResponse,
  ApiAbonnementResponse,
  CreateAbonnementRequest,
  UpdateAbonnementRequest,
  AbonnementStatsResponse
} from '@/types/api'

/**
 * Service de gestion des abonnements
 */
class AbonnementService {
  // ==================== CRUD Basique ====================

  /**
   * Lister tous les abonnements (admin)
   */
  async getAll(perPage: number = 15): Promise<ApiAbonnementsListResponse> {
    const response = await apiClient.get(`/abonnements?per_page=${perPage}`)
    return response.data
  }

  /**
   * Obtenir les détails d'un abonnement
   */
  async getById(id: string): Promise<ApiAbonnementResponse> {
    const response = await apiClient.get(`/abonnements/${id}`)
    return response.data
  }

  /**
   * Créer un nouvel abonnement
   */
  async create(data: CreateAbonnementRequest): Promise<ApiAbonnementResponse> {
    const response = await apiClient.post('/abonnements', data)
    return response.data
  }

  /**
   * Mettre à jour un abonnement
   */
  async update(id: string, data: UpdateAbonnementRequest): Promise<ApiAbonnementResponse> {
    const response = await apiClient.put(`/abonnements/${id}`, data)
    return response.data
  }

  /**
   * Supprimer un abonnement
   */
  async delete(id: string): Promise<ApiResponse> {
    const response = await apiClient.delete(`/abonnements/${id}`)
    return response.data
  }

  // ==================== Gestion du Cycle de Vie ====================

  /**
   * Renouveler un abonnement
   */
  async renouveler(abonnementId: string): Promise<ApiAbonnementResponse> {
    const response = await apiClient.post(`/abonnements/${abonnementId}/renouveler`)
    return response.data
  }

  /**
   * Suspendre un abonnement
   */
  async suspendre(abonnementId: string, raison?: string): Promise<ApiAbonnementResponse> {
    const response = await apiClient.post(`/abonnements/${abonnementId}/suspendre`, { raison })
    return response.data
  }

  /**
   * Réactiver un abonnement suspendu
   */
  async reactiver(abonnementId: string): Promise<ApiAbonnementResponse> {
    const response = await apiClient.post(`/abonnements/${abonnementId}/reactiver`)
    return response.data
  }

  /**
   * Annuler un abonnement
   */
  async annuler(abonnementId: string, raison?: string): Promise<ApiAbonnementResponse> {
    const response = await apiClient.post(`/abonnements/${abonnementId}/annuler`, { raison })
    return response.data
  }

  /**
   * Activer un abonnement en attente
   */
  async activer(abonnementId: string): Promise<ApiAbonnementResponse> {
    const response = await apiClient.post(`/abonnements/${abonnementId}/activer`)
    return response.data
  }

  /**
   * Régénérer le QR code d'un abonnement en attente
   */
  async regenererQrCode(abonnementId: string): Promise<ApiResponse<{
    qr_code_path: string
    qr_code_url: string
  }>> {
    const response = await apiClient.post(`/abonnements/${abonnementId}/regenerer-qr-code`)
    return response.data
  }

  /**
   * Régénérer le token ESP8266 d'un abonnement
   */
  async regenererToken(abonnementId: string): Promise<ApiResponse> {
    const response = await apiClient.post(`/abonnements/${abonnementId}/regenerer-token`)
    return response.data
  }

  // ==================== Recherche et Filtrage ====================

  /**
   * Obtenir l'abonnement actif d'une école
   */
  async getAbonnementActif(ecoleId: string): Promise<ApiAbonnementResponse> {
    const response = await apiClient.get(`/abonnements/ecole/${ecoleId}/actif`)
    return response.data
  }

  /**
   * Obtenir tous les abonnements d'une école
   */
  async getByEcole(ecoleId: string): Promise<ApiAbonnementsListResponse> {
    const response = await apiClient.get(`/abonnements/ecole/${ecoleId}`)
    return response.data
  }

  /**
   * Obtenir les abonnements d'une sirène
   */
  async getBySirene(sireneId: string): Promise<ApiAbonnementsListResponse> {
    const response = await apiClient.get(`/abonnements/sirene/${sireneId}`)
    return response.data
  }

  /**
   * Obtenir les abonnements expirant bientôt
   */
  async getExpirantBientot(jours: number = 30): Promise<ApiAbonnementsListResponse> {
    const response = await apiClient.get(`/abonnements/liste/expirant-bientot?jours=${jours}`)
    return response.data
  }

  /**
   * Obtenir les abonnements expirés
   */
  async getExpires(): Promise<ApiAbonnementsListResponse> {
    const response = await apiClient.get('/abonnements/liste/expires')
    return response.data
  }

  /**
   * Obtenir les abonnements actifs
   */
  async getActifs(): Promise<ApiAbonnementsListResponse> {
    const response = await apiClient.get('/abonnements/liste/actifs')
    return response.data
  }

  /**
   * Obtenir les abonnements en attente
   */
  async getEnAttente(): Promise<ApiAbonnementsListResponse> {
    const response = await apiClient.get('/abonnements/liste/en-attente')
    return response.data
  }

  // ==================== Vérifications ====================

  /**
   * Vérifier si un abonnement est valide
   */
  async estValide(abonnementId: string): Promise<ApiResponse<{ valide: boolean }>> {
    const response = await apiClient.get(`/abonnements/${abonnementId}/est-valide`)
    return response.data
  }

  /**
   * Vérifier si une école a un abonnement actif
   */
  async ecoleAAbonnementActif(ecoleId: string): Promise<ApiResponse<{ a_abonnement_actif: boolean }>> {
    const response = await apiClient.get(`/abonnements/ecole/${ecoleId}/a-abonnement-actif`)
    return response.data
  }

  /**
   * Vérifier si un abonnement peut être renouvelé
   */
  async peutEtreRenouvele(abonnementId: string): Promise<ApiResponse<{ peut_etre_renouvele: boolean, raison?: string }>> {
    const response = await apiClient.get(`/abonnements/${abonnementId}/peut-etre-renouvele`)
    return response.data
  }

  // ==================== Statistiques ====================

  /**
   * Obtenir les statistiques globales
   */
  async getStatistiques(): Promise<AbonnementStatsResponse> {
    const response = await apiClient.get('/abonnements/stats/global')
    return response.data
  }

  /**
   * Obtenir les revenus sur une période
   */
  async getRevenusPeriode(dateDebut: string, dateFin: string): Promise<ApiResponse<{
    revenus_total: number
    nombre_abonnements: number
    revenus_par_jour: Record<string, number>
  }>> {
    const response = await apiClient.get('/abonnements/stats/revenus-periode', {
      params: { date_debut: dateDebut, date_fin: dateFin }
    })
    return response.data
  }

  /**
   * Obtenir le taux de renouvellement
   */
  async getTauxRenouvellement(): Promise<ApiResponse<{
    taux_renouvellement: number
    total_arrives_echeance: number
    total_renouveles: number
  }>> {
    const response = await apiClient.get('/abonnements/stats/taux-renouvellement')
    return response.data
  }

  // ==================== Calculs ====================

  /**
   * Calculer le prix de renouvellement
   */
  async getPrixRenouvellement(abonnementId: string): Promise<ApiResponse<{
    montant_base: number
    montant_final: number
    reduction?: number
    raison_reduction?: string
  }>> {
    const response = await apiClient.get(`/abonnements/${abonnementId}/prix-renouvellement`)
    return response.data
  }

  /**
   * Obtenir le nombre de jours restants
   */
  async getJoursRestants(abonnementId: string): Promise<ApiResponse<{ jours_restants: number }>> {
    const response = await apiClient.get(`/abonnements/${abonnementId}/jours-restants`)
    return response.data
  }

  // ==================== QR Code ====================

  /**
   * Obtenir l'URL signée du QR code
   */
  async getQrCodeUrl(id: string): Promise<ApiResponse<{ qr_code_url: string, expires_at: string }>> {
    const response = await apiClient.get(`/abonnements/${id}/qr-code-url`)
    return response.data
  }

  /**
   * Télécharger le QR code d'un abonnement
   */
  async telechargerQrCode(abonnementId: string): Promise<Blob> {
    const response = await apiClient.get(`/abonnements/${abonnementId}/qr-code`, {
      responseType: 'blob'
    })
    return response.data
  }

  // ==================== Tâches Automatiques (Admin/CRON) ====================

  /**
   * Marquer les abonnements expirés (CRON)
   */
  async marquerExpires(): Promise<ApiResponse<{ abonnements_expires: number }>> {
    const response = await apiClient.post('/abonnements/cron/marquer-expires')
    return response.data
  }

  /**
   * Envoyer les notifications d'expiration (CRON)
   */
  async envoyerNotifications(): Promise<ApiResponse<{ notifications_envoyees: number }>> {
    const response = await apiClient.post('/abonnements/cron/envoyer-notifications')
    return response.data
  }

  /**
   * Auto-renouveler les abonnements (CRON)
   */
  async autoRenouveler(): Promise<ApiResponse<{ abonnements_renouveles: number }>> {
    const response = await apiClient.post('/abonnements/cron/auto-renouveler')
    return response.data
  }
}

export default new AbonnementService()
