# Plan d'Intégration API - OrdreMissionDetailPage

## Vue d'ensemble

Ce document présente le plan d'intégration des 28 handlers frontend avec les endpoints backend, en suivant l'architecture en 3 couches du projet :

**Vue Component → Composable → Service → API Client**

### Architecture
```
OrdreMissionDetailPage.vue (Handler)
    ↓ utilise
useInterventions() / useOrdresMission() (Composable - État réactif + Logique)
    ↓ appelle
interventionService / ordreMissionService (Service - Appels API)
    ↓ utilise
apiClient (Axios avec intercepteurs)
```

### Statistiques
- **Total handlers**: 28
- **✅ Endpoints/Services EXISTANTS**: 9 (32%)
- **🆕 À CRÉER**: 19 méthodes services + 19 méthodes composables + backend (68%)

---

## 1. INTERVENTIONS (12 handlers)

### 1.1 ✅ handleDemarrerIntervention (EXISTANT)

**Backend API**: `PUT /api/interventions/{interventionId}/demarrer` ✅ Existe

**Service**: `interventionService.ts:169` ✅ Existe
```typescript
async demarrer(
  interventionId: string,
  data: DemarrerInterventionRequest
): Promise<ApiInterventionResponse>
```

**Composable**: `useInterventions.ts:264` ✅ Existe
```typescript
const demarrer = async (interventionId: string, technicienId: string) => {
  loading.value = true
  const response = await interventionService.demarrer(interventionId, { technicien_id: technicienId })
  // Met à jour l'état local
  interventions.value[index] = response.data
  loading.value = false
}
```

**Handler à intégrer**: `OrdreMissionDetailPage.vue:1128`
```typescript
const handleDemarrerIntervention = (intervention: any) => {
  const { demarrer } = useInterventions()
  const authStore = useAuthStore()

  showConfirmation(
    'Démarrer l\'intervention',
    `Voulez-vous démarrer l'intervention "${intervention.titre}" ?`,
    async () => {
      try {
        await demarrer(intervention.id, authStore.user.id)
        notificationStore.success('Intervention démarrée avec succès')
        await loadOrdreMission() // Recharger la mission complète
        showConfirmModal.value = false
      } catch (error: any) {
        notificationStore.error(error.message || 'Erreur lors du démarrage')
      }
    }
  )
}
```

---

### 1.2 ✅ handleTerminerIntervention (EXISTANT)

**Backend API**: `PUT /api/interventions/{interventionId}/terminer` ✅ Existe

**Service**: `interventionService.ts:182` ✅ Existe
```typescript
async terminer(
  interventionId: string,
  data: TerminerInterventionRequest
): Promise<ApiInterventionResponse>
```

**Composable**: `useInterventions.ts:287` ✅ Existe
```typescript
const terminer = async (interventionId: string, technicienId: string)
```

**Handler à intégrer**: `OrdreMissionDetailPage.vue:1138`
```typescript
const handleTerminerIntervention = (intervention: any) => {
  const { terminer } = useInterventions()
  const authStore = useAuthStore()

  showConfirmation(
    'Terminer l\'intervention',
    `Voulez-vous terminer l'intervention "${intervention.titre}" ?`,
    async () => {
      try {
        await terminer(intervention.id, authStore.user.id)
        notificationStore.success('Intervention terminée avec succès')
        await loadOrdreMission()
        showConfirmModal.value = false
      } catch (error: any) {
        notificationStore.error(error.message || 'Erreur lors de la terminaison')
      }
    }
  )
}
```

---

### 1.3 ✅ handleRedigerRapport (EXISTANT - Navigation)

**Backend API**: `POST /api/interventions/{interventionId}/rapport` ✅ Existe

**Service**: `interventionService.ts:213` ✅ Existe

**Composable**: `useInterventions.ts:335` ✅ Existe

**Handler**: `OrdreMissionDetailPage.vue:1069` ✅ Déjà implémenté (navigation)
```typescript
const handleRedigerRapport = (intervention: any) => {
  router.push({
    name: 'rapport-intervention',
    params: { interventionId: intervention.id }
  })
}
```
**Note**: Le rapport est créé dans une page dédiée, pas besoin de modification.

---

### 1.4 ✅ handleAvisIntervention (EXISTANT)

**Backend API**: `POST /api/interventions/{interventionId}/avis` ✅ Existe

**Service**: `interventionService.ts:275` ✅ Existe
```typescript
async ajouterAvisIntervention(
  interventionId: string,
  data: AjouterAvisRequest
): Promise<ApiResponse>
```

**Composable**: 🆕 À AJOUTER dans `useInterventions.ts`
```typescript
/**
 * Ajouter un avis sur une intervention
 */
const ajouterAvis = async (interventionId: string, data: {
  note: number
  commentaire: string
  recommande: boolean
}) => {
  loading.value = true
  error.value = null
  try {
    const response = await interventionService.ajouterAvisIntervention(interventionId, data)
    notificationStore.success('Avis ajouté avec succès')
    return response
  } catch (err) {
    handleError(err)
    throw err
  } finally {
    loading.value = false
  }
}
```

**Handler à intégrer**: `OrdreMissionDetailPage.vue:1148`
```typescript
const handleAvisIntervention = (intervention: any) => {
  const { ajouterAvis } = useInterventions()

  // Ouvrir modal avec formulaire
  showModal.value = true
  modalContent.value = {
    title: 'Ajouter un avis sur l\'intervention',
    component: 'AvisInterventionForm',
    data: { interventionId: intervention.id },
    onSubmit: async (formData: {
      note: number
      commentaire: string
      recommande: boolean
    }) => {
      try {
        await ajouterAvis(intervention.id, formData)
        await loadOrdreMission()
        showModal.value = false
      } catch (error: any) {
        notificationStore.error(error.message || 'Erreur lors de l\'ajout de l\'avis')
      }
    }
  }
}
```

---

### 1.5 🆕 handleAjouterIntervention (À CRÉER)

**Backend API**: 🆕 `POST /api/ordres-mission/{ordreMissionId}/interventions`

**Backend à créer**:
```java
@PostMapping("/{ordreMissionId}/interventions")
@PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIEN')")
public ResponseEntity<InterventionResponse> ajouterIntervention(
    @PathVariable String ordreMissionId,
    @RequestBody @Valid CreateInterventionManuelleRequest request
) {
    // Logique de création
}
```

**Service**: 🆕 À AJOUTER dans `ordreMissionService.ts`
```typescript
/**
 * Ajouter une intervention à un ordre de mission
 */
async ajouterIntervention(
  ordreMissionId: string,
  data: {
    titre: string
    description: string
    typeIntervention: string
    priorite: string
  }
): Promise<ApiOrdreMissionResponse> {
  const response = await apiClient.post(
    `/ordres-mission/${ordreMissionId}/interventions`,
    data
  )
  return response.data
}
```

**Composable**: 🆕 À AJOUTER dans `useOrdresMission.ts`
```typescript
/**
 * Ajouter une intervention à un ordre de mission
 */
const ajouterIntervention = async (
  ordreMissionId: string,
  data: {
    titre: string
    description: string
    typeIntervention: string
    priorite: string
  }
) => {
  try {
    isLoading.value = true
    error.value = null
    const response = await ordreMissionService.ajouterIntervention(ordreMissionId, data)
    if (response.success) {
      await fetchById(ordreMissionId) // Recharger l'ordre de mission
    }
    return response
  } catch (err) {
    handleError(err)
    throw err
  } finally {
    isLoading.value = false
  }
}
```

**Handler à intégrer**: `OrdreMissionDetailPage.vue:1088`
```typescript
const handleAjouterIntervention = () => {
  const { ajouterIntervention } = useOrdresMission()

  // Ouvrir modal avec formulaire
  showModal.value = true
  modalContent.value = {
    title: 'Ajouter une intervention',
    component: 'InterventionForm',
    data: { ordreMissionId: ordreMission.value?.id },
    onSubmit: async (formData: {
      titre: string
      description: string
      typeIntervention: string
      priorite: string
    }) => {
      try {
        await ajouterIntervention(ordreMission.value!.id, formData)
        notificationStore.success('Intervention ajoutée avec succès')
        await loadOrdreMission()
        showModal.value = false
      } catch (error: any) {
        notificationStore.error(error.message || 'Erreur lors de l\'ajout')
      }
    }
  }
}
```

---

### 1.6 🆕 handleModifierIntervention (À CRÉER)

**Backend API**: 🆕 `PUT /api/interventions/{interventionId}`

**Backend à créer**:
```java
@PutMapping("/{interventionId}")
@PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIEN')")
public ResponseEntity<InterventionResponse> modifierIntervention(
    @PathVariable String interventionId,
    @RequestBody @Valid ModifierInterventionRequest request
) {
    // Validation: seules les interventions EN_ATTENTE ou PLANIFIEE peuvent être modifiées
}
```

**Service**: 🆕 À AJOUTER dans `interventionService.ts`
```typescript
/**
 * Modifier une intervention
 */
async modifier(
  interventionId: string,
  data: {
    titre?: string
    description?: string
    typeIntervention?: string
    priorite?: string
  }
): Promise<ApiInterventionResponse> {
  const response = await apiClient.put(`/interventions/${interventionId}`, data)
  return response.data
}
```

**Composable**: 🆕 À AJOUTER dans `useInterventions.ts`
```typescript
/**
 * Modifier une intervention
 */
const modifier = async (interventionId: string, data: any) => {
  loading.value = true
  error.value = null
  try {
    const response = await interventionService.modifier(interventionId, data)
    if (response.data) {
      const index = interventions.value.findIndex(i => i.id === interventionId)
      if (index !== -1) {
        interventions.value[index] = response.data
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
```

**Handler à intégrer**: `OrdreMissionDetailPage.vue:1098`
```typescript
const handleModifierIntervention = (intervention: any) => {
  const { modifier } = useInterventions()

  showModal.value = true
  modalContent.value = {
    title: 'Modifier l\'intervention',
    component: 'InterventionForm',
    data: {
      intervention: { ...intervention } // Pré-remplir le formulaire
    },
    onSubmit: async (formData: any) => {
      try {
        await modifier(intervention.id, formData)
        notificationStore.success('Intervention modifiée avec succès')
        await loadOrdreMission()
        showModal.value = false
      } catch (error: any) {
        notificationStore.error(error.message || 'Erreur lors de la modification')
      }
    }
  }
}
```

---

### 1.7 🆕 handlePlanifierIntervention (À CRÉER)

**Backend API**: 🆕 `PUT /api/interventions/{interventionId}/planifier`

**Service**: ✅ EXISTE DÉJÀ `interventionService.ts:153`
```typescript
async planifier(
  interventionId: string,
  data: PlanifierInterventionRequest
): Promise<ApiInterventionResponse>
```

**Composable**: ✅ EXISTE DÉJÀ `useInterventions.ts:205`

**Handler à intégrer**: `OrdreMissionDetailPage.vue:1108`
```typescript
const handlePlanifierIntervention = (intervention: any) => {
  const { planifier } = useInterventions()

  showModal.value = true
  modalContent.value = {
    title: 'Planifier l\'intervention',
    component: 'PlanifierInterventionForm',
    data: { interventionId: intervention.id },
    onSubmit: async (formData: {
      datePrevue: string
      dureeEstimee: number
    }) => {
      try {
        await planifier(intervention.id, formData)
        notificationStore.success('Intervention planifiée avec succès')
        await loadOrdreMission()
        showModal.value = false
      } catch (error: any) {
        notificationStore.error(error.message || 'Erreur lors de la planification')
      }
    }
  }
}
```

**Note**: Le service et composable existent déjà ! Seul le backend doit être créé.

---

### 1.8 🆕 handleReporterIntervention (À CRÉER)

**Backend API**: 🆕 `PUT /api/interventions/{interventionId}/reporter`

**Service**: 🆕 À AJOUTER dans `interventionService.ts`
```typescript
/**
 * Reporter une intervention
 */
async reporter(
  interventionId: string,
  data: {
    nouvelleDatePrevue: string
    motif: string
  }
): Promise<ApiInterventionResponse> {
  const response = await apiClient.put(
    `/interventions/${interventionId}/reporter`,
    data
  )
  return response.data
}
```

**Composable**: 🆕 À AJOUTER dans `useInterventions.ts`
```typescript
const reporter = async (interventionId: string, data: {
  nouvelleDatePrevue: string
  motif: string
}) => {
  loading.value = true
  try {
    const response = await interventionService.reporter(interventionId, data)
    if (response.data) {
      const index = interventions.value.findIndex(i => i.id === interventionId)
      if (index !== -1) {
        interventions.value[index] = response.data
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
```

**Handler à intégrer**: `OrdreMissionDetailPage.vue:1118`
```typescript
const handleReporterIntervention = (intervention: any) => {
  const { reporter } = useInterventions()

  showModal.value = true
  modalContent.value = {
    title: 'Reporter l\'intervention',
    component: 'ReporterInterventionForm',
    data: { intervention },
    onSubmit: async (formData: {
      nouvelleDatePrevue: string
      motif: string
    }) => {
      try {
        await reporter(intervention.id, formData)
        notificationStore.success('Intervention reportée avec succès')
        await loadOrdreMission()
        showModal.value = false
      } catch (error: any) {
        notificationStore.error(error.message || 'Erreur lors du report')
      }
    }
  }
}
```

---

### 1.9 🆕 handleConfirmerIntervention (À CRÉER)

**Backend API**: 🆕 `PUT /api/interventions/{interventionId}/confirmer`

**Service**: 🆕 À AJOUTER dans `interventionService.ts`
```typescript
async confirmer(interventionId: string): Promise<ApiInterventionResponse> {
  const response = await apiClient.put(`/interventions/${interventionId}/confirmer`, {})
  return response.data
}
```

**Composable**: 🆕 À AJOUTER dans `useInterventions.ts`

**Handler à intégrer**: `OrdreMissionDetailPage.vue:1158`

---

### 1.10 🆕 handleAjouterIntervenantIntervention (À CRÉER)

**Backend API**: 🆕 `POST /api/interventions/{interventionId}/intervenants`

**Service**: ✅ EXISTE `interventionService.ts:126` (nommé `assignerTechnicien`)

**Composable**: ✅ EXISTE `useInterventions.ts:228`

**Handler à intégrer**: `OrdreMissionDetailPage.vue:1168`
```typescript
const handleAjouterIntervenantIntervention = (intervention: any) => {
  const { assignerTechnicien } = useInterventions()

  showModal.value = true
  modalContent.value = {
    title: 'Ajouter un intervenant',
    component: 'SelectTechnicienForm',
    data: { interventionId: intervention.id },
    onSubmit: async (technicienId: string) => {
      try {
        await assignerTechnicien(intervention.id, technicienId)
        notificationStore.success('Intervenant ajouté avec succès')
        await loadOrdreMission()
        showModal.value = false
      } catch (error: any) {
        notificationStore.error(error.message || 'Erreur lors de l\'ajout')
      }
    }
  }
}
```

**Note**: Le service existe déjà sous le nom `assignerTechnicien` ! Seul le backend doit être créé.

---

### 1.11 🆕 handleRetirerIntervenantIntervention (À CRÉER)

**Backend API**: 🆕 `DELETE /api/interventions/{interventionId}/intervenants/{technicienId}`

**Service**: ✅ EXISTE `interventionService.ts:140` (nommé `retirerTechnicien`)

**Composable**: ✅ EXISTE `useInterventions.ts:245`

**Handler à intégrer**: `OrdreMissionDetailPage.vue:1178`
```typescript
const handleRetirerIntervenantIntervention = (intervention: any, technicien: any) => {
  const { retirerTechnicien } = useInterventions()

  showConfirmation(
    'Retirer l\'intervenant',
    `Voulez-vous retirer ${technicien.nom} de cette intervention ?`,
    async () => {
      try {
        await retirerTechnicien(intervention.id, technicien.id)
        notificationStore.success('Intervenant retiré avec succès')
        await loadOrdreMission()
        showConfirmModal.value = false
      } catch (error: any) {
        notificationStore.error(error.message || 'Erreur lors du retrait')
      }
    }
  )
}
```

---

### 1.12 🆕 handleSupprimerIntervention (À CRÉER)

**Backend API**: 🆕 `DELETE /api/interventions/{interventionId}`

**Service**: 🆕 À AJOUTER dans `interventionService.ts`
```typescript
async supprimer(interventionId: string): Promise<ApiResponse> {
  const response = await apiClient.delete(`/interventions/${interventionId}`)
  return response.data
}
```

**Composable**: 🆕 À AJOUTER dans `useInterventions.ts`
```typescript
const supprimer = async (interventionId: string) => {
  loading.value = true
  try {
    await interventionService.supprimer(interventionId)
    // Retirer de la liste locale
    interventions.value = interventions.value.filter(i => i.id !== interventionId)
  } catch (err) {
    handleError(err)
    throw err
  } finally {
    loading.value = false
  }
}
```

**Handler à intégrer**: `OrdreMissionDetailPage.vue:1188`

---

## 2. CANDIDATURES (5 handlers)

### 2.1 ✅ handlePostuler (EXISTANT)

**Backend API**: ✅ `POST /api/interventions/ordres-mission/{ordreMissionId}/candidature`

**Service**: ✅ EXISTE `interventionService.ts:54`

**Composable**: ✅ EXISTE `useInterventions.ts:112`

**Handler**: ✅ DÉJÀ INTÉGRÉ `OrdreMissionDetailPage.vue:907`

---

### 2.2 ✅ handleCloturerCandidatures (EXISTANT)

**Backend API**: ✅ `PUT /api/ordres-mission/{id}/cloturer-candidatures`

**Service**: ✅ EXISTE `ordreMissionService.ts:70`

**Composable**: ✅ EXISTE `useOrdresMission.ts:150`

**Handler**: ✅ DÉJÀ INTÉGRÉ `OrdreMissionDetailPage.vue:946`

---

### 2.3 ✅ handleRouvrirCandidatures (EXISTANT)

**Backend API**: ✅ `PUT /api/ordres-mission/{id}/rouvrir-candidatures`

**Service**: ✅ EXISTE `ordreMissionService.ts:78`

**Composable**: ✅ EXISTE `useOrdresMission.ts:170`

**Handler**: ✅ DÉJÀ INTÉGRÉ `OrdreMissionDetailPage.vue:946`

---

### 2.4 ✅ handleAnnulerCandidature (EXISTANT)

**Backend API**: ✅ `PUT /api/interventions/candidatures/{missionTechnicienId}/retirer`

**Service**: ✅ EXISTE `interventionService.ts:96`

**Composable**: ✅ EXISTE `useInterventions.ts:166`

**Handler**: ✅ DÉJÀ INTÉGRÉ `OrdreMissionDetailPage.vue:963`

---

### 2.5 ✅ handleAccepterCandidat (EXISTANT)

**Backend API**: ✅ `PUT /api/interventions/candidatures/{missionTechnicienId}/accepter`

**Service**: ✅ EXISTE `interventionService.ts:68`

**Composable**: ✅ EXISTE `useInterventions.ts:132`

**Handler**: ✅ DÉJÀ INTÉGRÉ `OrdreMissionDetailPage.vue:980`

---

### 2.6 ✅ handleRefuserCandidat (EXISTANT)

**Backend API**: ✅ `PUT /api/interventions/candidatures/{missionTechnicienId}/refuser`

**Service**: ✅ EXISTE `interventionService.ts:82`

**Composable**: ✅ EXISTE `useInterventions.ts:149`

**Handler**: ✅ DÉJÀ INTÉGRÉ `OrdreMissionDetailPage.vue:1012`

---

## 3. INTERVENANTS SUR MISSION (4 handlers)

### 3.1 🆕 handleAjouterTechnicien (À CRÉER)

**Backend API**: 🆕 `POST /api/ordres-mission/{ordreMissionId}/techniciens`

**Service**: 🆕 À AJOUTER dans `ordreMissionService.ts`
```typescript
async ajouterTechnicien(
  ordreMissionId: string,
  technicienId: string
): Promise<ApiOrdreMissionResponse> {
  const response = await apiClient.post(
    `/ordres-mission/${ordreMissionId}/techniciens`,
    { technicienId }
  )
  return response.data
}
```

**Composable**: 🆕 À AJOUTER dans `useOrdresMission.ts`

**Handler à intégrer**: `OrdreMissionDetailPage.vue:1044`

---

### 3.2 🆕 handleSuspendreIntervenant (À CRÉER)

**Backend API**: 🆕 `PUT /api/ordres-mission/{ordreMissionId}/techniciens/{technicienId}/suspendre`

**Service**: 🆕 À AJOUTER dans `ordreMissionService.ts`

**Composable**: 🆕 À AJOUTER dans `useOrdresMission.ts`

**Handler à intégrer**: `OrdreMissionDetailPage.vue:1054`

---

### 3.3 🆕 handleRetirerIntervenant (À CRÉER)

**Backend API**: 🆕 `DELETE /api/ordres-mission/{ordreMissionId}/techniciens/{technicienId}`

**Service**: 🆕 À AJOUTER dans `ordreMissionService.ts`
```typescript
async retirerTechnicien(
  ordreMissionId: string,
  technicienId: string,
  motif: string
): Promise<ApiOrdreMissionResponse> {
  const response = await apiClient.delete(
    `/ordres-mission/${ordreMissionId}/techniciens/${technicienId}`,
    { data: { motif } }
  )
  return response.data
}
```

**Composable**: 🆕 À AJOUTER dans `useOrdresMission.ts`

**Handler à intégrer**: `OrdreMissionDetailPage.vue:1064`

---

## 4. VUE D'ENSEMBLE - MISSIONS (7 handlers)

### 4.1 🆕 handleModifierMission (À CRÉER)

**Backend API**: 🆕 `PUT /api/ordres-mission/{id}` (endpoint complet avec validation statut)

**Service**: ✅ EXISTE `ordreMissionService.ts:44`
```typescript
async update(id: string, data: Partial<ApiOrdreMission>): Promise<ApiOrdreMissionResponse>
```

**Composable**: ✅ EXISTE `useOrdresMission.ts:93`

**Handler à intégrer**: `OrdreMissionDetailPage.vue:1198`
```typescript
const handleModifierMission = () => {
  const { update } = useOrdresMission()

  showModal.value = true
  modalContent.value = {
    title: 'Modifier la mission',
    component: 'OrdreMissionForm',
    data: { ordreMission: { ...ordreMission.value } },
    onSubmit: async (formData: any) => {
      try {
        await update(ordreMission.value!.id, formData)
        notificationStore.success('Mission modifiée avec succès')
        await loadOrdreMission()
        showModal.value = false
      } catch (error: any) {
        notificationStore.error(error.message || 'Erreur lors de la modification')
      }
    }
  }
}
```

**Note**: Le service et composable existent ! Il faut juste créer le backend.

---

### 4.2 🆕 handleDemarrerMission (À CRÉER)

**Backend API**: 🆕 `PUT /api/ordres-mission/{id}/demarrer`

**Service**: 🆕 À AJOUTER dans `ordreMissionService.ts`
```typescript
async demarrer(id: string): Promise<ApiOrdreMissionResponse> {
  const response = await apiClient.put(`/ordres-mission/${id}/demarrer`, {})
  return response.data
}
```

**Composable**: 🆕 À AJOUTER dans `useOrdresMission.ts`

**Handler à intégrer**: `OrdreMissionDetailPage.vue:1076`

---

### 4.3 🆕 handleTerminerMission (À CRÉER)

**Backend API**: 🆕 `PUT /api/ordres-mission/{id}/terminer`

**Service**: 🆕 À AJOUTER dans `ordreMissionService.ts`

**Composable**: 🆕 À AJOUTER dans `useOrdresMission.ts`

**Handler à intégrer**: `OrdreMissionDetailPage.vue:1208`

---

### 4.4 🆕 handleCloturerMission (À CRÉER)

**Backend API**: 🆕 `PUT /api/ordres-mission/{id}/cloturer`

**Service**: 🆕 À AJOUTER dans `ordreMissionService.ts`

**Composable**: 🆕 À AJOUTER dans `useOrdresMission.ts`

**Handler à intégrer**: `OrdreMissionDetailPage.vue:1218`

---

### 4.5 🆕 handleAvisMission (À CRÉER)

**Backend API**: 🆕 `POST /api/ordres-mission/{id}/avis`

**Service**: 🆕 À AJOUTER dans `ordreMissionService.ts`

**Composable**: 🆕 À AJOUTER dans `useOrdresMission.ts`

**Handler**: Nouveau handler à créer dans `OrdreMissionDetailPage.vue`

---

### 4.6 🆕 handlePanneResolue (À CRÉER)

**Backend API**: 🆕 `PUT /api/ordres-mission/{id}/panne-resolue`

**Service**: 🆕 À AJOUTER dans `ordreMissionService.ts`

**Composable**: 🆕 À AJOUTER dans `useOrdresMission.ts`

**Handler**: Nouveau handler à créer dans `OrdreMissionDetailPage.vue`

---

### 4.7 🆕 handleSupprimerMission (À CRÉER)

**Backend API**: 🆕 `DELETE /api/ordres-mission/{id}` (avec validation statut)

**Service**: ✅ EXISTE `ordreMissionService.ts:52`
```typescript
async delete(id: string): Promise<ApiResponse>
```

**Composable**: ✅ EXISTE `useOrdresMission.ts:113` (nommé `deleteOrdreMission`)

**Handler**: Nouveau handler à créer dans `OrdreMissionDetailPage.vue`
```typescript
const handleSupprimerMission = () => {
  const { deleteOrdreMission } = useOrdresMission()

  showConfirmation(
    'Supprimer la mission',
    'Êtes-vous sûr de vouloir supprimer cette mission ? Cette action est irréversible.',
    async () => {
      try {
        await deleteOrdreMission(ordreMission.value!.id)
        notificationStore.success('Mission supprimée avec succès')
        router.push('/ordres-mission')
        showConfirmModal.value = false
      } catch (error: any) {
        notificationStore.error(error.message || 'Erreur lors de la suppression')
      }
    }
  )
}
```

---

## 📊 RÉSUMÉ D'IMPLÉMENTATION

### Services (interventionService.ts)

**À AJOUTER** (7 méthodes):
1. `modifier(interventionId, data)` - Modifier intervention
2. `reporter(interventionId, data)` - Reporter intervention
3. `confirmer(interventionId)` - Confirmer intervention
4. `supprimer(interventionId)` - Supprimer intervention
5. Autres déjà existantes...

**DÉJÀ EXISTANTS** (12 méthodes):
- `demarrer()`, `terminer()`, `planifier()`
- `assignerTechnicien()`, `retirerTechnicien()`
- `soumettreCandidature()`, `accepterCandidature()`, `refuserCandidature()`, `retirerCandidature()`
- `redigerRapport()`, `ajouterAvisIntervention()`

### Services (ordreMissionService.ts)

**À AJOUTER** (8 méthodes):
1. `ajouterIntervention(ordreMissionId, data)` - Ajouter intervention
2. `ajouterTechnicien(ordreMissionId, technicienId)` - Ajouter technicien
3. `suspendreIntervenant(ordreMissionId, technicienId, data)` - Suspendre
4. `retirerTechnicien(ordreMissionId, technicienId, motif)` - Retirer technicien
5. `demarrer(id)` - Démarrer mission
6. `terminer(id)` - Terminer mission
7. `cloturer(id)` - Clôturer mission
8. `ajouterAvis(id, data)` - Ajouter avis

**DÉJÀ EXISTANTS** (7 méthodes):
- `getAll()`, `getById()`, `create()`, `update()`, `delete()`
- `cloturerCandidatures()`, `rouvrirCandidatures()`

### Composables

**useInterventions**: Ajouter 7 méthodes correspondantes
**useOrdresMission**: Ajouter 8 méthodes correspondantes

### Backend

**19 endpoints à créer** (voir section priorités ci-dessous)

---

## 🎯 PRIORITÉS D'IMPLÉMENTATION

### Phase 1 - HAUTE PRIORITÉ (Sprint 1)

**Backend + Services + Composables**:
1. Cycle de vie missions: `demarrer`, `terminer`, `cloturer`
2. CRUD interventions: `ajouterIntervention`, `modifier`, `supprimer`
3. Planification: `planifier` (backend seulement, service existe), `reporter`

### Phase 2 - MOYENNE PRIORITÉ (Sprint 2)

**Backend + Services + Composables**:
4. Gestion techniciens: `ajouterTechnicien`, `retirerTechnicien`
5. Gestion intervenants intervention: `assignerTechnicien` (backend seulement), `retirerTechnicien` (backend seulement)

### Phase 3 - BASSE PRIORITÉ (Sprint 3)

**Backend + Services + Composables**:
6. Fonctionnalités avancées: `confirmer`, `ajouterAvis` (mission), `suspendreIntervenant`

---

## ✅ CHECKLIST PAR FEATURE

Pour chaque nouvelle fonctionnalité:

### Backend
- [ ] Créer le controller endpoint
- [ ] Implémenter la logique métier
- [ ] Valider les statuts et rôles
- [ ] Créer les DTOs Request/Response
- [ ] Tests unitaires
- [ ] Tests d'intégration
- [ ] Documentation OpenAPI

### Frontend - Service
- [ ] Ajouter la méthode dans le service approprié
- [ ] Typer les Request/Response
- [ ] Gérer les erreurs

### Frontend - Composable
- [ ] Ajouter la méthode dans le composable
- [ ] Gérer loading state
- [ ] Mettre à jour l'état local après succès
- [ ] Gérer les erreurs

### Frontend - Handler (Vue Component)
- [ ] Remplacer le `TODO` par l'appel au composable
- [ ] Ajouter confirmation si nécessaire
- [ ] Créer le modal/formulaire si nécessaire
- [ ] Recharger les données après succès
- [ ] Afficher les notifications succès/erreur

---

## 🚀 EXEMPLE COMPLET D'IMPLÉMENTATION

### Exemple: handleDemarrerMission

#### 1. Backend (Spring Boot)
```java
@PutMapping("/{id}/demarrer")
@PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIEN')")
public ResponseEntity<OrdreMissionResponse> demarrerMission(@PathVariable String id) {
    OrdreMission mission = ordreMissionRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Mission non trouvée"));

    if (mission.getStatut() != StatutMission.EN_ATTENTE) {
        throw new IllegalStateException("Seules les missions EN_ATTENTE peuvent être démarrées");
    }

    mission.setStatut(StatutMission.EN_COURS);
    mission.setDateDemarrage(LocalDateTime.now());

    OrdreMission saved = ordreMissionRepository.save(mission);
    return ResponseEntity.ok(ordreMissionMapper.toResponse(saved));
}
```

#### 2. Service (TypeScript)
```typescript
// ordreMissionService.ts
async demarrer(id: string): Promise<ApiOrdreMissionResponse> {
  const response = await apiClient.put(`/ordres-mission/${id}/demarrer`, {})
  return response.data
}
```

#### 3. Composable (TypeScript)
```typescript
// useOrdresMission.ts
const demarrer = async (id: string) => {
  try {
    isLoading.value = true
    error.value = null
    const response = await ordreMissionService.demarrer(id)
    if (response.success) {
      await fetchById(id) // Recharger
    }
    return response
  } catch (err) {
    handleError(err)
    throw err
  } finally {
    isLoading.value = false
  }
}

// Export
return {
  // ...
  demarrer
}
```

#### 4. Handler (Vue Component)
```typescript
// OrdreMissionDetailPage.vue
const handleDemarrerMission = () => {
  const { demarrer } = useOrdresMission()

  showConfirmation(
    'Démarrer la mission',
    'Voulez-vous démarrer cette mission ?',
    async () => {
      try {
        await demarrer(ordreMission.value!.id)
        notificationStore.success('Mission démarrée avec succès')
        await loadOrdreMission()
        showConfirmModal.value = false
      } catch (error: any) {
        notificationStore.error(error.message || 'Erreur lors du démarrage')
      }
    }
  )
}
```

---

**Document créé le**: 2025-11-25
**Version**: 2.0 (Architecture Composable/Service)
**Auteur**: Claude AI
**Statut**: À valider par l'équipe
