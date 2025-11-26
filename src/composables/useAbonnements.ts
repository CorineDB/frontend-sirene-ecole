import { ref, computed, type Ref } from 'vue'
import abonnementService from '@/services/abonnementService'
import type {
  ApiAbonnement,
  StatutAbonnement,
  CreateAbonnementRequest,
  UpdateAbonnementRequest
} from '@/types/api'

/**
 * Composable pour gérer les abonnements
 */
export function useAbonnements() {
  // État
  const abonnements = ref<ApiAbonnement[]>([])
  const abonnement = ref<ApiAbonnement | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Statistiques
  const stats = ref({
    total_abonnements: 0,
    actifs: 0,
    expires: 0,
    suspendus: 0,
    en_attente: 0,
    revenus_total: 0,
    revenus_mois_courant: 0
  })

  // Computed
  const hasError = computed(() => error.value !== null)
  const isLoading = computed(() => loading.value)
  const hasAbonnements = computed(() => abonnements.value.length > 0)

  // Méthodes utilitaires
  const clearError = () => {
    error.value = null
  }

  const handleError = (err: any) => {
    console.error('Erreur abonnement:', err)
    error.value = err.response?.data?.message || err.message || 'Une erreur est survenue'
  }

  // ==================== CRUD ====================

  /**
   * Charger tous les abonnements
   */
  const fetchAll = async (perPage: number = 15) => {
    loading.value = true
    error.value = null
    try {
      const response = await abonnementService.getAll(perPage)
      if (response.data?.data) {
        abonnements.value = response.data.data
      }
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Charger un abonnement par ID
   */
  const fetchById = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await abonnementService.getById(id)
      if (response.data) {
        abonnement.value = response.data
      }
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Créer un abonnement
   */
  const create = async (data: CreateAbonnementRequest) => {
    loading.value = true
    error.value = null
    try {
      const response = await abonnementService.create(data)
      if (response.data) {
        abonnements.value.unshift(response.data)
      }
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Mettre à jour un abonnement
   */
  const update = async (id: string, data: UpdateAbonnementRequest) => {
    loading.value = true
    error.value = null
    try {
      const response = await abonnementService.update(id, data)
      if (response.data) {
        const index = abonnements.value.findIndex(a => a.id === id)
        if (index !== -1) {
          abonnements.value[index] = response.data
        }
        if (abonnement.value?.id === id) {
          abonnement.value = response.data
        }
      }
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Supprimer un abonnement
   */
  const remove = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await abonnementService.delete(id)
      abonnements.value = abonnements.value.filter(a => a.id !== id)
      if (abonnement.value?.id === id) {
        abonnement.value = null
      }
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // ==================== Cycle de Vie ====================

  /**
   * Renouveler un abonnement
   */
  const renouveler = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await abonnementService.renouveler(id)
      if (response.data) {
        abonnements.value.unshift(response.data)
      }
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Suspendre un abonnement
   */
  const suspendre = async (id: string, raison?: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await abonnementService.suspendre(id, raison)
      if (response.data) {
        const index = abonnements.value.findIndex(a => a.id === id)
        if (index !== -1) {
          abonnements.value[index] = response.data
        }
      }
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Réactiver un abonnement
   */
  const reactiver = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await abonnementService.reactiver(id)
      if (response.data) {
        const index = abonnements.value.findIndex(a => a.id === id)
        if (index !== -1) {
          abonnements.value[index] = response.data
        }
      }
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Annuler un abonnement
   */
  const annuler = async (id: string, raison?: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await abonnementService.annuler(id, raison)
      if (response.data) {
        const index = abonnements.value.findIndex(a => a.id === id)
        if (index !== -1) {
          abonnements.value[index] = response.data
        }
      }
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Activer un abonnement
   */
  const activer = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await abonnementService.activer(id)
      if (response.data) {
        const index = abonnements.value.findIndex(a => a.id === id)
        if (index !== -1) {
          abonnements.value[index] = response.data
        }
      }
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // ==================== Recherche ====================

  /**
   * Charger les abonnements d'une école
   */
  const fetchByEcole = async (ecoleId: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await abonnementService.getByEcole(ecoleId)
      if (response.data?.data) {
        abonnements.value = response.data.data
      }
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Charger les abonnements expirant bientôt
   */
  const fetchExpirantBientot = async (jours: number = 30) => {
    loading.value = true
    error.value = null
    try {
      const response = await abonnementService.getExpirantBientot(jours)
      if (response.data?.data) {
        abonnements.value = response.data.data
      }
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Charger les abonnements actifs
   */
  const fetchActifs = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await abonnementService.getActifs()
      if (response.data?.data) {
        abonnements.value = response.data.data
      }
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Charger les abonnements en attente
   */
  const fetchEnAttente = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await abonnementService.getEnAttente()
      if (response.data?.data) {
        abonnements.value = response.data.data
      }
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // ==================== Statistiques ====================

  /**
   * Charger les statistiques
   */
  const fetchStatistiques = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await abonnementService.getStatistiques()
      if (response.data) {
        stats.value = response.data
      }
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // ==================== QR Code ====================

  /**
   * Régénérer le QR code
   */
  const regenererQrCode = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await abonnementService.regenererQrCode(id)
      // Recharger l'abonnement pour obtenir le nouveau QR code
      if (abonnement.value?.id === id) {
        await fetchById(id)
      }
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Télécharger le QR code
   */
  const telechargerQrCode = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const blob = await abonnementService.telechargerQrCode(id)

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `qr-code-${id}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      return blob
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const partagerQrCode = async (abonnement: ApiAbonnement) => {
    try {
      if (!abonnement.qr_code_path) {
        throw new Error('Aucun QR code disponible')
      }

      const checkoutUrl = `${window.location.origin}/checkout/${abonnement.ecole_id}/${abonnement.id}`
      const blob = await abonnementService.telechargerQrCode(abonnement.id)
      const file = new File([blob], `qr-code-${abonnement.numero_abonnement}.png`, { type: 'image/png' })

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `QR Code - ${abonnement.numero_abonnement}`,
          text: `QR Code de paiement pour l'abonnement ${abonnement.numero_abonnement}\nMontant: ${abonnement.montant} XOF\nLien de paiement: ${checkoutUrl}`,
          files: [file],
        })
      } else {
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `qr-code-${abonnement.numero_abonnement}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(link.href)
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        handleError(err)
        throw err
      }
    }
  }

  // ==================== Token ====================

  /**
   * Régénérer le token ESP8266
   */
  const regenererToken = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await abonnementService.regenererToken(id)
      // Recharger l'abonnement pour obtenir le nouveau token
      if (abonnement.value?.id === id) {
        await fetchById(id)
      }
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // ==================== Helpers ====================

  /**
   * Obtenir le label d'un statut
   */
  const getStatutLabel = (statut: StatutAbonnement): string => {
    const labels: Record<StatutAbonnement, string> = {
      [StatutAbonnement.ACTIF]: 'Actif',
      [StatutAbonnement.EXPIRE]: 'Expiré',
      [StatutAbonnement.SUSPENDU]: 'Suspendu',
      [StatutAbonnement.EN_ATTENTE]: 'En attente'
    }
    return labels[statut] || statut
  }

  /**
   * Obtenir la couleur d'un statut (pour badges)
   */
  const getStatutColor = (statut: StatutAbonnement): string => {
    const colors: Record<StatutAbonnement, string> = {
      [StatutAbonnement.ACTIF]: 'green',
      [StatutAbonnement.EXPIRE]: 'red',
      [StatutAbonnement.SUSPENDU]: 'orange',
      [StatutAbonnement.EN_ATTENTE]: 'blue'
    }
    return colors[statut] || 'gray'
  }

  return {
    // État
    abonnements,
    abonnement,
    loading,
    error,
    stats,

    // Computed
    hasError,
    isLoading,
    hasAbonnements,

    // Méthodes
    clearError,
    fetchAll,
    fetchById,
    create,
    update,
    remove,
    renouveler,
    suspendre,
    reactiver,
    annuler,
    activer,
    fetchByEcole,
    fetchExpirantBientot,
    fetchActifs,
    fetchEnAttente,
    fetchStatistiques,
    regenererQrCode,
    telechargerQrCode,
    partagerQrCode,
    regenererToken,

    // Helpers
    getStatutLabel,
    getStatutColor
  }
}
