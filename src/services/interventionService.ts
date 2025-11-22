import apiClient from './api'
import type {
  ApiResponse,
  ApiIntervention,
  ApiInterventionsListResponse,
  ApiInterventionResponse,
  ApiRapportIntervention,
  ApiRapportsListResponse,
  ApiRapportResponse,
  SoumettreCandidatureRequest,
  AccepterCandidatureRequest,
  RefuserCandidatureRequest,
  RetirerCandidatureRequest,
  CreateInterventionRequest,
  PlanifierInterventionRequest,
  AssignerTechnicienRequest,
  RetirerTechnicienRequest,
  DemarrerInterventionRequest,
  TerminerInterventionRequest,
  RetirerMissionRequest,
  RedigerRapportRequest,
  NoterInterventionRequest,
  NoterRapportRequest,
  AjouterAvisRequest
} from '@/types/api'

/**
 * Service de gestion des interventions
 */
class InterventionService {
  // ==================== CRUD Basique ====================

  /**
   * Lister toutes les interventions
   */
  async getAll(perPage: number = 15): Promise<ApiInterventionsListResponse> {
    const response = await apiClient.get(`/interventions?per_page=${perPage}`)
    return response.data
  }

  /**
   * Obtenir les détails d'une intervention
   */
  async getById(id: string): Promise<ApiInterventionResponse> {
    const response = await apiClient.get(`/interventions/${id}`)
    return response.data
  }

  // ==================== Candidatures ====================

  /**
   * Soumettre une candidature pour un ordre de mission
   */
  async soumettreCandidature(
    ordreMissionId: string,
    data: SoumettreCandidatureRequest
  ): Promise<ApiResponse> {
    const response = await apiClient.post(
      `/interventions/ordres-mission/${ordreMissionId}/candidature`,
      data
    )
    return response.data
  }

  /**
   * Accepter une candidature
   */
  async accepterCandidature(
    missionTechnicienId: string,
    data: AccepterCandidatureRequest
  ): Promise<ApiResponse> {
    const response = await apiClient.put(
      `/interventions/candidatures/${missionTechnicienId}/accepter`,
      data
    )
    return response.data
  }

  /**
   * Refuser une candidature
   */
  async refuserCandidature(
    missionTechnicienId: string,
    data: RefuserCandidatureRequest
  ): Promise<ApiResponse> {
    const response = await apiClient.put(
      `/interventions/candidatures/${missionTechnicienId}/refuser`,
      data
    )
    return response.data
  }

  /**
   * Retirer sa candidature (technicien)
   */
  async retirerCandidature(
    missionTechnicienId: string,
    data: RetirerCandidatureRequest
  ): Promise<ApiResponse> {
    const response = await apiClient.put(
      `/interventions/candidatures/${missionTechnicienId}/retirer`,
      data
    )
    return response.data
  }

  // ==================== Création & Gestion ====================

  /**
   * Créer une intervention manuellement
   */
  async creerIntervention(
    ordreMissionId: string,
    data: CreateInterventionRequest
  ): Promise<ApiInterventionResponse> {
    const response = await apiClient.post(
      `/interventions/ordres-mission/${ordreMissionId}/creer`,
      data
    )
    return response.data
  }

  /**
   * Assigner un technicien à une intervention
   */
  async assignerTechnicien(
    interventionId: string,
    data: AssignerTechnicienRequest
  ): Promise<ApiResponse> {
    const response = await apiClient.post(
      `/interventions/${interventionId}/techniciens`,
      data
    )
    return response.data
  }

  /**
   * Retirer un technicien d'une intervention
   */
  async retirerTechnicien(
    interventionId: string,
    data: RetirerTechnicienRequest
  ): Promise<ApiResponse> {
    const response = await apiClient.delete(`/interventions/${interventionId}/techniciens`, {
      data
    })
    return response.data
  }

  /**
   * Planifier une intervention
   */
  async planifier(
    interventionId: string,
    data: PlanifierInterventionRequest
  ): Promise<ApiInterventionResponse> {
    const response = await apiClient.put(
      `/interventions/${interventionId}/planifier`,
      data
    )
    return response.data
  }

  // ==================== Cycle de Vie ====================

  /**
   * Démarrer une intervention
   */
  async demarrer(
    interventionId: string,
    data: DemarrerInterventionRequest
  ): Promise<ApiInterventionResponse> {
    const response = await apiClient.put(
      `/interventions/${interventionId}/demarrer`,
      data
    )
    return response.data
  }

  /**
   * Terminer une intervention
   */
  async terminer(
    interventionId: string,
    data: TerminerInterventionRequest
  ): Promise<ApiInterventionResponse> {
    const response = await apiClient.put(
      `/interventions/${interventionId}/terminer`,
      data
    )
    return response.data
  }

  /**
   * Retirer de la mission (annuler)
   */
  async retirerMission(
    interventionId: string,
    data: RetirerMissionRequest
  ): Promise<ApiInterventionResponse> {
    const response = await apiClient.put(
      `/interventions/${interventionId}/retirer-mission`,
      data
    )
    return response.data
  }

  // ==================== Rapports ====================

  /**
   * Rédiger un rapport d'intervention
   */
  async redigerRapport(
    interventionId: string,
    data: RedigerRapportRequest
  ): Promise<ApiRapportResponse> {
    const response = await apiClient.post(
      `/interventions/${interventionId}/rapport`,
      data
    )
    return response.data
  }

  /**
   * Obtenir les rapports d'une intervention
   */
  async getRapports(interventionId: string): Promise<ApiRapportsListResponse> {
    const response = await apiClient.get(`/interventions/${interventionId}/rapports`)
    return response.data
  }

  /**
   * Obtenir un rapport spécifique
   */
  async getRapportById(rapportId: string): Promise<ApiRapportResponse> {
    const response = await apiClient.get(`/interventions/rapports/${rapportId}`)
    return response.data
  }

  // ==================== Notations ====================

  /**
   * Noter une intervention (école)
   */
  async noterIntervention(
    interventionId: string,
    data: NoterInterventionRequest
  ): Promise<ApiInterventionResponse> {
    const response = await apiClient.put(
      `/interventions/${interventionId}/noter`,
      data
    )
    return response.data
  }

  /**
   * Noter un rapport (admin)
   */
  async noterRapport(
    rapportId: string,
    data: NoterRapportRequest
  ): Promise<ApiRapportResponse> {
    const response = await apiClient.put(
      `/interventions/rapports/${rapportId}/noter`,
      data
    )
    return response.data
  }

  // ==================== Avis ====================

  /**
   * Ajouter un avis sur une intervention
   */
  async ajouterAvisIntervention(
    interventionId: string,
    data: AjouterAvisRequest
  ): Promise<ApiResponse> {
    const response = await apiClient.post(
      `/interventions/${interventionId}/avis`,
      data
    )
    return response.data
  }

  /**
   * Obtenir les avis d'une intervention
   */
  async getAvisIntervention(interventionId: string): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get(`/interventions/${interventionId}/avis`)
    return response.data
  }

  /**
   * Ajouter un avis sur un rapport
   */
  async ajouterAvisRapport(
    rapportId: string,
    data: AjouterAvisRequest
  ): Promise<ApiResponse> {
    const response = await apiClient.post(
      `/interventions/rapports/${rapportId}/avis`,
      data
    )
    return response.data
  }

  /**
   * Obtenir les avis d'un rapport
   */
  async getAvisRapport(rapportId: string): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get(`/interventions/rapports/${rapportId}/avis`)
    return response.data
  }

  // ==================== Recherche et Filtrage ====================

  /**
   * Obtenir les interventions d'un technicien
   */
  async getByTechnicien(technicienId: string): Promise<ApiInterventionsListResponse> {
    const response = await apiClient.get(`/interventions/technicien/${technicienId}`)
    return response.data
  }

  /**
   * Obtenir les interventions d'une école
   */
  async getByEcole(ecoleId: string): Promise<ApiInterventionsListResponse> {
    const response = await apiClient.get(`/interventions/ecole/${ecoleId}`)
    return response.data
  }

  /**
   * Obtenir les interventions par statut
   */
  async getByStatut(statut: string): Promise<ApiInterventionsListResponse> {
    const response = await apiClient.get(`/interventions/statut/${statut}`)
    return response.data
  }

  /**
   * Obtenir les interventions du jour
   */
  async getDuJour(): Promise<ApiInterventionsListResponse> {
    const response = await apiClient.get('/interventions/du-jour')
    return response.data
  }

  /**
   * Obtenir les interventions à venir
   */
  async getAVenir(): Promise<ApiInterventionsListResponse> {
    const response = await apiClient.get('/interventions/a-venir')
    return response.data
  }
}

export default new InterventionService()
