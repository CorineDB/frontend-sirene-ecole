import type { Abonnement, StatutAbonnement } from '@/types/api'

export function useAbonnementRules() {
  const isExpired = (abonnement: Abonnement): boolean => {
    return new Date(abonnement.date_fin) < new Date()
  }

  const hasValidPayment = (abonnement: Abonnement): boolean => {
    return abonnement.paiements?.some(p => p.statut === 'valide') || false
  }

  const canBeRenewed = (abonnement: Abonnement): boolean => {
    const allowedStatuts: StatutAbonnement[] = ['expire', 'annule']
    return allowedStatuts.includes(abonnement.statut as StatutAbonnement)
  }

  const canBeCancelled = (abonnement: Abonnement): boolean => {
    const forbiddenStatuts: StatutAbonnement[] = ['expire', 'annule']
    return !forbiddenStatuts.includes(abonnement.statut as StatutAbonnement)
  }

  const canBeSuspended = (abonnement: Abonnement): boolean => {
    return abonnement.statut === 'actif'
  }

  const canBeReactivated = (abonnement: Abonnement): boolean => {
    return abonnement.statut === 'suspendu' && !isExpired(abonnement)
  }

  const canBeActivated = (abonnement: Abonnement): boolean => {
    return abonnement.statut === 'en_attente' && hasValidPayment(abonnement)
  }

  return {
    canBeRenewed,
    canBeCancelled,
    canBeSuspended,
    canBeReactivated,
    canBeActivated
  }
}
