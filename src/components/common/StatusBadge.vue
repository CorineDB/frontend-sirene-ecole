<template>
  <Badge :color="statusColor">
    {{ statusLabel }}
  </Badge>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Badge from './Badge.vue'
import type {
  StatutAbonnement,
  StatutPanne,
  PrioritePanne,
  StatutIntervention,
  ResultatIntervention,
  StatutOrdreMission,
  StatutCandidature
} from '@/types/api'

interface Props {
  type: 'abonnement' | 'panne' | 'priorite' | 'intervention' | 'resultat' | 'ordre-mission' | 'candidature'
  status: StatutAbonnement | StatutPanne | PrioritePanne | StatutIntervention | ResultatIntervention | StatutOrdreMission | StatutCandidature | string
}

const props = defineProps<Props>()

const statusLabel = computed(() => {
  if (props.type === 'abonnement') {
    const labels: Record<string, string> = {
      'actif': 'Actif',
      'expire': 'Expiré',
      'suspendu': 'Suspendu',
      'en_attente': 'En attente'
    }
    return labels[props.status] || props.status
  }

  if (props.type === 'panne') {
    const labels: Record<string, string> = {
      'declaree': 'Déclarée',
      'validee': 'Validée',
      'assignee': 'Assignée',
      'en_cours': 'En cours',
      'resolue': 'Résolue',
      'cloturee': 'Clôturée'
    }
    return labels[props.status] || props.status
  }

  if (props.type === 'priorite') {
    const labels: Record<string, string> = {
      'basse': 'Basse',
      'moyenne': 'Moyenne',
      'haute': 'Haute',
      'urgente': 'Urgente'
    }
    return labels[props.status] || props.status
  }

  if (props.type === 'intervention') {
    const labels: Record<string, string> = {
      'planifiee': 'Planifiée',
      'assignee': 'Assignée',
      'acceptee': 'Acceptée',
      'en_cours': 'En cours',
      'terminee': 'Terminée',
      'annulee': 'Annulée'
    }
    return labels[props.status] || props.status
  }

  if (props.type === 'resultat') {
    const labels: Record<string, string> = {
      'resolu': 'Résolu',
      'partiellement_resolu': 'Partiellement résolu',
      'non_resolu': 'Non résolu'
    }
    return labels[props.status] || props.status
  }

  if (props.type === 'ordre-mission') {
    const labels: Record<string, string> = {
      'en_attente': 'En attente',
      'en_cours': 'En cours',
      'termine': 'Terminé',
      'cloture': 'Clôturé'
    }
    return labels[props.status] || props.status
  }

  if (props.type === 'candidature') {
    const labels: Record<string, string> = {
      'en_attente': 'En attente',
      'acceptee': 'Acceptée',
      'refusee': 'Refusée',
      'retiree': 'Retirée'
    }
    return labels[props.status] || props.status
  }

  return props.status
})

const statusColor = computed(() => {
  if (props.type === 'abonnement') {
    const colors: Record<string, any> = {
      'actif': 'green',
      'expire': 'red',
      'suspendu': 'orange',
      'en_attente': 'blue'
    }
    return colors[props.status] || 'gray'
  }

  if (props.type === 'panne') {
    const colors: Record<string, any> = {
      'declaree': 'blue',
      'validee': 'indigo',
      'assignee': 'purple',
      'en_cours': 'yellow',
      'resolue': 'green',
      'cloturee': 'gray'
    }
    return colors[props.status] || 'gray'
  }

  if (props.type === 'priorite') {
    const colors: Record<string, any> = {
      'basse': 'gray',
      'moyenne': 'yellow',
      'haute': 'orange',
      'urgente': 'red'
    }
    return colors[props.status] || 'gray'
  }

  if (props.type === 'intervention') {
    const colors: Record<string, any> = {
      'planifiee': 'blue',
      'assignee': 'indigo',
      'acceptee': 'purple',
      'en_cours': 'yellow',
      'terminee': 'green',
      'annulee': 'red'
    }
    return colors[props.status] || 'gray'
  }

  if (props.type === 'resultat') {
    const colors: Record<string, any> = {
      'resolu': 'green',
      'partiellement_resolu': 'yellow',
      'non_resolu': 'red'
    }
    return colors[props.status] || 'gray'
  }

  if (props.type === 'ordre-mission') {
    const colors: Record<string, any> = {
      'en_attente': 'yellow',
      'en_cours': 'blue',
      'termine': 'green',
      'cloture': 'gray'
    }
    return colors[props.status] || 'gray'
  }

  if (props.type === 'candidature') {
    const colors: Record<string, any> = {
      'en_attente': 'yellow',
      'acceptee': 'green',
      'refusee': 'red',
      'retiree': 'gray'
    }
    return colors[props.status] || 'gray'
  }

  return 'gray'
})
</script>
